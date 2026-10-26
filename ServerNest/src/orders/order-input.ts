import { asRecord } from '../customers/customer-fields';

export class OrderInputError extends Error {}

export interface ContactDetails {
  customerName: string | null;
  first_name: string | null;
  surname: string | null;
  kvk: string | null;
  business: string | null;
  customerPhone: string | null;
  klantenkaart: string | null;
  customerEmail: string | null;
  street: string | null;
  house_number: string | null;
  house_addition: string | null;
  zipcode: string | null;
  city: string | null;
}

export interface NewOrder {
  user: ContactDetails;
  invoice: ContactDetails;
  delivery: boolean;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM:SS
  koopzegels: number;
  spaarzegels: string;
  storepoints: number;
  method?: string;
  lines: { product_id: number; amount: number }[];
}

const MAX_TEXT = 255;
const MAX_AMOUNT = 999;
const MAX_LINES = 200;
const MAX_KOOPZEGELS = 1000;

const text = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' && typeof value !== 'number') throw new OrderInputError('Invalid contact details');
  const trimmed = String(value).trim();
  if (trimmed.length > MAX_TEXT) throw new OrderInputError('Invalid contact details');
  return trimmed === '' ? null : trimmed;
};

export const contact = (value: unknown): ContactDetails => {
  const source = asRecord(value);
  const address = asRecord(source.address);
  return {
    customerName: text(source.customerName),
    first_name: text(source.first_name),
    surname: text(source.surname),
    kvk: text(source.kvk),
    business: text(source.business),
    customerPhone: text(source.customerPhone),
    klantenkaart: text(source.klantenkaart),
    customerEmail: text(source.customerEmail),
    street: text(address.street),
    house_number: text(address.house_number),
    house_addition: text(address.house_addition),
    zipcode: text(source.zipcode),
    city: text(source.city),
  };
};

const count = (value: unknown, max: number, what: string): number => {
  const number = value === undefined || value === null || value === '' || value === false ? 0 : value === true ? 1 : Number(value);
  if (!Number.isInteger(number) || number < 0 || number > max) throw new OrderInputError(`Invalid ${what}`);
  return number;
};

export const isEmail = (value: string | null): value is string => value !== null && /^[^\s@]+@[^\s@]+$/.test(value);

// Validates the body of POST /order and keeps only what the order needs. The client's prices and totals are not read: the
// server prices the order itself.
export const parseNewOrder = (body: unknown, today: Date = new Date()): NewOrder => {
  const source = asRecord(body);
  const details = asRecord(source.orderDetails);

  const user = contact(source.userDetails);
  if (!isEmail(user.customerEmail)) throw new OrderInputError('A valid e-mail address is required');
  const invoice = source.invoiceDetails ? contact(source.invoiceDetails) : user;

  const pickupDate = typeof details.pickupDate === 'string' ? details.pickupDate.slice(0, 10) : '';
  const date = new Date(`${pickupDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== pickupDate) throw new OrderInputError('Invalid pickup date');
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (pickupDate < yesterday) throw new OrderInputError('The pickup date is in the past');

  const time = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.exec(typeof details.pickupTime === 'string' ? details.pickupTime : '');
  if (!time) throw new OrderInputError('Invalid pickup time');

  const cart = Array.isArray(source.orderProducts) ? source.orderProducts : Object.values(asRecord(source.orderProducts));
  if (cart.length === 0 || cart.length > MAX_LINES) throw new OrderInputError('The order needs products');
  const lines = cart.map((entry) => {
    const item = asRecord(entry);
    const productId = Number(asRecord(item.product).id);
    const amount = Number(item.amount);
    if (!Number.isInteger(productId) || productId < 1) throw new OrderInputError('Invalid product');
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) throw new OrderInputError('Invalid amount');
    return { product_id: productId, amount };
  });

  const stamps = Array.isArray(details.spaarzegels) ? details.spaarzegels.join(',') : details.spaarzegels;
  const method = typeof source.selectedBetaal === 'string' ? source.selectedBetaal : undefined;
  return {
    user,
    invoice,
    delivery: details.delivery === true || details.delivery === 1 || details.delivery === 'true',
    pickupDate,
    pickupTime: time[3] ? time[0] : `${time[0]}:00`,
    koopzegels: count(details.koopzegels, MAX_KOOPZEGELS, 'stamps'),
    spaarzegels: typeof stamps === 'string' || typeof stamps === 'number' ? String(stamps).slice(0, MAX_TEXT) : '',
    storepoints: count(details.storepoints, MAX_KOOPZEGELS, 'points'),
    method,
    lines,
  };
};
