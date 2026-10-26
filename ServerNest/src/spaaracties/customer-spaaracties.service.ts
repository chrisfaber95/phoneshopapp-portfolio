import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { assertCustomer, assertCustomerAccess } from '../auth/ownership';
import { Principal } from '../auth/principal.service';
import { whereFromQuery } from '../common/query-filter';
import { HIDDEN_COLUMNS, asRecord } from '../customers/customer-fields';
import { Customer, CustomerHasSpaaractie, Spaaractie } from '../database/models';

// whole number >= 0 from a request value, or null
const wholeNumber = (value: unknown): number | null => {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof number === 'number' && Number.isInteger(number) && number >= 0 && number <= 100000 ? number : null;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const two = (n: number): string => String(n).padStart(2, '0');

// "Thursday 10:05:09 1 Oct 2026", the format of the old Server's note
export const noteTime = (date: Date): string =>
  `${DAYS[date.getDay()]} ${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

// The stamp cards of customers (Customer_has_Spaaractie): stamps collected per savings action, exchanging points for stamps, and the
// counter functions of the employees
@Injectable()
export class CustomerSpaaractiesService {
  private readonly logger = new Logger(CustomerSpaaractiesService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(CustomerHasSpaaractie) private readonly cards: typeof CustomerHasSpaaractie,
    @InjectModel(Customer) private readonly customers: typeof Customer,
    @InjectModel(Spaaractie) private readonly actions: typeof Spaaractie,
  ) {}

  // GET /customer_spaaractie?customer_id=&spaaractie_id=: cards with their action (and the customer without secrets). The old
  // Server filtered on any column of the query and sent the customer with password hash; a customer only gets their own cards.
  list(principal: Principal | null, query: Record<string, unknown>): Promise<CustomerHasSpaaractie[]> {
    const where = whereFromQuery(CustomerHasSpaaractie, query) as Record<string, unknown>;
    if (principal?.type === 'customer') where.customer_id = principal.id;
    return this.cards.findAll({
      where,
      include: [{ model: Spaaractie, as: 'spaaractie' }, { model: Customer, as: 'customer', attributes: { exclude: HIDDEN_COLUMNS } }],
      logging: false,
    });
  }

  // GET /customer_spaaractie/:customerId: the cards of one customer
  forCustomer(principal: Principal | null, customerId: string): Promise<CustomerHasSpaaractie[]> {
    assertCustomerAccess(principal, customerId);
    return this.cards.findAll({ where: { customer_id: customerId }, logging: false });
  }

  // PUT /customer_spaaractie { params: { info: { spaaractie_id, amount_exchange? } } }: the logged-in customer exchanges points for
  // stamps of an action. The points available come from the database (the old Server believed the number the client sent), the
  // stamps are paid for in every case (the first exchange used to be free) and the points cannot go below zero.
  async exchange(principal: Principal | null, body: unknown): Promise<unknown> {
    const customer = assertCustomer(principal);
    const info = asRecord(asRecord(asRecord(body).params).info);
    const actionId = info.spaaractie_id;
    const action = typeof actionId === 'string' ? await this.actions.findByPk(actionId, { logging: false }) : null;
    const pointsPerStamp = Number(action?.point_for_stamp);
    if (!action || !(pointsPerStamp > 0)) throw new BadRequestException({ error: 'Unknown savings action' });

    return this.sequelize.transaction(async (transaction) => {
      const account = await this.customers.findByPk(customer.id, { attributes: ['customer_id', 'storepoints'], transaction, logging: false });
      const available = Math.floor(Number(account?.storepoints ?? 0) / pointsPerStamp);
      const wanted = info.amount_exchange === undefined || info.amount_exchange === null || info.amount_exchange === '' ? available : wholeNumber(info.amount_exchange);
      if (wanted === null || wanted > available) return { error: 'Teveel zegels ingevoerd.' };
      if (wanted === 0) return { error: 'Geen zegels om om te wisselen.' };

      const [taken] = await this.customers.update(
        { storepoints: Sequelize.literal(`storepoints - ${wanted * pointsPerStamp}`) as never },
        { where: { customer_id: customer.id, storepoints: { [Op.gte]: wanted * pointsPerStamp } }, transaction, logging: false },
      );
      if (taken === 0) return { error: 'Teveel zegels ingevoerd.' };
      const card = await this.addStamps(customer.id, action.spaaractie_id, wanted, transaction);
      return card;
    });
  }

  // Stamps on the card of a customer for an action (the card is created on first use)
  private async addStamps(customerId: string, actionId: string, stamps: number, transaction: import('sequelize').Transaction): Promise<CustomerHasSpaaractie> {
    const [card] = await this.cards.findOrCreate({ where: { customer_id: customerId, spaaractie_id: actionId }, defaults: { stamp_amount: 0 }, transaction, logging: false });
    await this.cards.increment({ stamp_amount: stamps }, { where: { customer_has_spaaractie_id: card.customer_has_spaaractie_id }, transaction, logging: false });
    return (await this.cards.findByPk(card.customer_has_spaaractie_id, { transaction, logging: false })) as CustomerHasSpaaractie;
  }

  // PUT /customer_spaaractie/employeeupdate { customer_id, spaaracties: [{ spaaractie_id, aantal }], details: { munten } }: an employee at
  // the counter adds stamps and points for a customer
  async employeeUpdate(body: unknown): Promise<unknown> {
    const input = asRecord(body);
    const customerId = input.customer_id;
    const list = Array.isArray(input.spaaracties) ? input.spaaracties.map(asRecord) : [];
    const points = input.details === undefined ? 0 : wholeNumber(asRecord(input.details).munten);
    const stamps = list.map((entry) => ({ id: entry.spaaractie_id, amount: wholeNumber(entry.aantal) }));
    if (typeof customerId !== 'string' || points === null || stamps.some((s) => typeof s.id !== 'string' || s.amount === null)) {
      return { success: false, message: 'Ongeldige gegevens' };
    }
    try {
      await this.sequelize.transaction(async (transaction) => {
        const customer = await this.customers.findByPk(customerId, { attributes: ['customer_id'], transaction, logging: false });
        if (!customer) throw new Error('unknown customer');
        for (const stamp of stamps) await this.addStamps(customerId, stamp.id as string, stamp.amount as number, transaction);
        if (points > 0) await this.customers.increment({ storepoints: points }, { where: { customer_id: customerId }, transaction, logging: false });
      });
      this.logger.log(`stamps added for customer ${customerId}: ${JSON.stringify(stamps)}, points ${points}`);
      return { success: true, message: 'Zegels toegevoegd' };
    } catch (error) {
      this.logger.error(`adding stamps failed: ${(error as Error).message}`);
      return { success: false, message: 'Zegels toevoegen mislukt' };
    }
  }

  // PUT /customer_spaaractie/employeechange { spaaracties: { customer_has_spaaractie_id }, details: { aantal } }: stamps taken off a
  // card (a filled booklet is handed in); a card cannot go below zero
  async employeeChange(body: unknown): Promise<unknown> {
    const input = asRecord(body);
    const id = asRecord(input.spaaracties).customer_has_spaaractie_id;
    const amount = wholeNumber(asRecord(input.details).aantal);
    if (typeof id !== 'string' || amount === null) return { success: false, message: 'Kon aantal niet wijzigen.' };
    try {
      const [changed] = await this.cards.update(
        { stamp_amount: Sequelize.literal(`stamp_amount - ${amount}`) as never },
        { where: { customer_has_spaaractie_id: id, stamp_amount: { [Op.gte]: amount } }, logging: false },
      );
      if (changed === 0) return { success: false, message: 'Kon aantal niet wijzigen.' };
      this.logger.log(`booklet handed in: card ${id}, ${amount} stamps`);
      return { success: true, message: 'Aantal zegels gewijzigd voor klant' };
    } catch (error) {
      this.logger.error(`changing stamps failed: ${(error as Error).message}`);
      return { success: false, message: 'Kon aantal niet wijzigen.' };
    }
  }

  // PUT /customer_spaaractie/nostamps: only notes that a customer does not want stamps
  noStamps(now: Date = new Date()): { message: string; success: boolean } {
    return { message: `Genoteerd om ${noteTime(now)} dat deze klant geen zegels wil.`, success: true };
  }
}
