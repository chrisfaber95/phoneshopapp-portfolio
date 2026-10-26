import * as fs from 'node:fs';
import * as path from 'node:path';
import { ReceiptLine, ReceiptOrder, ReceiptShop, buildReceipt, customerLines, firstPaymentRows, firstPaymentTotals, invoiceLines, productRows } from '../src/receipts/receipt-document';

// Runs generated orders through the receipt document of the old Server and of the new code and compares the results. Skipped once
// the old Server folder is gone (after the cutover).
const oldDocument = path.resolve(__dirname, '..', '..', 'Server', 'routes', 'order', 'receipt_document.js');
const describeIfOld = fs.existsSync(oldDocument) ? describe : describe.skip;

const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const shop: ReceiptShop = { shopname: 'Shop', information: { kvk: '1', address: { street: 'Weg', house_number: '1', zipcode: '1234AB', city: 'Dorp' } } };

const buildOrder = (next: () => number): { order: ReceiptOrder; lines: ReceiptLine[] } => {
  const pick = (n: number) => Math.floor(next() * n);
  const lines = Array.from({ length: 1 + pick(5) }, (_, i): ReceiptLine => {
    const price = 1 + pick(2000) / 100;
    const amount = 1 + pick(6);
    return {
      amount, picked: pick(amount + 1), price,
      normal_total_price: next() < 0.4 ? +(price * amount).toFixed(2) : null,
      discounted_price: next() < 0.4 ? +(price * amount * 0.8).toFixed(2) : null,
      product: { btw: [0, 9, 21][pick(3)], statiegeld: next() < 0.3 ? 0.25 : 0, product_information: { title: `Product ${i}`, ean: `87100000000${i}` } },
    };
  });
  const order: ReceiptOrder = {
    status: ['ordered', 'picked', 'scanned'][pick(3)], invoice_number: String(pick(1000)), orderDate: '2026-09-30T10:15:00', winkelbon: next() < 0.5 ? '1234567890' : null,
    picking_price: [2, 2.5, 6.5][pick(3)],
    order_information: { customerName: 'Jan Jansen', customerPhone: '06', street: 'Kerkstraat', house_number: '2', zipcode: '9999 ZZ', city: 'Stad' },
    invoice_order_information: next() < 0.5 ? { first_name: 'Piet', surname: 'Pietersen', klantenkaart: '99', business: 'BV' } : null,
  };
  return { order, lines };
};

describeIfOld('receipt document parity with the old Server', () => {
  it('builds the same rows, lines and document for 200 generated orders', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const old = require(oldDocument) as Record<string, (...args: unknown[]) => unknown>;
    const next = random(38);
    for (let i = 0; i < 200; i++) {
      const { order, lines } = buildOrder(next);
      expect(productRows(lines, order.status)).toEqual(old.productRows(lines, order.status));
      expect(firstPaymentRows(order)).toEqual(old.firstPaymentRows(order));
      expect(firstPaymentTotals(order)).toEqual(old.firstPaymentTotals(order));
      expect(customerLines(order.order_information, order.invoice_order_information)).toEqual(old.customerLines(order.order_information, order.invoice_order_information));
      expect(invoiceLines(order, i % 2 === 0)).toEqual(old.invoiceLines(order, i % 2 === 0));
      const rows = productRows(lines, order.status);
      const totals = { no_vat: { 21: { price: 3, vat: 0.63 } }, total: 3.63, discount_total: i % 3 };
      expect(JSON.stringify(buildReceipt({ order, shop, rows, totals, first: i % 2 === 0 }))).toBe(JSON.stringify(old.buildReceipt({ order, shop, rows, totals, first: i % 2 === 0 })));
    }
  });
});
