import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { Principal } from '../auth/principal.service';
import { Customer, CustomerHasSpaaractie, Spaaractie } from '../database/models';
import { CustomerSpaaractiesService, noteTime } from './customer-spaaracties.service';

const customer: Principal = { type: 'customer', id: 'c-1' };
const employee: Principal = { type: 'user', id: 'u-1' };

interface Setup { points?: number; action?: unknown; card?: unknown; updated?: number }
const setup = (over: Setup = {}) => {
  const cards = {
    findOrCreate: jest.fn().mockResolvedValue([over.card ?? { customer_has_spaaractie_id: 'card-1' }, false]),
    increment: jest.fn().mockResolvedValue(undefined),
    findByPk: jest.fn().mockResolvedValue({ customer_has_spaaractie_id: 'card-1', stamp_amount: 5 }),
    findAll: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue([over.updated ?? 1]),
    getAttributes: () => ({ customer_id: {}, spaaractie_id: {}, stamp_amount: {} }),
  };
  const customers = {
    findByPk: jest.fn().mockResolvedValue({ customer_id: 'c-1', storepoints: over.points ?? 25 }),
    update: jest.fn().mockResolvedValue([over.updated ?? 1]),
    increment: jest.fn().mockResolvedValue(undefined),
  };
  const actions = { findByPk: jest.fn().mockResolvedValue(over.action === undefined ? { spaaractie_id: 'a-1', point_for_stamp: 5 } : over.action) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new CustomerSpaaractiesService(sequelize as unknown as Sequelize, cards as unknown as typeof CustomerHasSpaaractie, customers as unknown as typeof Customer, actions as unknown as typeof Spaaractie);
  return { service, cards, customers, actions };
};

const exchange = (info: Record<string, unknown>) => ({ params: { info: { spaaractie_id: 'a-1', ...info }, where: {} } });

describe('CustomerSpaaractiesService', () => {
  beforeAll(() => { initModels(); });

  describe('reading', () => {
    it('a customer only gets their own cards, employees what they ask for', async () => {
      const { service, cards } = setup();
      await service.list(customer, { customer_id: 'c-2' });
      expect(cards.findAll.mock.calls[0][0].where).toEqual({ customer_id: 'c-1' });
      await service.list(employee, { customer_id: 'c-2' });
      expect(cards.findAll.mock.calls[1][0].where).toEqual({ customer_id: 'c-2' });
    });

    it('never sends the secrets of the customer', async () => {
      const { service, cards } = setup();
      await service.list(employee, {});
      const include = cards.findAll.mock.calls[0][0].include.find((i: { as: string }) => i.as === 'customer');
      expect(include.attributes.exclude).toEqual(expect.arrayContaining(['password', 'accessToken', 'resettoken']));
    });

    it('the cards of a customer: own id only, employees any', async () => {
      const { service } = setup();
      await expect(service.forCustomer(customer, 'c-1')).resolves.toEqual([]);
      await expect(service.forCustomer(employee, 'c-2')).resolves.toEqual([]);
      expect(() => service.forCustomer(customer, 'c-2')).toThrow(ForbiddenException);
      expect(() => service.forCustomer(null, 'c-1')).toThrow(UnauthorizedException);
    });
  });

  describe('exchange (points for stamps)', () => {
    it('with an amount: takes the points and puts the stamps on the card, in one transaction', async () => {
      const { service, customers, cards } = setup();
      await service.exchange(customer, exchange({ amount_exchange: 2 }));
      expect(customers.update.mock.calls[0][1].where).toEqual({ customer_id: 'c-1', storepoints: { [Op.gte]: 10 } });
      expect(cards.increment).toHaveBeenCalledWith({ stamp_amount: 2 }, expect.objectContaining({ where: { customer_has_spaaractie_id: 'card-1' } }));
    });

    it('without an amount: exchanges everything that is possible (25 points at 5 per stamp = 5 stamps)', async () => {
      const { service, cards } = setup();
      await service.exchange(customer, exchange({}));
      expect(cards.increment.mock.calls[0][0]).toEqual({ stamp_amount: 5 });
    });

    it('uses the points of the database, not the number the client sends', async () => {
      const { service, cards } = setup({ points: 4 });
      await expect(service.exchange(customer, exchange({ amount_exchange: 3, storepoints: 1000 }))).resolves.toEqual({ error: 'Teveel zegels ingevoerd.' });
      expect(cards.increment).not.toHaveBeenCalled();
    });

    it('refuses when the points were spent in the meantime (the conditional update changed nothing)', async () => {
      const { service, cards } = setup({ updated: 0 });
      await expect(service.exchange(customer, exchange({ amount_exchange: 1 }))).resolves.toEqual({ error: 'Teveel zegels ingevoerd.' });
      expect(cards.increment).not.toHaveBeenCalled();
    });

    it.each([[-1], [1.5], ['abc'], [1e9]])('refuses the amount %p', async (amount) => {
      const { service, cards } = setup();
      await expect(service.exchange(customer, exchange({ amount_exchange: amount }))).resolves.toEqual({ error: 'Teveel zegels ingevoerd.' });
      expect(cards.increment).not.toHaveBeenCalled();
    });

    it('nothing to exchange', async () => {
      await expect(setup({ points: 3 }).service.exchange(customer, exchange({}))).resolves.toEqual({ error: 'Geen zegels om om te wisselen.' });
    });

    it('is for customers only and needs a known action', async () => {
      await expect(setup().service.exchange(null, exchange({}))).rejects.toThrow(UnauthorizedException);
      await expect(setup().service.exchange(employee, exchange({}))).rejects.toThrow(ForbiddenException);
      await expect(setup({ action: null }).service.exchange(customer, exchange({}))).rejects.toThrow(BadRequestException);
      await expect(setup({ action: { spaaractie_id: 'a-1', point_for_stamp: 0 } }).service.exchange(customer, exchange({}))).rejects.toThrow(BadRequestException);
    });
  });

  describe('employee functions', () => {
    it('employeeUpdate adds stamps per action and the points, and answers when it is done', async () => {
      const { service, cards, customers } = setup();
      await expect(service.employeeUpdate({ customer_id: 'c-1', spaaracties: [{ spaaractie_id: 'a-1', aantal: 3 }, { spaaractie_id: 'a-2', aantal: 1 }], details: { munten: 10 } })).resolves.toEqual({ success: true, message: 'Zegels toegevoegd' });
      expect(cards.increment).toHaveBeenCalledTimes(2);
      expect(customers.increment).toHaveBeenCalledWith({ storepoints: 10 }, expect.objectContaining({ where: { customer_id: 'c-1' } }));
    });

    it.each([
      ['no customer', { spaaracties: [{ spaaractie_id: 'a-1', aantal: 1 }] }],
      ['a negative amount', { customer_id: 'c-1', spaaracties: [{ spaaractie_id: 'a-1', aantal: -1 }] }],
      ['an action without id', { customer_id: 'c-1', spaaracties: [{ aantal: 1 }] }],
      ['bad points', { customer_id: 'c-1', spaaracties: [], details: { munten: 'x' } }],
    ])('employeeUpdate rejects %s without touching anything', async (_name, body) => {
      const { service, cards, customers } = setup();
      await expect(service.employeeUpdate(body)).resolves.toEqual({ success: false, message: 'Ongeldige gegevens' });
      expect(cards.increment).not.toHaveBeenCalled();
      expect(customers.increment).not.toHaveBeenCalled();
    });

    it('employeeUpdate reports a failure instead of crashing', async () => {
      const { service, customers } = setup();
      customers.findByPk.mockResolvedValue(null);
      await expect(service.employeeUpdate({ customer_id: 'nobody', spaaracties: [] })).resolves.toEqual({ success: false, message: 'Zegels toevoegen mislukt' });
    });

    it('employeeChange takes stamps off a card but never below zero', async () => {
      const { service, cards } = setup();
      await expect(service.employeeChange({ spaaracties: { customer_has_spaaractie_id: 'card-1' }, details: { aantal: 10 } })).resolves.toEqual({ success: true, message: 'Aantal zegels gewijzigd voor klant' });
      expect(cards.update.mock.calls[0][1].where).toEqual({ customer_has_spaaractie_id: 'card-1', stamp_amount: { [Op.gte]: 10 } });
      const short = setup({ updated: 0 });
      await expect(short.service.employeeChange({ spaaracties: { customer_has_spaaractie_id: 'card-1' }, details: { aantal: 10 } })).resolves.toEqual({ success: false, message: 'Kon aantal niet wijzigen.' });
      await expect(service.employeeChange({ details: { aantal: 1 } })).resolves.toEqual({ success: false, message: 'Kon aantal niet wijzigen.' });
    });

    it('nostamps only notes the time, in the format of the old Server', () => {
      expect(noteTime(new Date(2026, 9, 1, 8, 5, 9))).toBe('Thursday 08:05:09 1 Oct 2026');
      expect(setup().service.noStamps(new Date(2026, 9, 1, 8, 5, 9))).toEqual({ message: 'Genoteerd om Thursday 08:05:09 1 Oct 2026 dat deze klant geen zegels wil.', success: true });
    });
  });
});
