import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../auth/crypto.service';
import { Order } from '../database/models';
import { Shop } from '../store/store.models';
import { ReceiptService } from './receipt.service';

const plainOrder = {
  status: 'ordered', invoice_number: '100', orderDate: '2026-09-30T10:15:00', winkelbon: '1234567890', picking_price: '2.00',
  order_information: { customerName: 'Jan Jansen', street: 'Kerkstraat', house_number: '2', zipcode: '9999 ZZ', city: 'Stad' },
  invoice_order_information: null,
  product_list: [{ amount: 2, picked: 2, price: '1.21', normal_total_price: '2.42', discounted_price: '2.42', product: { btw: 21, statiegeld: '0.00', product_information: { title: 'Melk', ean: '8710' } } }],
};

const setup = (over: { order?: unknown; shop?: unknown; decrypt?: string | null; withShops?: boolean; shopId?: string } = {}) => {
  const orders = { findOne: jest.fn().mockResolvedValue(over.order === undefined ? { get: () => plainOrder } : over.order) };
  const shops = { findOne: jest.fn().mockResolvedValue(over.shop === undefined ? { get: () => ({ shopname: 'Coop Test', information: { kvk: '1', address: { city: 'Dorp' } } }) } : over.shop) };
  const crypto = { decrypt: jest.fn().mockReturnValue(over.decrypt === undefined ? 'uuid-1' : over.decrypt) };
  const config = { get: (key: string) => (key === 'RECEIPT_SHOP_ID' ? over.shopId : undefined) };
  const service = new ReceiptService(orders as unknown as typeof Order, crypto as unknown as CryptoService, config as unknown as ConfigService<never, true>, over.withShops === false ? undefined : (shops as unknown as typeof Shop));
  return { service, orders, shops };
};

describe('ReceiptService', () => {
  it('renders a PDF for an order found by its UUID, also the invoice of the first payment', async () => {
    const { service, orders } = setup();
    const pdf = await service.receipt('0b1d3a5c-1111-2222-3333-444455556666', false);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(orders.findOne.mock.calls[0][0]).toMatchObject({ where: { uuid_id: '0b1d3a5c-1111-2222-3333-444455556666' }, paranoid: false });
    expect((await service.receipt('0b1d3a5c-1111-2222-3333-444455556666', true)).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('finds an order by the encrypted reference of the e-mail links', async () => {
    const { service, orders } = setup({ decrypt: 'uuid-9' });
    await service.receipt(`order||${'x'.repeat(41)}`, false);
    expect(orders.findOne.mock.calls[0][0].where).toEqual({ uuid_id: 'uuid-9' });
  });

  it('is a 404 for an unknown order or an invalid encrypted reference', async () => {
    await expect(setup({ order: null }).service.receipt('nope', false)).rejects.toThrow(NotFoundException);
    const invalid = setup({ decrypt: null });
    await expect(invalid.service.receipt('x'.repeat(41), false)).rejects.toThrow(NotFoundException);
    expect(invalid.orders.findOne).not.toHaveBeenCalled();
  });

  it('uses the configured shop, else the first one, and still renders without a shop or when the store database fails', async () => {
    const configured = setup({ shopId: 's-7' });
    await configured.service.receipt('uuid-1', false);
    expect(configured.shops.findOne.mock.calls[0][0].where).toEqual({ shop_id: 's-7' });

    const first = setup();
    await first.service.receipt('uuid-1', false);
    expect(first.shops.findOne.mock.calls[0][0].where).toBeUndefined();

    expect((await setup({ withShops: false }).service.receipt('uuid-1', false)).subarray(0, 5).toString()).toBe('%PDF-');
    const failing = setup();
    failing.shops.findOne.mockRejectedValue(new Error('no such database'));
    expect((await failing.service.receipt('uuid-1', false)).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('never reads the shop database credentials', async () => {
    const { service, shops } = setup();
    await service.receipt('uuid-1', false);
    expect(shops.findOne.mock.calls[0][0].attributes).toEqual(['shop_id', 'shopname']);
  });
});
