const test = require('node:test');
const assert = require('node:assert');
const calcs = require('../config/priceCalculations');

const discountRow = (over = {}, infoOver = {}) => ({
    discount_id: 1, isPercentage: true, discount_price: 20,
    discount_info: { starting_date: '2026-01-01', end_date: '2026-12-31', isCombination: true, discount_type: { min_amount: 3 }, ...infoOver },
    ...over
});

// an order line: 5 x 10.00 of product 100, with the given discounts attached to the product
const line = (over = {}, discounts = [discountRow()]) => ({
    id: 10, product_id: 100, amount: 5, price: 10,
    product: { price: 10, product_id: 100, product_has_discount_list: discounts },
    ...over
});

// what Discounts.findAll returns: discount 1, "3 for ..." on product 100
const discountList = [{ discount_id: 1, discount_type: { min_amount: 3 }, product_discount_list: [{ product_id: 100 }] }];

const today = new Date('2026-09-30');
const price = async (items, date = today) => (await calcs.calculateDiscountPrices(items, discountList, date))[0];

test('updateProductPrice copies the current product price onto the line', async () => {
    const item = { price: 8, product: { price: 12 } };
    await calcs.updateProductPrice(item);
    assert.strictEqual(item.price, 12);
});

test('without a discount the price is price x amount', async () => {
    const result = await price([line({}, [])]);
    assert.strictEqual(result.discounted_price, 50);
    assert.strictEqual(result.normal_total_price, 50);
});

test('normal_total_price uses the picked amount when present', async () => {
    const result = await price([line({ picked: 4 }, [])]);
    assert.strictEqual(result.normal_total_price, 40);
});

test('percentage combination discount: 3 of 5 get 20% off, the remainder is full price', async () => {
    const result = await price([line()]);
    assert.strictEqual(result.discounted_price, 44); // 3 x 10 x 0.8 + 2 x 10
    assert.strictEqual(result.normal_total_price, 50);
});

test('percentage combination discount: a multiple of the minimum amount is all discounted', async () => {
    assert.strictEqual((await price([line({ amount: 6 })])).discounted_price, 48);
});

test('percentage combination discount: below the minimum amount there is no discount', async () => {
    assert.strictEqual((await price([line({ amount: 2 })])).discounted_price, 20);
});

test('a discount outside its date range is ignored', async () => {
    const expired = [discountRow({}, { end_date: '2026-01-31' })];
    const notStarted = [discountRow({}, { starting_date: '2027-01-01', end_date: '2027-12-31' })];
    assert.strictEqual((await price([line({}, expired)])).discounted_price, 50);
    assert.strictEqual((await price([line({}, notStarted)])).discounted_price, 50);
});

// Regression tests for bugs fixed in REV-013 (see docs/revisions/REV-013)
test('a date given as a string (as the order routes pass it) applies the discount', async () => {
    // routes/order/updateFunctions/updateProducts.js passes 'YYYY-MM-DD' (was compared as a string, so never matched)
    assert.strictEqual((await price([line()], '2026-09-30')).discounted_price, 44);
});

test('percentage discount without combination is applied', async () => {
    // used to be NaN: the pricing function was called with one argument too many
    const result = await price([line({}, [discountRow({}, { isCombination: false })])]);
    assert.strictEqual(result.discounted_price, 44);
});

test('fixed-price discount without combination is applied', async () => {
    // used to be NaN for the same reason
    const result = await price([line({}, [discountRow({ isPercentage: false, discount_price: 25 }, { isCombination: false })])]);
    assert.strictEqual(result.discounted_price, 45); // 3 for 25.00 + 2 x 10
});

test('fixed-price discount with combination on a single product: 3 for 25 plus 2 at full price', async () => {
    // used to throw: it read discount.discount_info, which the discount list does not have
    const fixed = [discountRow({ isPercentage: false, discount_price: 25 })];
    assert.strictEqual((await price([line({}, fixed)])).discounted_price, 45);
});

// "3 for 25" across a combination of products: the units of all products with the discount are pooled
const fixedRow = () => discountRow({ isPercentage: false, discount_price: 25 });
const productLine = (id, price, amount, discounts) => ({
    id, product_id: id, amount, price,
    product: { price, product_id: id, product_has_discount_list: discounts }
});
const total = (items) => Math.round(items.reduce((sum, item) => sum + item.discounted_price, 0) * 100) / 100;
const pooled = async (items) => calcs.calculateDiscountPrices(items, discountList, today);

test('3 for 25 across two products: 2 + 1 units cost 25.00 in total', async () => {
    const items = await pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 1, [fixedRow()])]);
    assert.deepStrictEqual(items.map(i => i.discounted_price), [16.67, 8.33]);
    assert.strictEqual(total(items), 25);
});

test('3 for 25 across three products with one unit each: the cents add up to exactly 25.00', async () => {
    const items = await pooled([1, 2, 3].map(id => productLine(id, 10, 1, [fixedRow()])));
    assert.strictEqual(total(items), 25);
});

test('3 for 25 across products, 4 units: the leftover unit is charged full price on the most expensive product', async () => {
    const items = await pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 2, [fixedRow()])]);
    assert.deepStrictEqual(items.map(i => i.discounted_price), [18.33, 16.67]); // 1 x 10.00 full + 1 discounted unit; 2 discounted units
    assert.strictEqual(total(items), 35); // 25.00 + 10.00
});

test('3 for 25 across products: fewer units than the minimum are all full price', async () => {
    const items = await pooled([productLine(1, 10, 1, [fixedRow()]), productLine(2, 8, 1, [fixedRow()])]);
    assert.strictEqual(total(items), 18);
});

test('3 for 25 across products: a leftover larger than one product spills over to the next product', async () => {
    // 1 unit of 10.00 + 4 units of 8.00 = 5 units: one group of 3, leftover 2 = the 10.00 unit and one 8.00 unit
    const items = await pooled([productLine(1, 10, 1, [fixedRow()]), productLine(2, 8, 4, [fixedRow()])]);
    assert.strictEqual(total(items), 43); // 25.00 + 10.00 + 8.00
});

test('20% off 3 across two products is applied to every unit of both products', async () => {
    const row = () => discountRow();
    const items = await pooled([productLine(1, 10, 2, [row()]), productLine(2, 8, 1, [row()])]);
    assert.deepStrictEqual(items.map(i => i.discounted_price), [16, 6.4]);
});

test('products with another discount, or none, are not pooled with the combination', async () => {
    const other = discountRow({ discount_id: 2 });
    const items = await pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 1, [fixedRow()]), productLine(3, 5, 4, [other]), productLine(4, 4, 2, [])]);
    assert.strictEqual(items[0].discounted_price + items[1].discounted_price, 25);
    assert.strictEqual(items[3].discounted_price, 8);
});

test('a combination pool is shared only while the discount is active', async () => {
    const expired = () => discountRow({ isPercentage: false, discount_price: 25 }, { end_date: '2026-01-31' });
    const items = await pooled([productLine(1, 10, 2, [expired()]), productLine(2, 8, 1, [expired()])]);
    assert.strictEqual(total(items), 28);
});

test('without combination every product is its own pool', async () => {
    const separate = () => discountRow({ isPercentage: false, discount_price: 25 }, { isCombination: false });
    const items = await pooled([productLine(1, 10, 2, [separate()]), productLine(2, 8, 3, [separate()])]);
    assert.deepStrictEqual(items.map(i => i.discounted_price), [20, 25]); // 2 < 3: full price; 3 for 25
});
