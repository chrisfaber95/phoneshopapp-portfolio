import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { CryptoService } from '../auth/crypto.service';
import { Principal } from '../auth/principal.service';
import { CustomerHasSpaaractie, Discounts, Order, OrderHasProduct, Spaaractie } from '../database/models';
import { MailService } from '../mail/mail.service';
import { MollieService } from '../payments/mollie.service';
import { OrdersUpdateService } from './orders-update.service';
import { OrdersService } from './orders.service';

const employee: Principal = { type: 'user', id: 'u-1' };
const customer: Principal = { type: 'customer', id: 'c-1' };
const UUID = '0b1d3a5c-1111-2222-3333-444455556666';

// the order as it is stored: id 7, being picked
const stored = (over: Record<string, unknown> = {}) => ({ uuid_id: UUID, id: 7, status: 'ordered', finalPrice: '12.50', pickupDate: '2099-01-01', ...over });
// the order as answered after the update (with its contact records)
const answered = (status: string, over: Record<string, unknown> = {}) => ({
  uuid_id: UUID, status, customer_id: 'c-9', finalPrice: '25.00', spaarzegels: 'a-1, ,a-2',
  order_information: { customerEmail: 'jan@example.invalid', customer: { email: 'account@example.invalid' } },
  get: () => ({ pickupTime: '10:30:00', delivery: false, product_list: [{ picked: 2, product: { product_information: { title: 'Melk', variant: '1L' } } }] }),
  ...over,
});

interface Setup { order?: unknown; updated?: unknown; lines?: unknown[]; payment?: unknown; decrypt?: string | null }
const setup = (over: Setup = {}) => {
  const orders = { findOne: jest.fn().mockResolvedValue(over.order === undefined ? { ...stored(), $get: jest.fn().mockResolvedValue({ klantenkaart: '123' }) } : over.order), update: jest.fn().mockResolvedValue([1]) };
  const lines = {
    findAll: jest.fn().mockResolvedValue(over.lines ?? [{ id: 100, amount: 2, price: '1.00', product: { price: '1.50', product_has_discount_list: [] } }]),
    update: jest.fn().mockResolvedValue([1]),
    create: jest.fn().mockResolvedValue({}),
  };
  const discountList = { findAll: jest.fn().mockResolvedValue([]) };
  const spaaracties = { findByPk: jest.fn().mockResolvedValue({ stamp_price: '10.00' }) };
  const customerSpaaracties = { findOrCreate: jest.fn().mockResolvedValue([{ customer_has_spaaractie_id: 'card-1' }, true]), increment: jest.fn().mockResolvedValue(undefined) };
  const reading = { single: jest.fn().mockResolvedValue(over.updated === undefined ? answered('ordered') : over.updated) };
  const crypto = { decrypt: jest.fn().mockReturnValue(over.decrypt === undefined ? UUID : over.decrypt), encrypt: jest.fn().mockReturnValue('encrypted') };
  const mollie = {
    createPayment: jest.fn().mockResolvedValue(over.payment ?? { id: 'tr_2', status: 'open', checkoutUrl: 'https://pay.test/2' }),
    isTestCard: jest.fn().mockReturnValue(false),
  };
  const mail = { orderWithQr: jest.fn().mockResolvedValue({ to: 'x' }), send: jest.fn().mockResolvedValue(true) };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const config = { get: (key: string) => (key === 'BASE_URL' ? 'https://shop.test/' : undefined) };
  const service = new OrdersUpdateService(
    sequelize as unknown as Sequelize, orders as unknown as typeof Order, lines as unknown as typeof OrderHasProduct, discountList as unknown as typeof Discounts,
    spaaracties as unknown as typeof Spaaractie, customerSpaaracties as unknown as typeof CustomerHasSpaaractie, reading as unknown as OrdersService,
    crypto as unknown as CryptoService, mollie as unknown as MollieService, mail as unknown as MailService, config as unknown as ConfigService<never, true>,
  );
  return { service, orders, lines, discountList, spaaracties, customerSpaaracties, reading, crypto, mollie, mail };
};

