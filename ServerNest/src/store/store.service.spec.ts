import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { StoreService } from './store.service';

const SECRETS = ['database_name', 'database_pw', 'database_user'];

const setup = (over: { shop?: unknown; information?: unknown; address?: unknown; offer?: unknown } = {}) => {
  const shopRow = over.shop === undefined ? { shop_id: 's-1', information_id: 'i-1', update: jest.fn().mockResolvedValue(undefined) } : over.shop;
  const shops = {
    getAttributes: () => ({ shop_id: {}, shopname: {}, database_name: {}, database_pw: {}, database_user: {}, domain: {} }),
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(shopRow),
    findOne: jest.fn().mockResolvedValue({ shop_id: 's-1' }),
  };
  const informationRow = over.information === undefined ? { information_id: 'i-1', address_id: 4, update: jest.fn().mockResolvedValue(undefined) } : over.information;
  const information = { findByPk: jest.fn().mockResolvedValue(informationRow), create: jest.fn().mockResolvedValue({ information_id: 'i-new', update: jest.fn() }) };
  const addressRow = over.address === undefined ? { update: jest.fn().mockResolvedValue(undefined) } : over.address;
  const addresses = { findByPk: jest.fn().mockResolvedValue(addressRow), create: jest.fn().mockResolvedValue({ address_id: 9 }) };
  const socials = { update: jest.fn().mockResolvedValue([1]), create: jest.fn().mockResolvedValue({}) };
  const hours = { update: jest.fn().mockResolvedValue([1]), create: jest.fn().mockResolvedValue({}) };
  const timeslots = { findAll: jest.fn().mockResolvedValue([]) };
  const locations = { findAll: jest.fn().mockResolvedValue([]) };
  const offers = { findAll: jest.fn().mockResolvedValue([]), bulkCreate: jest.fn().mockResolvedValue([]), findByPk: jest.fn().mockResolvedValue(over.offer === undefined ? { job_offer_id: 'o-1' } : over.offer) };
  const applications = { findAll: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ job_application_id: 'a-1' }) };
  const terms = { getAttributes: () => ({ TAC_id: {}, content: {} }), findAll: jest.fn().mockResolvedValue([]) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new StoreService(
    sequelize as unknown as Sequelize, shops as never, information as never, addresses as never, socials as never, hours as never, timeslots as never, locations as never,
    offers as never, applications as never, terms as never,
  );
  return { service, shops, shopRow, information, informationRow, addresses, addressRow, socials, hours, timeslots, locations, offers, applications, terms };
};

