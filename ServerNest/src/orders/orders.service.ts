import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, literal, Op } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { Order } from '../database/models';
import { whereFromFilters } from './order-filters';
import { orderIncludes } from './order-includes';
import { orderWhere } from './order-reference';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private readonly orders: typeof Order,
    private readonly crypto: CryptoService,
  ) {}

  // GET /order?0[]=<filter json>&1[]=...: the orders that match all filters (deleted orders included). A logged-in customer only
  // ever gets their own orders; employees get what they ask for. (The old Server also re-saved every order it listed.)
  list(principal: Principal | null, query: Record<string, unknown>): Promise<Order[]> {
    const filters = whereFromFilters(Object.keys(this.orders.getAttributes()), query);
    const where = principal?.type === 'customer' ? { ['customer_id']: principal.id, ...filters } : filters;
    return this.orders.findAll({ where, include: orderIncludes, paranoid: false, logging: false });
  }

  // GET /order/single/:orderRef: one order, found by its UUID or by the encrypted reference used in the links of e-mails (see
  // order-reference.ts). Anyone with the link may read it. null when unknown or when the encrypted reference is not valid.
  async single(orderRef: string): Promise<Order | null> {
    const where = orderWhere(orderRef, this.crypto);
    if (where === null) return null;
    return this.orders.findOne({ where, include: orderIncludes, paranoid: false, logging: false });
  }

  // GET /order/count/:date: how many orders are to be picked up on that day, per pickup time (for the time picker)
  count(date: string): Promise<Order[]> {
    const pickupDate = new Date(date);
    const startOfDay = new Date(pickupDate.getFullYear(), pickupDate.getMonth(), pickupDate.getDate());
    return this.orders.findAll({
      attributes: [
        [fn('TIME', literal('pickupTime')), 'pickupTime'],
        [fn('COUNT', '*'), 'orderCount'],
      ],
      where: { pickupDate: { [Op.gte]: startOfDay, [Op.lt]: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) } },
      group: [fn('TIME', literal('pickupTime'))],
      logging: false,
    });
  }
}
