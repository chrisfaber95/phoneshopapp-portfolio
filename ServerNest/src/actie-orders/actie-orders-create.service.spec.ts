import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op, Sequelize } from 'sequelize';
import { Principal } from '../auth/principal.service';
import { ActieOrder, ActieOrderHasProduct, CustomerHasSpaaractie, Product, ProductVariant, SpaaractieHasProduct } from '../database/models';
import { MailService } from '../mail/mail.service';
import { ActieOrdersCreateService, NOT_ENOUGH_STAMPS } from './actie-orders-create.service';
import { ActieOrdersService } from './actie-orders.service';

const now = new Date(2026, 8, 30, 10, 0, 0);
const customer: Principal = { type: 'customer', id: 'c-1' };

const body = (over: Record<string, unknown> = {}) => ({
  userDetails: { first_name: 'Jan', customerEmail: 'jan@example.invalid', address: {}, customer_id: 'other' },
  orderDetails: { spaaractie_id: 'a-1', delivery: false, pickupDate: '2026-10-02' },
  // the client claims the stamps cost nothing
  orderProducts: [{ amount: 2, product: { id: 5, price: '0.01' }, actieproduct: { stamps_cost: 0 } }],
  ...over,
});

const fullOrder = () => ({
  actie_order_information: { customerEmail: 'jan@example.invalid' },
  get: () => ({
    actie_order_information: { customerEmail: 'jan@example.invalid', first_name: 'Jan', createdAt: '2026-09-30T10:00:00Z' },
    product_list: [{ amount: 2, product_id: 5, product: { product_information: { title: 'Donar', variant: '' } }, actie_order_product_variant_list: [] }],
  }),
});

interface Setup { taken?: number; stampPrices?: unknown[]; products?: unknown[]; variants?: unknown[]; settings?: Record<string, unknown> }
const setup = (over: Setup = {}) => {
  const orders = { create: jest.fn().mockResolvedValue({ actie_order_id: 'ao-1' }) };
  const lines = { create: jest.fn().mockResolvedValue({}) };
  const cards = { update: jest.fn().mockResolvedValue([over.taken ?? 1]) };
  const actionProducts = { findAll: jest.fn().mockResolvedValue(over.stampPrices ?? [{ product_id: 5, stamps_cost: 4 }]) };
  const products = { findAll: jest.fn().mockResolvedValue(over.products ?? [{ id: 5, price: '9.99' }]) };
  const variants = { findAll: jest.fn().mockResolvedValue(over.variants ?? []) };
  const reading = { single: jest.fn().mockResolvedValue(fullOrder()) };
  const mail = { order: jest.fn((to: string, html: string) => ({ to, html })), send: jest.fn().mockResolvedValue(true) };
  const settings: Record<string, unknown> = { FEEDBACK_EMAIL: 'feedback@example.invalid', ...over.settings };
  const config = { get: (key: string) => settings[key] };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const service = new ActieOrdersCreateService(
    sequelize as unknown as Sequelize, orders as unknown as typeof ActieOrder, lines as unknown as typeof ActieOrderHasProduct, cards as unknown as typeof CustomerHasSpaaractie,
    actionProducts as unknown as typeof SpaaractieHasProduct, products as unknown as typeof Product, variants as unknown as typeof ProductVariant,
    reading as unknown as ActieOrdersService, mail as unknown as MailService, config as unknown as ConfigService<never, true>,
  );
  return { service, orders, lines, cards, actionProducts, mail };
};

