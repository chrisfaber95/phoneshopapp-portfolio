import { invoiceNumber } from './invoice-number';
import { OrderInputError, parseNewOrder } from './order-input';

const today = new Date('2026-09-30T10:00:00Z');

// what the Klant order page sends (the prices and totals in it are not read)
const body = (over: Record<string, unknown> = {}, details: Record<string, unknown> = {}) => ({
  userDetails: { first_name: 'Jan', surname: 'Jansen', customerEmail: 'jan@example.invalid', klantenkaart: '123', address: { street: 'Dorpsstraat', house_number: '1' }, zipcode: '1234AB', city: 'Dorp', customer_id: 'someone-else' },
  invoiceDetails: { first_name: 'Jan', customerEmail: 'jan@example.invalid', address: {} },
  orderDetails: { delivery: false, pickupDate: '2026-10-02', pickupTime: '10:30:00', totalPrice: 0.01, picking_price: 0.01, koopzegels: 2, spaarzegels: ['a', 'b'], storepoints: true, ...details },
  orderProducts: { 5: { amount: 2, product: { id: 5, price: '0.01' } } },
  ...over,
});

describe('parseNewOrder', () => {
  it('keeps what the order needs and drops the prices and the customer id of the client', () => {
    const order = parseNewOrder(body(), today);
    expect(order).toMatchObject({
      delivery: false, pickupDate: '2026-10-02', pickupTime: '10:30:00', koopzegels: 2, spaarzegels: 'a,b', storepoints: 1,
      lines: [{ product_id: 5, amount: 2 }],
    });
    expect(order.user).toMatchObject({ first_name: 'Jan', street: 'Dorpsstraat', house_number: '1', zipcode: '1234AB', customerEmail: 'jan@example.invalid' });
    expect(JSON.stringify(order)).not.toContain('someone-else');
    expect(order).not.toHaveProperty('totalPrice');
  });

  it('accepts the cart as a list, a time without seconds and an optional payment method', () => {
    const order = parseNewOrder({ ...body({ orderProducts: [{ amount: 1, product: { id: 7 } }], selectedBetaal: 'ideal' }, { pickupTime: '09:05' }) }, today);
    expect([order.lines, order.pickupTime, order.method]).toEqual([[{ product_id: 7, amount: 1 }], '09:05:00', 'ideal']);
  });

  it('uses the customer details for the invoice when none are sent', () => {
    const withoutInvoice: Record<string, unknown> = body();
    delete withoutInvoice.invoiceDetails;
    const order = parseNewOrder(withoutInvoice, today);
    expect(order.invoice).toEqual(order.user);
  });

  it.each([
    ['no e-mail address', body({ userDetails: { first_name: 'Jan' } })],
    ['an invalid e-mail address', body({ userDetails: { customerEmail: 'nope' } })],
    ['no products', body({ orderProducts: {} })],
    ['an amount of zero', body({ orderProducts: [{ amount: 0, product: { id: 5 } }] })],
    ['a fractional amount', body({ orderProducts: [{ amount: 1.5, product: { id: 5 } }] })],
    ['a huge amount', body({ orderProducts: [{ amount: 100000, product: { id: 5 } }] })],
    ['a product without id', body({ orderProducts: [{ amount: 1, product: {} }] })],
    ['an impossible date', body({}, { pickupDate: '2026-02-31' })],
    ['a date in the past', body({}, { pickupDate: '2026-01-01' })],
    ['no pickup time', body({}, { pickupTime: undefined })],
    ['a negative stamp count', body({}, { koopzegels: -1 })],
    ['a very long text', body({ userDetails: { customerEmail: 'a@b.c', address: { street: 'x'.repeat(300) } } })],
    ['an object as text', body({ userDetails: { customerEmail: 'a@b.c', city: { a: 1 } } })],
  ])('rejects %s', (_name, input) => {
    expect(() => parseNewOrder(input, today)).toThrow(OrderInputError);
  });

  it('rejects a body that is not an object', () => {
    expect(() => parseNewOrder(null, today)).toThrow(OrderInputError);
    expect(() => parseNewOrder('x', today)).toThrow(OrderInputError);
  });
});

describe('invoiceNumber', () => {
  it('has the format of the old Server: month counted from 0, 4 digit number of the order today', () => {
    expect(invoiceNumber(new Date(2026, 8, 30), 0)).toBe('NL3555_2026830_0001');
    expect(invoiceNumber(new Date(2026, 0, 5), 41)).toBe('NL3555_202605_0042');
    expect(invoiceNumber(new Date(2026, 8, 30), 11999)).toBe('NL3555_2026830_12000');
  });
});
