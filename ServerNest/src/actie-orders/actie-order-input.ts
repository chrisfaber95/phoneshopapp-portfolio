import { asRecord } from '../customers/customer-fields';
import { ContactDetails, OrderInputError, contact, isEmail } from '../orders/order-input';

export interface ActieOrderLine {
  product_id: number;
  amount: number;
  // one entry per unit when the product has variants (every unit is its own order line with its variants)
  variants: number[] | null;
}

export interface NewActieOrder {
  user: ContactDetails;
  invoice: ContactDetails;
  spaaractieId: string;
  delivery: boolean;
  pickupDate: string | null;
  pickupTime: string | null;
  lines: ActieOrderLine[];
}

const MAX_AMOUNT = 99;
const MAX_LINES = 100;

const whole = (value: unknown, min = 0): number => {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isInteger(number) || number < min) throw new OrderInputError('Invalid number in the order');
  return number;
};

// What the client's cart holds per product: { product: { id }, amount, variant?: [[variant ids of unit 1], [of unit 2], ...] }
// (the old Server also accepted the list as an object keyed by index). The stamp prices and product prices of the client are not read.
export const parseNewActieOrder = (body: unknown, today: Date = new Date()): NewActieOrder => {
  const source = asRecord(body);
  const details = asRecord(source.orderDetails);

  const user = contact(source.userDetails);
  if (!isEmail(user.customerEmail)) throw new OrderInputError('A valid e-mail address is required');
  const invoice = source.invoiceDetails ? contact(source.invoiceDetails) : user;

  const spaaractieId = details.spaaractie_id;
  if (typeof spaaractieId !== 'string' || spaaractieId === '' || spaaractieId.length > 64) throw new OrderInputError('A savings action is required');

  let pickupDate: string | null = null;
  if (details.pickupDate !== undefined && details.pickupDate !== null && details.pickupDate !== '') {
    pickupDate = typeof details.pickupDate === 'string' ? details.pickupDate.slice(0, 10) : '';
    const date = new Date(`${pickupDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== pickupDate) throw new OrderInputError('Invalid pickup date');
    if (pickupDate < new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)) throw new OrderInputError('The pickup date is in the past');
  }
  let pickupTime: string | null = null;
  if (details.pickupTime !== undefined && details.pickupTime !== null && details.pickupTime !== '') {
    const time = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.exec(typeof details.pickupTime === 'string' ? details.pickupTime : '');
    if (!time) throw new OrderInputError('Invalid pickup time');
    pickupTime = time[3] ? time[0] : `${time[0]}:00`;
  }

  const cart = Array.isArray(source.orderProducts) ? source.orderProducts : Object.values(asRecord(source.orderProducts));
  if (cart.length === 0 || cart.length > MAX_LINES) throw new OrderInputError('The order needs products');
  const lines: ActieOrderLine[] = [];
  for (const entry of cart) {
    const item = asRecord(entry);
    const productId = whole(asRecord(item.product).id, 1);
    const variant = item.variant;
    const units = Array.isArray(variant) ? variant : variant && typeof variant === 'object' ? Object.values(variant) : [];
    if (units.length > 0) {
      if (units.length > MAX_AMOUNT) throw new OrderInputError('Invalid amount');
      for (const unit of units) {
        if (!Array.isArray(unit)) throw new OrderInputError('Invalid variant');
        lines.push({ product_id: productId, amount: 1, variants: unit.map((id) => whole(id, 1)) });
      }
    } else {
      const amount = whole(item.amount, 1);
      if (amount > MAX_AMOUNT) throw new OrderInputError('Invalid amount');
      lines.push({ product_id: productId, amount, variants: null });
    }
  }

  return { user, invoice, spaaractieId, delivery: details.delivery === true || details.delivery === 1 || details.delivery === 'true', pickupDate, pickupTime, lines };
};
