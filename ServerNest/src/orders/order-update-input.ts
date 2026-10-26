import { asRecord, pick } from '../customers/customer-fields';

// What an employee may change on an order with `PUT /order/:id` (type "Update"). The old Server passed the whole body to
// `Order.update`, so the payment id, the invoice number, the customer and the contact records could be rewritten as well.
export const ORDER_FIELDS = [
  'delivery', 'totalPrice', 'pickupDate', 'status', 'pickupTime', 'pickingcrate', 'paycode', 'winkelbon', 'finalPrice', 'pickingtime', 'koopzegels',
  'spaarzegels', 'storepoints', 'picking_price', 'pickup_code', 'pickup_confirm', 'id_check', 'scanningtime', 'pickedup_time', 'picking_user',
  'scanning_user', 'pickup_user',
] as const;

// What may be set on an order line
export const LINE_FIELDS = ['amount', 'price', 'picked', 'returned', 'reason_return', 'discounted_price', 'discount_override'] as const;
export const NEW_LINE_FIELDS = ['product_id', ...LINE_FIELDS] as const;

export class OrderUpdateError extends Error {}

export const orderChanges = (order: unknown): Record<string, unknown> => {
  const changes = pick(asRecord(order), ORDER_FIELDS);
  if (changes.status !== undefined && (typeof changes.status !== 'string' || changes.status.length > 40)) throw new OrderUpdateError('Invalid status');
  return changes;
};

// The order lines of the body, each with the id of an existing line and only the fields that may be set. A line without an id is not
// an existing line (new lines are added with the "Product" request) and is left out.
export const lineChanges = (order: unknown): { id: number; changes: Record<string, unknown> }[] => {
  const list = asRecord(order).product_list;
  if (list === undefined) return [];
  if (!Array.isArray(list)) throw new OrderUpdateError('Invalid product list');
  const lines: { id: number; changes: Record<string, unknown> }[] = [];
  for (const entry of list) {
    const line = asRecord(entry);
    const id = Number(line.id);
    if (Number.isInteger(id) && id >= 1) lines.push({ id, changes: pick(line, LINE_FIELDS) });
  }
  return lines;
};