describe('ActieOrdersCreateService', () => {
  it('takes the stamps the database says (4 per unit), not the price of the client', async () => {
    const { service, cards, lines, orders } = setup();
    await expect(service.create(customer, body(), now)).resolves.toEqual({ message: 'Bestelling verwerkt', success: true });
    // 2 x 4 stamps, from the card of the logged-in customer for this action, only when enough are left
    expect(cards.update.mock.calls[0][1].where).toEqual({ customer_id: 'c-1', spaaractie_id: 'a-1', stamp_amount: { [Op.gte]: 8 } });
    expect(orders.create.mock.calls[0][0]).toMatchObject({ status: 'ordered', delivery: false, pickup_date: '2026-10-02', paycode: `afhaal-c-1-${now.getTime()}`, actie_order_information: { customer_id: 'c-1' } });
    expect(lines.create.mock.calls[0][0]).toEqual({ amount: 2, actie_order_id: 'ao-1', product_id: 5, price: '9.99', stamps_cost: 4, actie_order_product_variant_list: [] });
  });

  it('does not create an order when there are not enough stamps', async () => {
    const { service, orders, mail } = setup({ taken: 0 });
    await expect(service.create(customer, body(), now)).resolves.toEqual({ error: NOT_ENOUGH_STAMPS, success: false });
    expect(orders.create).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('products that cost no stamps need no card', async () => {
    const { service, cards } = setup({ stampPrices: [{ product_id: 5, stamps_cost: 0 }] });
    await expect(service.create(customer, body(), now)).resolves.toMatchObject({ success: true });
    expect(cards.update).not.toHaveBeenCalled();
  });

  it('stores the variants of a unit with the line', async () => {
    const { service, lines } = setup({ variants: [{ product_variant_id: 11, product_id: 5 }] });
    await service.create(customer, body({ orderProducts: [{ product: { id: 5 }, variant: [[11]] }] }), now);
    expect(lines.create.mock.calls[0][0]).toMatchObject({ amount: 1, actie_order_product_variant_list: [{ product_variant_id: 11 }] });
  });

  it('rejects a variant that belongs to another product', async () => {
    const { service, orders } = setup({ variants: [{ product_variant_id: 11, product_id: 99 }] });
    await expect(service.create(customer, body({ orderProducts: [{ product: { id: 5 }, variant: [[11]] }] }), now)).rejects.toThrow(BadRequestException);
    expect(orders.create).not.toHaveBeenCalled();
  });

  it('rejects a product that is not part of the action', async () => {
    const { service, orders } = setup({ stampPrices: [] });
    await expect(service.create(customer, body(), now)).rejects.toMatchObject({ response: { error: 'Unknown product in the order' } });
    expect(orders.create).not.toHaveBeenCalled();
  });

  it('refuses delivery, which never worked in the old Server, without touching anything', async () => {
    const { service, cards, orders } = setup();
    const result = await service.create(customer, body({ orderDetails: { spaaractie_id: 'a-1', delivery: true } }), now);
    expect(result).toMatchObject({ success: false });
    expect(cards.update).not.toHaveBeenCalled();
    expect(orders.create).not.toHaveBeenCalled();
  });

  it('is for logged-in customers only', async () => {
    await expect(setup().service.create(null, body(), now)).rejects.toThrow(UnauthorizedException);
    await expect(setup().service.create({ type: 'user', id: 'u-1' }, body(), now)).rejects.toThrow(ForbiddenException);
  });

  it('rejects an invalid order before anything is written', async () => {
    const { service, cards } = setup();
    await expect(service.create(customer, body({ orderProducts: [] }), now)).rejects.toThrow(BadRequestException);
    expect(cards.update).not.toHaveBeenCalled();
  });

  it('mails the customer and the shop (default: the feedback address, never a hardcoded one)', async () => {
    const { service, mail } = setup();
    await service.create(customer, body(), now);
    expect(mail.order.mock.calls.map((call) => call[0])).toEqual(['jan@example.invalid', 'feedback@example.invalid']);
    const withSetting = setup({ settings: { ACTIE_ORDER_EMAIL: 'donar@example.invalid' } });
    await withSetting.service.create(customer, body(), now);
    expect(withSetting.mail.order.mock.calls[1][0]).toBe('donar@example.invalid');
  });

  it('a mail failure does not fail the order', async () => {
    const { service, mail } = setup();
    mail.order.mockImplementation(() => { throw new Error('template'); });
    await expect(service.create(customer, body(), now)).resolves.toMatchObject({ success: true });
  });
});
