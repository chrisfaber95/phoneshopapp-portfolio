import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { Principal } from '../auth/principal.service';
import { Order, OrderHasProduct, Product } from '../database/models';
import { MollieService } from '../payments/mollie.service';
import { OrdersCreateService } from './orders-create.service';

const now = new Date(2026, 8, 30, 10, 0, 0);
const settings: Record<string, unknown> = { PICKUP_FEE: 2, DELIVERY_FEE: 3, BASE_URL: undefined };

// 2 x 4.50 + 1 x 1.00, 0.25 deposit on the first product
const productRows = [
  { id: 5, price: '4.50', statiegeld: '0.25', product_has_discount_list: [] },
  { id: 6, price: '1.00', statiegeld: null, product_has_discount_list: [] },
];

const body = (over: Record<string, unknown> = {}) => ({
  userDetails: { first_name: 'Jan', customerEmail: 'jan@example.invalid', klantenkaart: '123', address: {}, customer_id: 'other' },
  orderDetails: { delivery: false, pickupDate: '2026-10-02', pickupTime: '10:30:00', koopzegels: 4, spaarzegels: 'a', storepoints: 0, totalPrice: 0.01, picking_price: 0.01 },
  orderProducts: [{ amount: 2, product: { id: 5, price: '0.01' } }, { amount: 1, product: { id: 6, price: '0.01' } }],
  ...over,
});

const setup = (over: { createPayment?: jest.Mock; products?: unknown[]; testCard?: boolean } = {}) => {
  const created = { id: 77, uuid_id: 'o-1' };
  const orders = { count: jest.fn().mockResolvedValue(3), create: jest.fn().mockResolvedValue(created), update: jest.fn().mockResolvedValue([1]), destroy: jest.fn().mockResolvedValue(1) };
  const lines = { bulkCreate: jest.fn().mockResolvedValue([]), destroy: jest.fn().mockResolvedValue(1) };
  const products = { findAll: jest.fn().mockResolvedValue(over.products ?? productRows) };
  const mollie = {
    createPayment: over.createPayment ?? jest.fn().mockResolvedValue({ id: 'tr_1', status: 'open', checkoutUrl: 'https://pay.test/tr_1' }),
    isTestCard: jest.fn().mockReturnValue(over.testCard ?? false),
  };
  const sequelize = { transaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) => work({ id: 'tx' })) };
  const config = { get: (key: string) => settings[key] };
  const service = new OrdersCreateService(
    sequelize as unknown as Sequelize, orders as unknown as typeof Order, lines as unknown as typeof OrderHasProduct, products as unknown as typeof Product,
    mollie as unknown as MollieService, config as unknown as ConfigService<never, true>,
  );
  return { service, orders, lines, products, mollie, sequelize };
};

const customer: Principal = { type: 'customer', id: 'c-1' };

describe('OrdersCreateService', () => {
  it('prices the order from the database, not from the client, and answers with the checkout link', async () => {
    const { service, orders, lines, mollie } = setup();
    await expect(service.create(null, body(), 'https://shop.test', now)).resolves.toEqual({ payment: 'https://pay.test/tr_1', success: true });

    const values = orders.create.mock.calls[0][0];
    // 2 x 4.50 + 1.00 + deposit 2 x 0.25 + 4 koopzegels x 0.05 = 10.70
    expect(values).toMatchObject({ totalPrice: '10.70', picking_price: '2.00', status: 'pending', invoice_number: 'NL3555_2026830_0004', koopzegels: 4 });
    expect(lines.bulkCreate.mock.calls[0][0]).toEqual([
      { amount: 2, order_id: 77, product_id: 5, price: 4.5, discounted_price: 9, normal_total_price: 9 },
      { amount: 1, order_id: 77, product_id: 6, price: 1, discounted_price: 1, normal_total_price: 1 },
    ]);
    expect(mollie.createPayment).toHaveBeenCalledWith({ amount: 2, description: 'Uw bestelling bij Coop Lubbers', redirectUrl: 'https://shop.test?return=payment', method: undefined, test: false });
    expect(orders.update).toHaveBeenCalledWith({ paymentMethod: 'tr_1' }, expect.objectContaining({ where: { uuid_id: 'o-1' } }));
  });

  it('charges the delivery fee for a delivery', async () => {
    const { service, mollie } = setup();
    await service.create(null, body({ orderDetails: { ...body().orderDetails, delivery: true } }), undefined, now);
    expect(mollie.createPayment.mock.calls[0][0].amount).toBe(3);
  });

  it('links the order to the customer of the token only, never to the customer id in the body', async () => {
    const guest = setup();
    await guest.service.create(null, body(), undefined, now);
    expect(guest.orders.create.mock.calls[0][0]).toMatchObject({ customer_id: null, order_information: { customer_id: null } });

    const known = setup();
    await known.service.create(customer, body(), undefined, now);
    expect(known.orders.create.mock.calls[0][0]).toMatchObject({ customer_id: 'c-1', order_information: { customer_id: 'c-1' }, invoice_order_information: { customer_id: 'c-1' } });

    const employee = setup();
    await employee.service.create({ type: 'user', id: 'u-1' }, body(), undefined, now);
    expect(employee.orders.create.mock.calls[0][0]).toMatchObject({ customer_id: null });
  });

  it('applies the discounts of the pickup day', async () => {
    const discount = { discount_id: 1, isPercentage: true, discount_price: 50, discount_info: { starting_date: '2026-10-01', end_date: '2026-10-31', isCombination: false, discount_type: { min_amount: 1 } } };
    const { service, orders } = setup({ products: [{ ...productRows[0], product_has_discount_list: [discount] }, productRows[1]] });
    await service.create(null, body(), undefined, now);
    // 2 x 4.50 at 50% = 4.50, + 1.00 + 0.50 deposit + 0.20 stamps
    expect(orders.create.mock.calls[0][0].totalPrice).toBe('6.20');
  });

  it('uses the test key for a test card', async () => {
    const { service, mollie } = setup({ testCard: true });
    await service.create(null, body(), undefined, now);
    expect(mollie.createPayment.mock.calls[0][0].test).toBe(true);
    expect(mollie.isTestCard).toHaveBeenCalledWith('123');
  });

  it('rejects an invalid order before anything is written', async () => {
    const { service, orders, mollie } = setup();
    await expect(service.create(null, body({ orderProducts: [] }), undefined, now)).rejects.toThrow(BadRequestException);
    expect(orders.create).not.toHaveBeenCalled();
    expect(mollie.createPayment).not.toHaveBeenCalled();
  });

  it('rejects an unknown product', async () => {
    const { service, orders } = setup({ products: [productRows[0]] });
    await expect(service.create(null, body(), undefined, now)).rejects.toMatchObject({ response: { docs: 'Unknown product in the order', success: false } });
    expect(orders.create).not.toHaveBeenCalled();
  });

  it('removes the order again when the payment cannot be started', async () => {
    const { service, orders, lines } = setup({ createPayment: jest.fn().mockRejectedValue(new Error('Mollie down')) });
    await expect(service.create(null, body(), undefined, now)).rejects.toThrow(BadRequestException);
    expect(lines.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { order_id: 77 } }));
    expect(orders.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { uuid_id: 'o-1' }, force: true }));
  });

  it('removes the order when Mollie gives no checkout link', async () => {
    const { service, orders } = setup({ createPayment: jest.fn().mockResolvedValue({ id: 'tr_9', status: 'paid', checkoutUrl: null }) });
    await expect(service.create(null, body(), undefined, now)).rejects.toThrow(BadRequestException);
    expect(orders.destroy).toHaveBeenCalled();
  });
});
