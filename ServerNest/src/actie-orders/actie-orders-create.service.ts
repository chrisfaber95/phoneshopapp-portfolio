import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { assertCustomer } from '../auth/ownership';
import { Principal } from '../auth/principal.service';
import { AppEnv } from '../config/env.validation';
import { ActieOrder, ActieOrderHasProduct, CustomerHasSpaaractie, Product, ProductVariant, SpaaractieHasProduct } from '../database/models';
import { MailService } from '../mail/mail.service';
import { orderedActieTemplate, orderedDonarTemplate } from '../mail/mail-bodies';
import { ActieOrderMailInfo } from '../mail/mail.types';
import { OrderInputError } from '../orders/order-input';
import { NewActieOrder, parseNewActieOrder } from './actie-order-input';
import { ActieOrdersService } from './actie-orders.service';

export const NOT_ENOUGH_STAMPS = 'U heeft te weinig zegels voor deze aankoop. Is dit niet correct, niet correct, neem dan contact op via onze contactpagina.';

@Injectable()
export class ActieOrdersCreateService {
  private readonly logger = new Logger(ActieOrdersCreateService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(ActieOrder) private readonly orders: typeof ActieOrder,
    @InjectModel(ActieOrderHasProduct) private readonly lines: typeof ActieOrderHasProduct,
    @InjectModel(CustomerHasSpaaractie) private readonly cards: typeof CustomerHasSpaaractie,
    @InjectModel(SpaaractieHasProduct) private readonly actionProducts: typeof SpaaractieHasProduct,
    @InjectModel(Product) private readonly products: typeof Product,
    @InjectModel(ProductVariant) private readonly variants: typeof ProductVariant,
    private readonly reading: ActieOrdersService,
    private readonly mail: MailService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  // POST /actie_order: a customer orders products of a savings action for their stamps (pick-up). The stamp price of every product
  // comes from the action's product list in the database (the old Server used the price the client sent, so products could be had
  // for nothing), the stamps are taken from the customer's own card with a conditional update (never below zero, no double spending)
  // in the same transaction as the order. Delivery (paid through Mollie) never worked in the old Server (the order could not be
  // stored) and its price rule is not known: it is refused here until it is specified.
  async create(principal: Principal | null, body: unknown, now: Date = new Date()): Promise<{ message?: string; error?: string; success: boolean }> {
    const customer = assertCustomer(principal);
    let input: NewActieOrder;
    try {
      input = parseNewActieOrder(body, now);
    } catch (error) {
      if (error instanceof OrderInputError) throw new BadRequestException({ error: error.message, success: false });
      throw error;
    }
    if (input.delivery) return { error: 'Bezorgen is op dit moment niet beschikbaar, kies voor afhalen.', success: false };

    const productIds = [...new Set(input.lines.map((line) => line.product_id))];
    const [stampPrices, products] = await Promise.all([
      this.actionProducts.findAll({ where: { spaaractie_id: input.spaaractieId, product_id: productIds }, logging: false }),
      this.products.findAll({ where: { id: productIds }, attributes: ['id', 'price'], logging: false }),
    ]);
    const stampsCost = new Map(stampPrices.map((row) => [row.product_id, Number(row.stamps_cost ?? 0)]));
    const price = new Map(products.map((product) => [product.id, product.price]));
    if (productIds.some((id) => !stampsCost.has(id) || !price.has(id))) throw new BadRequestException({ error: 'Unknown product in the order', success: false });
    await this.checkVariants(input);

    const cost = input.lines.reduce((sum, line) => sum + (stampsCost.get(line.product_id) as number) * line.amount, 0);
    const orderId = await this.sequelize.transaction(async (transaction) => {
      if (cost > 0) {
        const [taken] = await this.cards.update(
          { stamp_amount: Sequelize.literal(`stamp_amount - ${cost}`) as never },
          { where: { customer_id: customer.id, spaaractie_id: input.spaaractieId, stamp_amount: { [Op.gte]: cost } }, transaction, logging: false },
        );
        if (taken === 0) return null;
      }
      const order = await this.orders.create(
        {
          delivery: false,
          pickup_date: input.pickupDate,
          pickup_time: input.pickupTime,
          delivery_cost: '0.00',
          paycode: `afhaal-${customer.id}-${now.getTime()}`,
          status: 'ordered',
          actie_order_information: { ...input.user, customer_id: customer.id },
          invoice_actie_order_information: { ...input.invoice, customer_id: customer.id },
        },
        { transaction, logging: false, include: [{ association: 'actie_order_information' }, { association: 'invoice_actie_order_information' }] },
      );
      for (const line of input.lines) {
        await this.lines.create(
          {
            amount: line.amount,
            actie_order_id: order.actie_order_id,
            product_id: line.product_id,
            price: price.get(line.product_id),
            stamps_cost: stampsCost.get(line.product_id),
            actie_order_product_variant_list: (line.variants ?? []).map((id) => ({ product_variant_id: id })),
          },
          { transaction, logging: false, include: [{ association: 'actie_order_product_variant_list' }] },
        );
      }
      return order.actie_order_id;
    });
    if (orderId === null) return { error: NOT_ENOUGH_STAMPS, success: false };

    await this.sendMails(orderId);
    return { message: 'Bestelling verwerkt', success: true };
  }

  // every variant must belong to the product it is ordered with
  private async checkVariants(input: NewActieOrder): Promise<void> {
    const wanted = input.lines.flatMap((line) => (line.variants ?? []).map((id) => ({ id, product: line.product_id })));
    if (wanted.length === 0) return;
    const known = await this.variants.findAll({ where: { product_variant_id: [...new Set(wanted.map((w) => w.id))] }, attributes: ['product_variant_id', 'product_id'], logging: false });
    const owner = new Map(known.map((variant) => [variant.product_variant_id, variant.product_id]));
    if (wanted.some((w) => owner.get(w.id) !== w.product)) throw new BadRequestException({ error: 'Unknown variant in the order', success: false });
  }

  // Confirmation to the customer and the note for the shop; failures are logged, the order stands
  private async sendMails(orderId: string): Promise<void> {
    try {
      const order = await this.reading.single(orderId);
      if (!order) return;
      const info = order.get({ plain: true }) as unknown as ActieOrderMailInfo;
      const to = order.actie_order_information?.customerEmail;
      if (to) void this.mail.send(this.mail.order(to, orderedActieTemplate(info)));
      const shop = this.config.get('ACTIE_ORDER_EMAIL', { infer: true }) ?? this.config.get('FEEDBACK_EMAIL', { infer: true }) ?? this.config.get('MAIL_USER', { infer: true });
      if (shop) void this.mail.send(this.mail.order(shop, orderedDonarTemplate(info)));
    } catch (error) {
      this.logger.error(`mails for actie order ${orderId} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
