import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { asRecord, pick } from '../customers/customer-fields';
import { ActieOrder, ActieOrderHasProduct } from '../database/models';
import { MailService } from '../mail/mail.service';
import { actiePickedTemplate } from '../mail/mail-bodies';
import { ActieOrderMailInfo } from '../mail/mail.types';
import { ActieOrdersService } from './actie-orders.service';

// What an employee may change on an actie order and its lines (the old Server passed the whole body to the update)
const ORDER_FIELDS = ['status', 'pickup_date', 'pickup_time', 'pickingtime', 'pickedup_time', 'picking_user', 'pickup_user'] as const;
const LINE_FIELDS = ['amount', 'price', 'picked', 'returned', 'reason_return', 'discounted_price'] as const;
const NEW_LINE_FIELDS = ['product_id', 'stamps_cost', ...LINE_FIELDS] as const;

@Injectable()
export class ActieOrdersUpdateService {
  private readonly logger = new Logger(ActieOrdersUpdateService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(ActieOrder) private readonly orders: typeof ActieOrder,
    @InjectModel(ActieOrderHasProduct) private readonly lines: typeof ActieOrderHasProduct,
    private readonly reading: ActieOrdersService,
    private readonly crypto: CryptoService,
    private readonly mail: MailService,
  ) {}

  // PUT /actie_order/:orderId, for employees (the old route was open to everyone):
  //  - Update: save the order and its lines; a status change to `picked` sends the "your order is ready" mail with the QR code, once.
  //  - Product: add a product line to the order.
  // The old "afgehaald" step gave the customer stamps for a final price that actie orders do not have; it did nothing and is dropped.
  async update(principal: Principal | null, orderId: string, body: unknown): Promise<unknown> {
    if (!principal) throw new UnauthorizedException({ error: 'Authentication required' });
    if (principal.type !== 'user') throw new ForbiddenException({ error: 'Not allowed' });

    const input = asRecord(body);
    const order = await this.orders.findByPk(orderId, { logging: false });
    if (!order) throw new BadRequestException({ error: 'Order not found' });

    switch (input.type) {
      case 'Update':
        return this.updateOrder(order, asRecord(input.order));
      case 'Product':
        return this.addProduct(order, asRecord(input.product));
      default:
        throw new BadRequestException({ error: 'Unknown type' });
    }
  }

  private async updateOrder(order: ActieOrder, body: Record<string, unknown>): Promise<unknown> {
    const changes = pick(body, ORDER_FIELDS);
    const list = body.product_list;
    if (list !== undefined && !Array.isArray(list)) throw new BadRequestException({ error: 'Invalid product list' });
    const edits = (list ?? []).map((entry: unknown) => {
      const line = asRecord(entry);
      const id = Number(line.actie_order_has_product_id);
      if (!Number.isInteger(id) || id < 1) throw new BadRequestException({ error: 'Every order line needs its id' });
      return { id, changes: pick(line, LINE_FIELDS) };
    });

    const before = order.status;
    await this.sequelize.transaction(async (transaction) => {
      if (edits.length > 0) {
        const own = new Set((await this.lines.findAll({ where: { actie_order_id: order.actie_order_id }, attributes: ['actie_order_has_product_id'], transaction, logging: false })).map((line) => line.actie_order_has_product_id));
        if (edits.some((edit) => !own.has(edit.id))) throw new BadRequestException({ error: 'An order line does not belong to this order' });
        for (const edit of edits) await this.lines.update(edit.changes, { where: { actie_order_has_product_id: edit.id, actie_order_id: order.actie_order_id }, transaction, logging: false });
      }
      if (Object.keys(changes).length > 0) await this.orders.update(changes, { where: { actie_order_id: order.actie_order_id }, transaction, logging: false });
    });

    const updated = await this.reading.single(order.actie_order_id);
    if (updated && updated.status !== before && updated.status === 'picked') await this.sendPickedMail(updated);
    return updated;
  }

  private async addProduct(order: ActieOrder, product: Record<string, unknown>): Promise<unknown> {
    const values = pick(product, NEW_LINE_FIELDS);
    if (!Number.isInteger(Number(values.product_id))) throw new BadRequestException({ error: 'A product needs its product_id' });
    await this.lines.create({ ...values, actie_order_id: order.actie_order_id }, { logging: false });
    return this.reading.single(order.actie_order_id);
  }

  private async sendPickedMail(order: ActieOrder): Promise<void> {
    try {
      const to = order.actie_order_information?.customerEmail;
      if (!to) {
        this.logger.warn(`actie order ${order.actie_order_id} has no e-mail address, no mail sent`);
        return;
      }
      const reference = this.crypto.encrypt(order.actie_order_id);
      const info = order.get({ plain: true }) as unknown as ActieOrderMailInfo;
      void this.mail.send(await this.mail.orderWithQr(to, actiePickedTemplate(reference, info), reference));
    } catch (error) {
      this.logger.error(`mail for actie order ${order.actie_order_id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