describe('OrdersUpdateService', () => {
  describe('who may do what', () => {
    it.each(['Update', 'Product', 'Storepayment', 'Whatever'])('%s needs an employee token', async (type) => {
      const { service, orders } = setup();
      await expect(service.update(null, UUID, { type })).rejects.toThrow(UnauthorizedException);
      await expect(service.update(customer, UUID, { type })).rejects.toThrow(ForbiddenException);
      expect(orders.update).not.toHaveBeenCalled();
    });

    it('an unknown type is a 400 for an employee', async () => {
      await expect(setup().service.update(employee, UUID, { type: 'Nope' })).rejects.toThrow(BadRequestException);
      await expect(setup().service.update(employee, UUID, null)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Onlinepayment (public, through the link in the mail)', () => {
    const scanned = () => ({ ...stored({ status: 'scanned' }), $get: jest.fn().mockResolvedValue({ klantenkaart: '123' }) });

    it('starts the payment of the final price and gives the client only what it needs', async () => {
      const { service, mollie, orders, reading } = setup({ order: scanned() });
      const result = await service.update(null, `order||${'x'.repeat(41)}`, { type: 'Onlinepayment' });
      expect(mollie.createPayment).toHaveBeenCalledWith({ amount: 12.5, description: 'Online bestelling Coop Lubbers', redirectUrl: 'https://shop.test/', method: 'ideal', test: false });
      expect(orders.update).toHaveBeenCalledWith({ paycode: 'tr_2' }, expect.objectContaining({ where: { uuid_id: UUID } }));
      expect(result).toEqual({ docs: { id: 'tr_2', status: 'open', _links: { checkout: { href: 'https://pay.test/2' } } }, order: expect.anything() });
      expect(reading.single).toHaveBeenCalledWith(UUID);
    });

    it('an order that is not scanned (or has no final price) is only answered', async () => {
      const { service, mollie, reading } = setup();
      await service.update(null, UUID, { type: 'Onlinepayment' });
      expect(mollie.createPayment).not.toHaveBeenCalled();
      expect(reading.single).toHaveBeenCalled();
    });

    it('answers { err } for an unknown order or an invalid reference, and when Mollie fails', async () => {
      await expect(setup({ order: null }).service.update(null, UUID, { type: 'Onlinepayment' })).resolves.toEqual({ err: 'Order not found' });
      await expect(setup({ decrypt: null }).service.update(null, 'x'.repeat(41), { type: 'Onlinepayment' })).resolves.toEqual({ err: 'Order not found' });
      const failing = setup({ order: scanned() });
      failing.mollie.createPayment.mockRejectedValue(new Error('down'));
      await expect(failing.service.update(null, UUID, { type: 'Onlinepayment' })).resolves.toEqual({ err: 'The payment could not be started' });
    });
  });

  describe('Storepayment', () => {
    it('marks the order as paid at the counter', async () => {
      const { service, orders } = setup();
      await expect(service.update(employee, UUID, { type: 'Storepayment', picker: 'jan' })).resolves.toEqual({ success: true, message: 'Succesvol afgerekend' });
      expect(orders.update).toHaveBeenCalledWith({ paycode: 'employee-jan' }, expect.objectContaining({ where: { uuid_id: UUID } }));
    });

    it('an unknown order is a 400', async () => {
      await expect(setup({ order: null }).service.update(employee, UUID, { type: 'Storepayment', picker: 'jan' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('Product', () => {
    it('adds a line to the order of the URL, whatever order id the body names', async () => {
      const { service, lines } = setup();
      await service.update(employee, UUID, { type: 'Product', product: { product_id: 5, amount: 2, order_id: 999, id: 1, price: '1.00' } });
      expect(lines.create).toHaveBeenCalledWith({ product_id: 5, amount: 2, price: '1.00', order_id: 7 }, expect.anything());
    });

    it('needs a product', async () => {
      await expect(setup().service.update(employee, UUID, { type: 'Product', product: {} })).rejects.toThrow(BadRequestException);
    });
  });

  describe('Update', () => {
    it('saves only the fields of the whitelist', async () => {
      const { service, orders } = setup();
      await service.update(employee, UUID, { type: 'Update', order: { status: 'scanned', finalPrice: 12.5, pickingcrate: 'K1', paymentMethod: 'tr_x', invoice_number: 'x', customer_id: 'c-5', order_information_id: 'o-5', id: 99 } });
      expect(orders.update.mock.calls[0][0]).toEqual({ status: 'scanned', finalPrice: 12.5, pickingcrate: 'K1' });
    });

    it('updates the lines of this order only', async () => {
      const { service, lines } = setup();
      await service.update(employee, UUID, { type: 'Update', order: { product_list: [{ id: 100, picked: 2, order_id: 5, product_id: 77 }] } });
      expect(lines.update).toHaveBeenCalledWith({ picked: 2 }, expect.objectContaining({ where: { id: 100, order_id: 7 } }));
      await expect(service.update(employee, UUID, { type: 'Update', order: { product_list: [{ id: 555, picked: 1 }] } })).rejects.toThrow(BadRequestException);
    });

    it('leaves out a line without id (new lines come with the Product request) and finds the order by the numeric id of the admin app', async () => {
      const { service, lines, orders } = setup();
      await service.update(employee, '7', { type: 'Update', order: { status: 'ordered', product_list: [{ picked: 1 }, { id: 100, picked: 3 }] } });
      expect(orders.findOne.mock.calls[0][0].where).toEqual({ id: 7 });
      expect(lines.update).toHaveBeenCalledTimes(2); // the line with id, and the repricing of the order
      expect(lines.update.mock.calls[0][0]).toEqual({ picked: 3 });
    });

    it('recalculates the prices from the products while the pickup day has not started', async () => {
      const { service, lines } = setup();
      await service.update(employee, UUID, { type: 'Update', order: { status: 'ordered' } });
      // 2 x current price 1.50
      expect(lines.update).toHaveBeenLastCalledWith({ price: '1.50', discounted_price: 3, normal_total_price: 3 }, expect.objectContaining({ where: { id: 100 } }));
    });

    it('keeps the stored prices once the pickup day has started', async () => {
      const { service, lines } = setup({ order: { ...stored({ pickupDate: '2020-01-01' }), $get: jest.fn() } });
      await service.update(employee, UUID, { type: 'Update', order: {} });
      expect(lines.update).toHaveBeenLastCalledWith({ price: '1.00', discounted_price: 2, normal_total_price: 2 }, expect.anything());
    });

    it('answers the saved order, not the body', async () => {
      const { service } = setup({ updated: answered('ordered', { marker: 'from the database' }) });
      await expect(service.update(employee, UUID, { type: 'Update', order: { evil: true } })).resolves.toMatchObject({ marker: 'from the database' });
    });

    it('mails the customer once when the order becomes scanned', async () => {
      const { service, mail } = setup({ updated: answered('scanned') });
      await service.update(employee, UUID, { type: 'Update', order: { status: 'scanned' } });
      expect(mail.orderWithQr).toHaveBeenCalledWith('jan@example.invalid', expect.stringContaining('Melk'), 'order||encrypted');
      expect(mail.send).toHaveBeenCalledTimes(1);
    });

    it('sends no mail again when the order was already scanned', async () => {
      const { service, mail } = setup({ order: { ...stored({ status: 'scanned' }), $get: jest.fn() }, updated: answered('scanned') });
      await service.update(employee, UUID, { type: 'Update', order: { status: 'scanned', pickingcrate: 'K2' } });
      expect(mail.send).not.toHaveBeenCalled();
    });

    it('adds the stamps of the saving actions when the order is picked up, once', async () => {
      const { service, customerSpaaracties } = setup({ updated: answered('afgehaald') });
      await service.update(employee, UUID, { type: 'Update', order: { status: 'afgehaald' } });
      // final price 25.00 / 10.00 per stamp = 2 stamps for each of the two actions (the empty entry is skipped)
      expect(customerSpaaracties.increment).toHaveBeenCalledTimes(2);
      expect(customerSpaaracties.increment).toHaveBeenCalledWith({ stamp_amount: 2 }, expect.objectContaining({ where: { customer_has_spaaractie_id: 'card-1' } }));

      const again = setup({ order: { ...stored({ status: 'afgehaald' }), $get: jest.fn() }, updated: answered('afgehaald') });
      await again.service.update(employee, UUID, { type: 'Update', order: { pickingcrate: 'K3' } });
      expect(again.customerSpaaracties.increment).not.toHaveBeenCalled();
    });

    it('no stamps for a guest order or a final price below one stamp', async () => {
      const guest = setup({ updated: answered('afgehaald', { customer_id: null }) });
      await guest.service.update(employee, UUID, { type: 'Update', order: { status: 'afgehaald' } });
      expect(guest.customerSpaaracties.increment).not.toHaveBeenCalled();
      const small = setup({ updated: answered('afgehaald', { finalPrice: '4.00' }) });
      await small.service.update(employee, UUID, { type: 'Update', order: { status: 'afgehaald' } });
      expect(small.customerSpaaracties.increment).not.toHaveBeenCalled();
    });

    it('a failing mail or stamp does not fail the update', async () => {
      const failing = setup({ updated: answered('scanned') });
      failing.mail.orderWithQr.mockRejectedValue(new Error('qr'));
      await expect(failing.service.update(employee, UUID, { type: 'Update', order: { status: 'scanned' } })).resolves.toBeDefined();
      const stamps = setup({ updated: answered('afgehaald') });
      stamps.spaaracties.findByPk.mockRejectedValue(new Error('db'));
      await expect(stamps.service.update(employee, UUID, { type: 'Update', order: { status: 'afgehaald' } })).resolves.toBeDefined();
    });
  });
});
