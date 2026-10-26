import { Op } from 'sequelize';
import { initModels } from '../../test/helpers/init-models';
import { CryptoService } from '../auth/crypto.service';
import { ActieOrder } from '../database/models';
import { ActieOrdersService } from './actie-orders.service';

const build = (orders: Record<string, jest.Mock>, crypto: Partial<CryptoService> = {}) =>
  new ActieOrdersService({ getAttributes: () => ({ status: {}, pickup_date: {} }), ...orders } as unknown as typeof ActieOrder, crypto as CryptoService);

describe('ActieOrdersService', () => {
  beforeAll(() => { initModels(); });

  it('lists with the filter language, deleted orders included, customers without secrets', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    await build({ findAll }).list({ 0: [JSON.stringify({ filterType: 'and', value: [{ status: 'ordered' }] })] });
    const options = findAll.mock.calls[0][0];
    expect(options.paranoid).toBe(false);
    expect(options.where).toEqual({ [Op.and]: [{ [Op.and]: [{ status: 'ordered' }] }] });
    const contact = options.include.find((i: { as: string }) => i.as === 'actie_order_information');
    expect(contact.include[0].attributes.exclude).toEqual(expect.arrayContaining(['password', 'accessToken', 'resettoken']));
  });

  it('turns a pickup_date filter into an ISO date', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    await build({ findAll }).list({ 0: [JSON.stringify({ filterType: 'and', value: [{ pickup_date: '2026-05-01' }] })] });
    expect(findAll.mock.calls[0][0].where).toEqual({ [Op.and]: [{ [Op.and]: [{ pickup_date: new Date('2026-05-01').toISOString() }] }] });
  });

  it('rejects filters on unknown columns', () => {
    expect(() => build({ findAll: jest.fn() }).list({ 0: [JSON.stringify({ filterType: 'and', value: [{ password: 'x' }] })] })).toThrow();
  });

  describe('single', () => {
    it('finds a short reference by id', async () => {
      const findByPk = jest.fn().mockResolvedValue({});
      await build({ findByPk }).single('ao-1');
      expect(findByPk.mock.calls[0][0]).toBe('ao-1');
    });

    it('decrypts a long reference, also with the order|| prefix', async () => {
      const findByPk = jest.fn().mockResolvedValue({});
      const decrypt = jest.fn().mockReturnValue('ao-2');
      await build({ findByPk }, { decrypt }).single(`order||${'x'.repeat(41)}`);
      expect(decrypt).toHaveBeenCalledWith('x'.repeat(41));
      expect(findByPk.mock.calls[0][0]).toBe('ao-2');
    });

    it('answers null for a reference that cannot be decrypted, without a query', async () => {
      const findByPk = jest.fn();
      await expect(build({ findByPk }, { decrypt: () => null }).single('x'.repeat(41))).resolves.toBeNull();
      expect(findByPk).not.toHaveBeenCalled();
    });
  });

  it('counts actie orders per pickup time for one day', async () => {
    const findAll = jest.fn().mockResolvedValue([{ ordercount: 2, pickup_time: '10:00:00' }]);
    await expect(build({ findAll }).count('2026-05-01')).resolves.toEqual({ ordercounter: [{ ordercount: 2, pickup_time: '10:00:00' }] });
    const { pickup_date } = findAll.mock.calls[0][0].where;
    expect(pickup_date[Op.lt].getTime() - pickup_date[Op.gte].getTime()).toBeGreaterThanOrEqual(23 * 3600 * 1000);
  });
});
