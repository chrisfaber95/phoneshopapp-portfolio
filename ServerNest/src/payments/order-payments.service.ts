import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Customer, Order, OrderHasProduct, OrderInformation, Product } from '../database/models';
import { MailService } from '../mail/mail.service';
import { orderedTemplate } from '../mail/mail-bodies';
import { OrderMailInfo } from '../mail/mail.types';
import { productInformationPlain } from '../products/product-includes';
import { MollieService } from './mollie.service';

// Mollie payment ids ("tr_" and letters/digits); anything else is not worth a call to Mollie
const PAYMENT_ID = /^tr_[A-Za-z0-9]{1,64}$/;

export class UnknownPaymentError extends Error {}

@Injectable()
export class OrderPaymentsService {
  private readonly logger = new Logger(OrderPaymentsService.name);

  constructor(
    @InjectModel(Order) private readonly orders: typeof Order,
    private readonly mollie: MollieService,
    private readonly mail: MailService,
  ) {}

  // POST /mollie/webhook: Mollie says a payment changed. The body only carries the payment id; what happened is asked from Mollie
  // itself, so a forged call cannot mark anything as paid. A paid first payment turns a `pending` order into `ordered` (and mails
  // the customer), a paid second payment turns a `scanned` order into `payed`. Mollie may call more than once: every change is
  // a conditional update on the current status, so the mail goes out once. Answers the payment status, like the old Server.
  async handle(body: unknown): Promise<string> {
    const id = (body as { id?: unknown } | null)?.id;
    if (typeof id !== 'string' || !PAYMENT_ID.test(id)) throw new UnknownPaymentError('Invalid payment id');

    const payment = await this.mollie.getPayment(id);
    if (!payment) throw new UnknownPaymentError('Unknown payment');

    if (payment.status === 'paid') await this.markPaid(id);
    else if (payment.status !== 'open') this.logger.log(`payment ${id} is ${payment.status}, order not changed`);
    return payment.status;
  }

  private async markPaid(paymentId: string): Promise<void> {
    const where = { [Op.or]: [{ paymentMethod: paymentId }, { paycode: paymentId }] };
    const order = await this.orders.findOne({ where, attributes: ['uuid_id', 'status'], logging: false });
    if (!order) {
      this.logger.warn(`payment ${paymentId} is paid but belongs to no order`);
      return;
    }

    if (order.status === 'pending') {
      const [changed] = await this.orders.update({ status: 'ordered' }, { where: { uuid_id: order.uuid_id, status: 'pending' }, logging: false });
      if (changed > 0) await this.sendOrderedMail(order.uuid_id);
    } else if (order.status === 'scanned') {
      await this.orders.update({ status: 'payed' }, { where: { uuid_id: order.uuid_id, status: 'scanned' }, logging: false });
    }
  }

  // The order confirmation; a failure is logged and never fails the webhook (Mollie would retry and nothing would change)
  private async sendOrderedMail(uuid: string): Promise<void> {
    try {
      const order = await this.orders.findByPk(uuid, {
        logging: false,
        include: [
          { model: OrderHasProduct, as: 'product_list', include: [{ model: Product, as: 'product', include: [productInformationPlain] }] },
          { model: OrderInformation, as: 'order_information', include: [{ model: Customer, as: 'customer', attributes: ['email'] }] },
        ],
      });
      const to = order?.order_information?.customerEmail || order?.order_information?.customer?.email;
      if (!order || !to) {
        this.logger.warn(`order ${uuid} has no e-mail address, no confirmation sent`);
        return;
      }
      const info = order.get({ plain: true }) as unknown as OrderMailInfo;
      void this.mail.send(this.mail.order(to, orderedTemplate(info)));
    } catch (error) {
      this.logger.error(`confirmation mail for order ${uuid} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