describe('StoreService', () => {
  describe('reading', () => {
    it('never sends the access data of the main database, and does not filter on it', () => {
      const { service, shops } = setup();
      void service.findShops({ shopname: 'x' });
      expect(shops.findAll.mock.calls[0][0].attributes).toEqual({ exclude: SECRETS });
      for (const column of SECRETS) expect(() => service.findShops({ [column]: 'x' })).toThrow(BadRequestException);
    });

    it('time slots, delivery locations and job offers include their shop without the access data', async () => {
      const { service, timeslots, locations, offers } = setup();
      await service.findTimeslots();
      await service.findLocations();
      await service.findOffers();
      expect(timeslots.findAll.mock.calls[0][0].include[0].attributes).toEqual({ exclude: SECRETS });
      expect(locations.findAll.mock.calls[0][0].include[0].attributes).toEqual({ exclude: SECRETS });
      expect(offers.findAll.mock.calls[0][0].include[0].attributes).toEqual({ exclude: SECRETS });
    });
  });

  describe('updateShop', () => {
    it('saves the whitelisted fields of the shop, its information, address, socials and hours, in one transaction', async () => {
      const { service, shopRow, informationRow, addressRow, socials, hours } = setup();
      await service.updateShop({
        shop_id: 's-1', shopname: 'New name', database_pw: 'x', database_name: 'y', domain: 'shop.example.invalid',
        information: { name: 'Info', phone: '1', address: { city: 'Dorp', street: 'Weg' } },
        socials: [{ social_id: 3, url: 'u', visible: true, shop_id: 'other' }, { type: 'insta', url: 'v' }],
        business_hours: [{ business_hours_id: 5, start: '09:00:00', shop_id: 'other' }, { weekday: 2, start: '08:00:00', end: '17:00:00' }],
      });
      expect((shopRow as { update: jest.Mock }).update.mock.calls[0][0]).toEqual({ shopname: 'New name', domain: 'shop.example.invalid' });
      expect((informationRow as { update: jest.Mock }).update.mock.calls[0][0]).toEqual({ name: 'Info', phone: '1' });
      expect((addressRow as { update: jest.Mock }).update.mock.calls[0][0]).toEqual({ street: 'Weg', city: 'Dorp' });
      expect(socials.update).toHaveBeenCalledWith({ url: 'u', visible: true }, expect.objectContaining({ where: { social_id: 3, shop_id: 's-1' } }));
      expect(socials.create).toHaveBeenCalledWith({ type: 'insta', url: 'v', shop_id: 's-1' }, expect.anything());
      expect(hours.update).toHaveBeenCalledWith({ start: '09:00:00' }, expect.objectContaining({ where: { business_hours_id: 5, shop_id: 's-1' } }));
      expect(hours.create).toHaveBeenCalledWith({ weekday: 2, start: '08:00:00', end: '17:00:00', shop_id: 's-1' }, expect.anything());
    });

    it('creates information and an address for a shop that has none', async () => {
      const shopRow = { shop_id: 's-1', information_id: null, update: jest.fn().mockResolvedValue(undefined) };
      const { service, information } = setup({ shop: shopRow });
      await service.updateShop({ shop_id: 's-1', information: { name: 'Info', address: { city: 'Dorp' } } });
      expect(information.create).toHaveBeenCalledWith({ name: 'Info' }, expect.anything());
      expect(shopRow.update).toHaveBeenCalledWith({ information_id: 'i-new' }, expect.anything());
    });

    it('is a 404 for an unknown shop and rejects values that are objects or lists that are too long', async () => {
      await expect(setup({ shop: null }).service.updateShop({ shop_id: 'nope' })).rejects.toThrow(NotFoundException);
      await expect(setup().service.updateShop({ shop_id: 's-1', shopname: { a: 1 } })).rejects.toThrow(BadRequestException);
      await expect(setup().service.updateShop({ shop_id: 's-1', business_hours: 'x' })).rejects.toThrow(BadRequestException);
      await expect(setup().service.updateShop({ shop_id: 's-1', socials: Array.from({ length: 501 }, () => ({})) })).rejects.toThrow(BadRequestException);
    });
  });

  describe('job offers and applications', () => {
    it('creates offers from a whitelist and needs a title', async () => {
      const { service, offers } = setup();
      await expect(service.createOffers([{ title: 'Cashier', hours: '8', evil: 1, job_offer_id: 'x' }])).resolves.toBe('nice');
      expect(offers.bulkCreate.mock.calls[0][0]).toEqual([{ title: 'Cashier', hours: '8' }]);
      await expect(service.createOffers([{ hours: '8' }])).rejects.toThrow(BadRequestException);
      await expect(service.createOffers([])).rejects.toThrow(BadRequestException);
    });

    it('stores an application with status new and only the whitelisted fields', async () => {
      const { service, applications } = setup();
      await expect(service.createApplication({ name: 'Jan', email: 'jan@example.invalid', birthday: '2000-01-02', job_offer_id: 'o-1', status: 'hired', opmerkingen: 'x' })).resolves.toEqual({ job_application_id: 'a-1' });
      expect(applications.create.mock.calls[0][0]).toEqual({ name: 'Jan', email: 'jan@example.invalid', birthday: '2000-01-02', job_offer_id: 'o-1', status: 'new' });
    });

    it.each([
      ['no name', { email: 'a@b.c' }],
      ['an invalid e-mail address', { name: 'Jan', email: 'nope' }],
      ['an invalid birthday', { name: 'Jan', email: 'a@b.c', birthday: '2 jan' }],
      ['a text that is too long', { name: 'Jan', email: 'a@b.c', motivatie: 'x'.repeat(5001) }],
    ])('rejects an application with %s', async (_name, body) => {
      const { service, applications } = setup();
      await expect(service.createApplication(body)).rejects.toThrow(BadRequestException);
      expect(applications.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown job offer', async () => {
      const { service, applications } = setup({ offer: null });
      await expect(service.createApplication({ name: 'Jan', email: 'a@b.c', job_offer_id: 'nope' })).rejects.toThrow(BadRequestException);
      expect(applications.create).not.toHaveBeenCalled();
    });
  });
});
