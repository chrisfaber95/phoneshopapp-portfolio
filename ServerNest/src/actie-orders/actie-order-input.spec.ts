import { OrderInputError } from '../orders/order-input';
import { parseNewActieOrder } from './actie-order-input';

const today = new Date('2026-09-30T10:00:00Z');

const body = (over: Record<string, unknown> = {}, details: Record<string, unknown> = {}) => ({
  userDetails: { first_name: 'Jan', customerEmail: 'jan@example.invalid', address: { street: 'Dorpsstraat', house_number: '1' }, zipcode: '1234AB', city: 'Dorp', customer_id: 'someone-else' },
  invoiceDetails: { first_name: 'Jan', customerEmail: 'jan@example.invalid', address: {} },
  orderDetails: { spaaractie_id: 'a-1', delivery: false, pickupDate: '2026-10-02', totalPrice: 0, delivery_cost: 0, ...details },
  orderProducts: { 5: { amount: 2, product: { id: 5, price: '9.99' }, actieproduct: { stamps_cost: 0 } } },
  ...over,
});

describe('parseNewActieOrder', () => {
  it('keeps the products, contact details (with the address object of the client) and the action; drops prices and the customer id', () => {
    const order = parseNewActieOrder(body(), today);
    expect(order).toMatchObject({ spaaractieId: 'a-1', delivery: false, pickupDate: '2026-10-02', pickupTime: null, lines: [{ product_id: 5, amount: 2, variants: null }] });
    expect(order.user).toMatchObject({ street: 'Dorpsstraat', house_number: '1', zipcode: '1234AB' });
    expect(JSON.stringify(order)).not.toContain('someone-else');
    expect(JSON.stringify(order)).not.toContain('stamps_cost');
  });

  it('every unit of a product with variants is its own line with its variants', () => {
    const order = parseNewActieOrder(body({ orderProducts: [{ amount: 2, product: { id: 7 }, variant: [[11, 12], [13]] }] }), today);
    expect(order.lines).toEqual([{ product_id: 7, amount: 1, variants: [11, 12] }, { product_id: 7, amount: 1, variants: [13] }]);
    const asObject = parseNewActieOrder(body({ orderProducts: [{ product: { id: 7 }, variant: { 0: [11] } }] }), today);
    expect(asObject.lines).toEqual([{ product_id: 7, amount: 1, variants: [11] }]);
  });

  it('a delivery flag, no pickup date and a time are understood', () => {
    const order = parseNewActieOrder(body({}, { delivery: true, pickupDate: null, pickupTime: '09:05' }), today);
    expect([order.delivery, order.pickupDate, order.pickupTime]).toEqual([true, null, '09:05:00']);
  });

  it.each([
    ['no e-mail address', body({ userDetails: { first_name: 'Jan' } })],
    ['no action', body({}, { spaaractie_id: undefined })],
    ['no products', body({ orderProducts: {} })],
    ['an amount of zero', body({ orderProducts: [{ amount: 0, product: { id: 5 } }] })],
    ['a huge amount', body({ orderProducts: [{ amount: 1000, product: { id: 5 } }] })],
    ['a product without id', body({ orderProducts: [{ amount: 1, product: {} }] })],
    ['a variant list that is not a list', body({ orderProducts: [{ product: { id: 5 }, variant: ['x'] }] })],
    ['an impossible date', body({}, { pickupDate: '2026-02-31' })],
    ['a date in the past', body({}, { pickupDate: '2026-01-01' })],
    ['an invalid time', body({}, { pickupTime: '25:00' })],
  ])('rejects %s', (_name, input) => {
    expect(() => parseNewActieOrder(input, today)).toThrow(OrderInputError);
  });
});
