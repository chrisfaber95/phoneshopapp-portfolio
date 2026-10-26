import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, literal } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { ActieOrder } from '../database/models';
import { whereFromFilters } from '../orders/order-filters';
import { actieOrderIncludes } from './actie-order-includes';

@Injectable()
export class ActieOrdersService {
  constructor(
    @InjectModel(ActieOrder) private readonly orders: typeof ActieOrder,
    private readonly crypto: CryptoService,
  ) {}

  // GET /actie_order?0[]=<filter json>: for the admin app (employees; the access rules' default). Same filter language as /order.
  list(query: Record<string, unknown>): Promise<ActieOrder[]> {
    const where = whereFromFilters(Object.keys(this.orders.getAttributes()), query);
    return this.orders.findAll({ where, include: actieOrderIncludes, paranoid: false, logging: false });
  }

  // GET /actie_order/single/:ref: by id, or by the encrypted id used in the mail (longer than 40 characters, optionally with the
  // "order||" prefix of the QR code text). null when unknown or not decryptable.
  async single(reference: string): Promise<ActieOrder | null> {
    let id = reference;
    if (reference.length > 40) {
      const decrypted = this.crypto.decrypt(reference.replace(/^order\|\|/, ''));
      if (decrypted === null) return null;
      id = decrypted;
    }
    return this.orders.findByPk(id, { include: actieOrderIncludes, paranoid: false, logging: false });
  }

  // GET /actie_order/count/:date: orders per pickup time on that day. The old Server counted the rows of the *Order* table here;
  // this counts actie orders. Answer shape unchanged: { ordercounter: [{ ordercount, pickup_time }] }.
  async count(date: string): Promise<{ ordercounter: unknown[] }> {
    const day = new Date(date);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const rows = await this.orders.findAll({
      attributes: [[fn('COUNT', '*'), 'ordercount'], 'pickup_time'],
      where: { pickup_date: { [Op.gte]: start, [Op.lt]: new Date(start.getTime() + 24 * 60 * 60 * 1000) } },
      group: [literal('pickup_time') as never],
      raw: true,
      logging: false,
    });
    return { ordercounter: rows };
  }
}
