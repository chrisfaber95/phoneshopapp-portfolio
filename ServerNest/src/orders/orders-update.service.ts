import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { AppEnv } from '../config/env.validation';
import { asRecord, pick } from '../customers/customer-fields';
import { CustomerHasSpaaractie, Discounts, Order, OrderHasProduct, Spaaractie } from '../database/models';
import { MailService } from '../mail/mail.service';
import { pickedTemplate } from '../mail/mail-bodies';
import { OrderMailInfo } from '../mail/mail.types';
import { MollieService } from '../payments/mollie.service';
import { calculateDiscountPrices, DiscountListEntry, PricedLine, updateProductPrice } from '../pricing/pricing';
import { discounts } from '../products/product-includes';
import { NEW_LINE_FIELDS, OrderUpdateError, lineChanges, orderChanges } from './order-update-input';
import { orderWhere } from './order-reference';
import { OrdersService } from './orders.service';

const cents = (value: unknown): number => Math.round(Number(value) * 100);

@Injectable()
export class OrdersUpdateService {
  private readonly logger = new Logger(OrdersUpdateService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Order) private readonly orders: typeof Order,
    @InjectModel(OrderHasProduct) private readonly lines: typeof OrderHasProduct,
    @InjectModel(Discounts) private readonly discountList: typeof Discounts,
    @InjectModel(Spaaractie) private readonly spaaracties: typeof Spaaractie,
    @InjectModel(CustomerHasSpaaractie) private readonly customerSpaaracties: typeof CustomerHasSpaaractie,
    private readonly reading: OrdersService,
    private readonly crypto: CryptoService,
    private readonly mollie: MollieService,
    private readonly mail: MailService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  // PUT /order/:orderRef. The body names what to do (`type`):
  //  - Onlinepayment: the customer pays the final price through the link in the pick-up mail (public: the encrypted reference in
  //    the link is the proof). Everything else is for employees and was open to anyone in the old Server.
  //  - Update: save an order from the picking/scanning app, recalculate the prices, mail/stamps on the status change.
  //  - Product: add a product to an order.
  //  - Storepayment: mark an order as paid at the counter.
  async update(principal: Principal | null, orderRef: string, body: unknown): Promise<unknown> {
    const input = asRecord(body);
    if (input.type === 'Onlinepayment') return this.onlinePayment(orderRef);

    if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
    if (principal.type !== 'user') throw new ForbiddenException({ error: 'Not allowed' });

    try {
      switch (input.type) {
        case 'Update':
          return await this.updateOrder(orderRef, input.order);
        case 'Product':
          return await this.addProduct(orderRef, input.product);
        case 'Storepayment':
          return await this.storePayment(orderRef, input.picker);
        default:
          throw new BadRequestException({ error: 'Unknown type' });
      }
    } catch (error) {
      if (error instanceof OrderUpdateError) throw new BadRequestException({ error: error.message });
      throw error;
    }
  }

  // The second payment: only an order that is `scanned` (picked, final price known) can be paid. Any other order is just answered.
  private async onlinePayment(orderRef: string): Promise<unknown> {
    const where = orderWhere(orderRef, this.crypto);
    const order = where ? await this.orders.findOne({ where, logging: false }) : null;
    if (!order) return { err: 'Order not found' };

    if (order.status !== 'scanned' || !(Number(order.finalPrice) > 0)) return this.reading.single(order.uuid_id);

    const information = await order.$get('order_information', { logging: false });
    try {
      const payment = await this.mollie.createPayment({
        amount: cents(order.finalPrice) / 100,
        description: 'Online bestelling Coop Lubbers',
        redirectUrl: this.config.get('BASE_URL', { infer: true }) ?? '',
        method: 'ideal',
        test: this.mollie.isTestCard(information?.klantenkaart),
      });
      await this.orders.update({ paycode: payment.id }, { where: { uuid_id: order.uuid_id }, logging: false });
      // the client follows docs._links.checkout.href; the rest of Mollie's payment object is not passed on
      return { docs: { id: payment.id, status: payment.status, _links: { checkout: { href: payment.checkoutUrl } } }, order: await this.reading.single(order.uuid_id) };
    } catch (error) {
      this.logger.error(`payment for order ${order.uuid_id} failed: ${error instanceof Error ? error.message : String(error)}`);
      return { err: 'The payment could not be started' };
    }
  }

  private async findOrder(orderRef: string): Promise<Order> {
    const where = orderWhere(orderRef, this.crypto);
    const order = where ? await this.orders.findOne({ where, logging: false }) : null;
    if (!order) throw new BadRequestException({ error: 'Order not found' });
    return order;
  }

