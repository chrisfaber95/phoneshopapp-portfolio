import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Principal } from '../auth/principal.service';
import { AppEnv } from '../config/env.validation';
import { Order, OrderHasProduct, Product } from '../database/models';
import { MollieService } from '../payments/mollie.service';
import { calculateDiscountPrices, PricedLine } from '../pricing/pricing';
import { discounts } from '../products/product-includes';
import { invoiceNumber, startOfDay } from './invoice-number';
import { NewOrder, OrderInputError, parseNewOrder } from './order-input';

// Price of a koopzegel (the Klant client used a constant 0.05)
const KOOPZEGEL_PRICE = 0.05;

const cents = (value: number): number => Math.round(value * 100);

interface PricedOrderLine extends PricedLine {
  product_id: number;
  amount: number;
  price: number;
  statiegeld: number;
}

export interface CreatedOrder {
  payment: string;
  success: true;
}

@Injectable()
export class OrdersCreateService {
  private readonly logger = new Logger(OrdersCreateService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Order) private readonly orders: typeof Order,
    @InjectModel(OrderHasProduct) private readonly lines: typeof OrderHasProduct,
    @InjectModel(Product) private readonly products: typeof Product,
    private readonly mollie: MollieService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  // POST /order: places an order and answers with the Mollie checkout link for the first payment (the picking fee). Anyone may
  // order (guests too). Prices, totals and the amount to pay come from the database and the settings, never from the client; the
  // order is only linked to a customer when the request carries that customer's token.
  async create(principal: Principal | null, body: unknown, origin: string | undefined, now: Date = new Date()): Promise<CreatedOrder> {
    let input: NewOrder;
    try {
      input = parseNewOrder(body, now);
    } catch (error) {
      if (error instanceof OrderInputError) throw new BadRequestException({ docs: error.message, success: false });
      throw error;
    }

    const priced = await this.price(input);
    const fee = this.config.get(input.delivery ? 'DELIVERY_FEE' : 'PICKUP_FEE', { infer: true });
    const customerId = principal?.type === 'customer' ? principal.id : null;

    const order = await this.sequelize.transaction(async (transaction) => {
      const ordersToday = await this.orders.count({ where: { createdAt: { [Op.gte]: startOfDay(now) } }, transaction, logging: false });
      const created = await this.orders.create(
        {
          delivery: input.delivery,
          pickupDate: input.pickupDate,
          pickupTime: input.pickupTime,
          totalPrice: (cents(priced.total) / 100).toFixed(2),
          koopzegels: input.koopzegels,
          spaarzegels: input.spaarzegels,
          picking_price: fee.toFixed(2),
          status: 'pending',
          storepoints: input.storepoints,
          customer_id: customerId,
          invoice_number: invoiceNumber(now, ordersToday),
          order_information: { ...input.user, customer_id: customerId },
          invoice_order_information: { ...input.invoice, customer_id: customerId },
        },
        { transaction, logging: false, include: [{ association: 'order_information' }, { association: 'invoice_order_information' }] },
      );
      await this.lines.bulkCreate(
        priced.lines.map((line) => ({
          amount: line.amount,
          order_id: created.id,
          product_id: line.product_id,
          price: line.price,
          discounted_price: line.discounted_price,
          normal_total_price: line.normal_total_price,
        })),
        { transaction, logging: false },
      );
      return created;
    });

    try {
      const payment = await this.mollie.createPayment({
        amount: fee,
        description: 'Uw bestelling bij Coop Lubbers',
        redirectUrl: `${this.config.get('BASE_URL', { infer: true }) ?? origin ?? ''}?return=payment`,
        method: input.method,
        test: this.mollie.isTestCard(input.user.klantenkaart),
      });
      if (!payment.checkoutUrl) throw new Error('Mollie gave no checkout URL');
      // the payment id is how the webhook finds the order again (kept in paymentMethod, as the old Server did)
      await this.orders.update({ paymentMethod: payment.id }, { where: { uuid_id: order.uuid_id }, logging: false });
      return { payment: payment.checkoutUrl, success: true };
    } catch (error) {
      // no payment, so no order: remove it again instead of leaving an unpayable order behind
      this.logger.error(`payment for order ${order.uuid_id} failed: ${error instanceof Error ? error.message : String(error)}`);
      await this.lines.destroy({ where: { order_id: order.id }, logging: false });
      await this.orders.destroy({ where: { uuid_id: order.uuid_id }, force: true, logging: false });
      throw new BadRequestException({ docs: 'The payment could not be started', success: false });
    }
  }

  // The lines with the current price of every product and the discounts of the pickup day
  private async price(input: NewOrder): Promise<{ lines: PricedOrderLine[]; total: number }> {
    const ids = [...new Set(input.lines.map((line) => line.product_id))];
    const products = await this.products.findAll({ where: { id: ids }, include: [discounts], logging: false });
    const byId = new Map(products.map((product) => [product.id, product]));
    if (ids.some((id) => !byId.has(id))) throw new BadRequestException({ docs: 'Unknown product in the order', success: false });

    const lines: PricedOrderLine[] = input.lines.map((line) => {
      const product = byId.get(line.product_id) as Product;
      return { id: line.product_id, product_id: line.product_id, amount: line.amount, price: Number(product.price), product: product as unknown as PricedLine['product'], statiegeld: Number(product.statiegeld || 0) };
    });
    calculateDiscountPrices(lines, null, input.pickupDate);

    const deposit = lines.reduce((sum, line) => sum + line.statiegeld * line.amount, 0);
    const goods = lines.reduce((sum, line) => sum + cents(Number(line.discounted_price)), 0);
    return { lines, total: (goods + cents(deposit) + cents(input.koopzegels * KOOPZEGEL_PRICE)) / 100 };
  }
}
