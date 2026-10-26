import pdfmake from 'pdfmake';
import roboto from 'pdfmake/fonts/Roboto';
import { ReceiptLine, ReceiptOrder, ReceiptShop, buildReceipt, customerLines, firstPaymentRows, firstPaymentTotals, invoiceLines, productRows, receiptTotals } from './receipt-document';

// Ported from Server/tests/receipt_document.test.js, plus the totals that used to live in receipt.js
pdfmake.setFonts(roboto);
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(() => true);

const shop: ReceiptShop = {
  shopname: 'Coop Lubbers',
  information: { kvk: '123', btw: 'NL123', phone: '0123', mail: 'info@example.nl', address: { street: 'Dorpsstraat', house_number: '1', zipcode: '1234 AB', city: 'Dorp' } },
};

const product = (overrides: Partial<ReceiptLine> = {}): ReceiptLine => ({
  amount: 3, picked: 2, price: 1.21, normal_total_price: null, discounted_price: null,
  product: { btw: 21, statiegeld: 0, product_information: { title: 'Halfvolle melk', ean: '8710000000001' } },
  ...overrides,
});

const order: ReceiptOrder = {
  status: 'ordered', invoice_number: '100', orderDate: '2026-09-30T10:15:00', winkelbon: '1234567890', picking_price: 6.5,
  order_information: { customerName: 'Jan Jansen', customerPhone: '0612345678', street: 'Kerkstraat', house_number: '2', zipcode: '9999 ZZ', city: 'Stad' },
  invoice_order_information: null,
};

// text of every table body cell, flattened, to assert on what is printed
const tableText = (doc: Record<string, unknown>): string[][] => {
  const table = (doc.content as { table: { body: { text?: unknown }[][] } }[])[2].table;
  return table.body.map((row) => row.map((c) => (typeof c.text === 'string' ? c.text : ((c.text || []) as { text?: string }[]).map((t) => t.text || t).join(''))));
};

describe('receipt document', () => {
  it('productRows uses the ordered amount for status ordered and the picked amount otherwise', () => {
    expect(productRows([product()], 'ordered')[0].quantity).toBe(3);
    expect(productRows([product()], 'picked')[0].quantity).toBe(2);
    expect(productRows([product({ picked: 0 })], 'picked')).toHaveLength(0);
  });

  it('productRows computes the price excluding vat, the discount and the deposit', () => {
    const [row] = productRows([product({ price: 1.21, discounted_price: 2.5, product: { btw: 21, statiegeld: 0.25, product_information: { title: 't', ean: 'e' } } })], 'ordered');
    expect(row.excl).toBeCloseTo(1, 9);
    expect(row.total).toBeCloseTo(3.63, 9);
    expect(row.discount).toBeCloseTo(1.13, 9);
    expect(row.deposit).toBe(0.75);
  });

  it('a stored price that equals the discounted price (as text from the database) is no discount', () => {
    const [row] = productRows([product({ normal_total_price: '4.50', discounted_price: 4.5 })], 'ordered');
    expect(row.discount).toBe(0);
  });

  it('receiptTotals: vat per rate, deposit in the total, discount, picked amounts for a picked order', () => {
    const lines = [product({ price: 1.21, discounted_price: 2.5 }), product({ price: 2.18, picked: 1, product: { btw: 9, statiegeld: 0.1, product_information: { title: 'b', ean: 'e' } } })];
    const ordered = receiptTotals(lines, 'ordered');
    expect(Object.keys(ordered.no_vat).sort()).toEqual(['21', '9']);
    expect(ordered.total).toBeCloseTo(3 * 1.21 + 3 * 2.18 + 0.3, 9);
    expect(ordered.discount_total).toBeCloseTo(3 * 1.21 - 2.5, 9);
    expect(receiptTotals(lines, 'picked').total).toBeCloseTo(2 * 1.21 + 2.18 + 0.1, 9);
    expect(receiptTotals([product({ picked: 0 })], 'picked').total).toBe(0);
  });

  it('first payment: personal shopper row, delivery row only above 2 euro, totals follow picking_price', () => {
    expect(firstPaymentRows({ picking_price: 2 }).map((r) => r.title)).toEqual(['Personal Shopper']);
    expect(firstPaymentRows(order).map((r) => [r.title, r.incl])).toEqual([['Personal Shopper', 2], ['Bezorging', 4.5]]);
    const totals = firstPaymentTotals(order);
    expect(totals.total).toBe(6.5);
    expect(totals.no_vat[21].price + totals.no_vat[21].vat).toBeCloseTo(6.5, 9);
  });

  it('customer and invoice lines', () => {
    expect(customerLines(order.order_information, null)[0]).toBe('Naam: Jan Jansen');
    expect(customerLines(order.order_information, null)).toContain('Adres: Kerkstraat 2 ');
    const lines = invoiceLines(order);
    expect(lines[0]).toBe('Proforma: 100B');
    expect(lines[1]).toBe('Datum: 30-9-2026');
    expect(invoiceLines({ ...order, status: 'picked' }, true)[0]).toBe('Factuur nr.: 100A');
  });

  it('buildReceipt prints products and totals and renders to a valid PDF', async () => {
    const rows = productRows([product()], 'ordered');
    const doc = buildReceipt({ order, shop, rows, totals: { no_vat: { 21: { price: 3, vat: 0.63 } }, total: 3.63, discount_total: 0 } });
    const text = tableText(doc);
    expect(text[0]).toEqual(['Product', 'Aantal', 'btw', 'Prijs excl.', 'Prijs incl.', 'Totaal']);
    expect(text[1][0].startsWith('Halfvolle melk')).toBe(true);
    expect(text[text.length - 1].filter(Boolean)).toEqual(['Totaalbedrag', '€3.63']);
    expect(text.some((r) => r.includes('Totaal BTW 21%'))).toBe(true);
    expect((await pdfmake.createPdf(doc).getBuffer()).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('buildReceipt with a first payment, discount, barcode and no logo renders', async () => {
    const barcodePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const doc = buildReceipt({ order, shop, rows: firstPaymentRows(order), totals: { ...firstPaymentTotals(order), discount_total: 1 }, barcode: barcodePng, first: true });
    expect(tableText(doc).some((r) => r.includes('Totaal korting'))).toBe(true);
    expect((await pdfmake.createPdf(doc).getBuffer()).subarray(0, 5).toString()).toBe('%PDF-');
  });
});