  private async storePayment(orderRef: string, picker: unknown): Promise<unknown> {
    const order = await this.findOrder(orderRef);
    const name = typeof picker === 'string' || typeof picker === 'number' ? String(picker).slice(0, 100) : '';
    await this.orders.update({ paycode: `employee-${name}` }, { where: { uuid_id: order.uuid_id }, logging: false });
    return { success: true, message: 'Succesvol afgerekend' };
  }

  private async addProduct(orderRef: string, product: unknown): Promise<unknown> {
    const order = await this.findOrder(orderRef);
    const values = pick(asRecord(product), NEW_LINE_FIELDS);
    if (!Number.isInteger(Number(values.product_id))) throw new OrderUpdateError('A product needs its product_id');
    await this.lines.create({ ...values, order_id: order.id }, { logging: false });
    return this.reading.single(order.uuid_id);
  }

  private async updateOrder(orderRef: string, body: unknown): Promise<unknown> {
    const order = await this.findOrder(orderRef);
    const changes = orderChanges(body);
    const edits = lineChanges(body);

    const before = order.status;
    await this.sequelize.transaction(async (transaction) => {
      if (edits.length > 0) {
        const own = new Set((await this.lines.findAll({ where: { order_id: order.id }, attributes: ['id'], transaction, logging: false })).map((line) => line.id));
        if (edits.some((edit) => !own.has(edit.id))) throw new OrderUpdateError('An order line does not belong to this order');
        for (const edit of edits) await this.lines.update(edit.changes, { where: { id: edit.id, order_id: order.id }, transaction, logging: false });
      }
      if (Object.keys(changes).length > 0) await this.orders.update(changes, { where: { uuid_id: order.uuid_id }, transaction, logging: false });
      await this.reprice(order.id, changes.pickupDate ?? order.pickupDate, transaction);
    });

    const updated = await this.reading.single(order.uuid_id);
    const after = updated?.status;
    if (updated && after !== before) {
      if (after === 'scanned') await this.sendPickedMail(updated);
      if (after === 'afgehaald') await this.addStamps(updated);
    }
    return updated;
  }

  // Prices of the lines: the current product price while the pickup day has not started, then the discounts of the pickup day
  private async reprice(orderId: number, pickupDate: unknown, transaction: Transaction): Promise<void> {
    const lines = await this.lines.findAll({
      where: { order_id: orderId },
      include: [{ association: 'product', include: [discounts] }],
      transaction,
      logging: false,
    });
    const date = new Date(String(pickupDate));
    const priced = lines.map((line) => line as unknown as PricedLine & OrderHasProduct);
    if (!Number.isNaN(date.getTime()) && new Date() <= date) priced.forEach((line) => updateProductPrice(line));
    const all = (await this.discountList.findAll({ transaction, logging: false })) as unknown as DiscountListEntry[];
    calculateDiscountPrices(priced, all, Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10));
    for (const line of lines) {
      await this.lines.update(
        { price: line.price, discounted_price: line.discounted_price, normal_total_price: line.normal_total_price },
        { where: { id: line.id }, transaction, logging: false },
      );
    }
  }

  // The "your order is picked" mail with the link to pay and the QR code for the counter. Failures are logged, never raised.
  private async sendPickedMail(order: Order): Promise<void> {
    try {
      const to = order.order_information?.customerEmail || order.order_information?.customer?.email;
      if (!to) {
        this.logger.warn(`order ${order.uuid_id} has no e-mail address, no mail sent`);
        return;
      }
      const reference = `order||${this.crypto.encrypt(order.uuid_id)}`;
      const info = order.get({ plain: true }) as unknown as OrderMailInfo;
      void this.mail.send(await this.mail.orderWithQr(to, pickedTemplate(reference, info), reference));
    } catch (error) {
      this.logger.error(`mail for order ${order.uuid_id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Stamps of the savings actions for the final price of an order that was picked up: floor(final price / price per stamp) per action
  private async addStamps(order: Order): Promise<void> {
    if (!order.customer_id) return;
    try {
      const ids = (order.spaarzegels ?? '').split(',').map((id) => id.trim()).filter((id) => id !== '');
      for (const id of ids) {
        const action = await this.spaaracties.findByPk(id, { logging: false });
        const stamps = action && Number(action.stamp_price) > 0 ? Math.floor(Number(order.finalPrice) / Number(action.stamp_price)) : 0;
        if (stamps <= 0) continue;
        const [card] = await this.customerSpaaracties.findOrCreate({ where: { customer_id: order.customer_id, spaaractie_id: id }, defaults: { stamp_amount: 0 }, logging: false });
        await this.customerSpaaracties.increment({ stamp_amount: stamps }, { where: { customer_has_spaaractie_id: card.customer_has_spaaractie_id }, logging: false });
      }
    } catch (error) {
      this.logger.error(`stamps for order ${order.uuid_id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
