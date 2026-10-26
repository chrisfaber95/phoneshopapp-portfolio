import { Op } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { Order } from '../database/models';
import { orderWhere } from './order-reference';
import { OrdersService } from './orders.service';

const customer: Principal = { type: 'customer', id: 'c-1' };
const employee: Principal = { type: 'user', id: 'u-1' };
const filter = (value: unknown[]) => ({ 0: [JSON.stringify({ filterType: 'and', value })] });

const attributes = { customer_id: {}, status: {}, pickupDate: {} };
const build = (orders: Record<string, jest.Mock>, crypto: Partial<CryptoService> = {}) =>
  new OrdersService({ getAttributes: () => attributes, ...orders } as unknown as typeof Order, crypto as CryptoService);

describe('OrdersService', () => {
  beforeAll(() => { initModels(); });

  describe('list', () => {
    it('a customer only gets their own orders, even when the filter names another customer', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await build({ findAll }).list(customer, filter([{ customer_id: 'c-2' }]));
      const { where } = findAll.mock.calls[0][0];
      expect(where.customer_id).toBe('c-1');
      expect(where[Op.and]).toEqual([{ [Op.and]: [{ customer_id: 'c-2' }] }]);
    });

    it('employees are not restricted and deleted orders are included', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await build({ findAll }).list(employee, {});
      expect(findAll.mock.calls[0][0]).toMatchObject({ where: {}, paranoid: false });
    });

    it('never sends customer secrets and never writes', async () => {
      const save = jest.fn();
      const findAll = jest.fn().mockResolvedValue([{ save }]);
      await build({ findAll }).list(employee, {});
      expect(save).not.toHaveBeenCalled();
      const customers = findAll.mock.calls[0][0].include.filter((i: { as: string }) => i.as === 'customer');
      expect(customers[0].attributes.exclude).toEqual(['password', 'accessToken', 'resettoken']);
    });

    it('rejects filters on unknown columns', () => {
      expect(() => build({ findAll: jest.fn() }).list(employee, filter([{ password: 'x' }]))).toThrow();
    });
  });

  describe('single', () => {
    it('finds a short reference by uuid_id', async () => {
      const findOne = jest.fn().mockResolvedValue({ uuid_id: 'u' });
      await build({ findOne }).single('0b1d3a5c-1111-2222-3333-444455556666');
      expect(findOne.mock.calls[0][0].where).toEqual({ uuid_id: '0b1d3a5c-1111-2222-3333-444455556666' });
    });

    it('decrypts a long reference to the numeric order id (older links)', async () => {
      const findOne = jest.fn().mockResolvedValue({});
      await build({ findOne }, { decrypt: () => '42' }).single('x'.repeat(41));
      expect(findOne.mock.calls[0][0].where).toEqual({ id: 42 });
    });

    it('decrypts the encrypted UUID of an e-mail link, also with the order|| prefix of the QR code', async () => {
      const findOne = jest.fn().mockResolvedValue({});
      const decrypt = jest.fn().mockReturnValue('0b1d3a5c-1111-2222-3333-444455556666');
      await build({ findOne }, { decrypt }).single(`order||${'x'.repeat(41)}`);
      expect(decrypt).toHaveBeenCalledWith('x'.repeat(41));
      expect(findOne.mock.calls[0][0].where).toEqual({ uuid_id: '0b1d3a5c-1111-2222-3333-444455556666' });
    });

    it('answers null for a long reference that cannot be decrypted, without a query', async () => {
      const findOne = jest.fn();
      await expect(build({ findOne }, { decrypt: () => null }).single('x'.repeat(41))).resolves.toBeNull();
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('counts the orders of one day', async () => {
      const findAll = jest.fn().mockResolvedValue([]);
      await build({ findAll }).count('2026-05-01');
      const { pickupDate } = findAll.mock.calls[0][0].where;
      expect(pickupDate[Op.lt].getTime() - pickupDate[Op.gte].getTime()).toBeGreaterThanOrEqual(23 * 3600 * 1000);
    });
  });
});

describe('order reference', () => {
  it('a reference of only digits is the numeric id, anything else a uuid', () => {
    const crypto = { decrypt: jest.fn() } as never;
    expect(orderWhere('123', crypto)).toEqual({ id: 123 });
    expect(orderWhere('12ab34cd-1111-2222-3333-444455556666', crypto)).toEqual({ uuid_id: '12ab34cd-1111-2222-3333-444455556666' });
    expect(orderWhere('1'.repeat(30), crypto)).toEqual({ uuid_id: '1'.repeat(30) });
  });
});
