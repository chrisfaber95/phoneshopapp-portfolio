const test = require('node:test');
const assert = require('node:assert');
const pdfmake = require('pdfmake');
const { buildReceipt, productRows, firstPaymentRows, firstPaymentTotals, customerLines, invoiceLines } = require('../routes/order/receipt_document');

pdfmake.setFonts(require('pdfmake/fonts/Roboto'));

const shop = {
    shopname: 'Coop Lubbers',
    information: { kvk: '123', btw: 'NL123', phone: '0123', mail: 'info@example.nl', address: { street: 'Dorpsstraat', house_number: '1', zipcode: '1234 AB', city: 'Dorp' } }
};

const product = (overrides = {}) => ({
    amount: 3, picked: 2, price: 1.21, normal_total_price: null, discounted_price: null,
    product: { btw: 21, statiegeld: 0, product_information: { title: 'Halfvolle melk', ean: '8710000000001' } },
    ...overrides
});

const order = {
    status: 'ordered', invoice_number: '100', orderDate: '2026-09-30T10:15:00', winkelbon: '1234567890',
    picking_price: 6.5,
    order_information: { customerName: 'Jan Jansen', customerPhone: '0612345678', street: 'Kerkstraat', house_number: '2', zipcode: '9999 ZZ', city: 'Stad' },
    invoice_order_information: null
};

// text of every table body cell, flattened, to assert on what is printed
const tableText = (doc) => doc.content[2].table.body.map(row => row.map(c => typeof c.text === 'string' ? c.text : (c.text || []).map(t => t.text || t).join('')));

test('productRows uses ordered amount for status ordered and picked otherwise', () => {
    assert.strictEqual(productRows([product()], 'ordered')[0].quantity, 3);
    assert.strictEqual(productRows([product()], 'picked')[0].quantity, 2);
    assert.strictEqual(productRows([product({ picked: 0 })], 'picked').length, 0);
});

test('productRows computes excl vat price, discount and deposit', () => {
    const [row] = productRows([product({ price: 1.21, discounted_price: 2.5, product: { btw: 21, statiegeld: 0.25, product_information: { title: 't', ean: 'e' } } })], 'ordered');
    assert.ok(Math.abs(row.excl - 1) < 1e-9);
    assert.ok(Math.abs(row.total - 3.63) < 1e-9);
    assert.ok(Math.abs(row.discount - 1.13) < 1e-9);
    assert.strictEqual(row.deposit, 0.75);
});

test('first payment: personal shopper row, delivery row only above 2 euro, totals follow picking_price', () => {
    assert.deepStrictEqual(firstPaymentRows({ picking_price: 2 }).map(r => r.title), ['Personal Shopper']);
    const rows = firstPaymentRows(order);
    assert.deepStrictEqual(rows.map(r => [r.title, r.incl]), [['Personal Shopper', 2], ['Bezorging', 4.5]]);
    const totals = firstPaymentTotals(order);
    assert.strictEqual(totals.total, 6.5);
    assert.ok(Math.abs(totals.no_vat[21].price + totals.no_vat[21].vat - 6.5) < 1e-9);
});

test('customer and invoice lines', () => {
    assert.strictEqual(customerLines(order.order_information, null)[0], 'Naam: Jan Jansen');
    assert.ok(customerLines(order.order_information, null).includes('Adres: Kerkstraat 2 '));
    const lines = invoiceLines(order);
    assert.strictEqual(lines[0], 'Proforma: 100B');
    assert.strictEqual(lines[1], 'Datum: 30-9-2026');
    assert.strictEqual(invoiceLines({ ...order, status: 'picked' }, true)[0], 'Factuur nr.: 100A');
});

test('buildReceipt prints products, totals and renders to a valid PDF', async () => {
    const rows = productRows([product()], 'ordered');
    const totals = { no_vat: { 21: { price: 3, vat: 0.63 } }, total: 3.63, discount_total: 0 };
    const doc = buildReceipt({ order, shop, rows, totals });
    const text = tableText(doc);
    assert.deepStrictEqual(text[0], ['Product', 'Aantal', 'btw', 'Prijs excl.', 'Prijs incl.', 'Totaal']);
    assert.ok(text[1][0].startsWith('Halfvolle melk'));
    assert.deepStrictEqual(text[text.length - 1].filter(Boolean), ['Totaalbedrag', '€3.63']);
    assert.ok(text.some(r => r.includes('Totaal BTW 21%')));
    const pdf = await pdfmake.createPdf(doc).getBuffer();
    assert.strictEqual(pdf.subarray(0, 5).toString(), '%PDF-');
});

test('buildReceipt with first payment, discount, barcode and no logo renders', async () => {
    const barcodePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const doc = buildReceipt({ order, shop, rows: firstPaymentRows(order), totals: { ...firstPaymentTotals(order), discount_total: 1 }, barcode: barcodePng, first: true });
    assert.ok(tableText(doc).some(r => r.includes('Totaal korting')));
    assert.strictEqual((await pdfmake.createPdf(doc).getBuffer()).subarray(0, 5).toString(), '%PDF-');
});
