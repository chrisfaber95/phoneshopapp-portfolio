import { calculateDiscountPrices, DiscountListEntry, PricedLine, ProductDiscount, updateProductPrice } from './pricing';

// Ported from Server/tests/price_calculations.test.js (the business rules of REV-013)
const discountRow = (over: Partial<ProductDiscount> = {}, infoOver: Partial<ProductDiscount['discount_info']> = {}): ProductDiscount => ({
  discount_id: '1', isPercentage: true, discount_price: 20,
  discount_info: { starting_date: '2026-01-01', end_date: '2026-12-31', isCombination: true, discount_type: { min_amount: 3 }, ...infoOver },
  ...over,
});

// an order line: 5 x 10.00 of product 100, with the given discounts attached to the product
const line = (over: Partial<PricedLine> = {}, discounts: ProductDiscount[] = [discountRow()]): PricedLine => ({
  id: 10, product_id: 100, amount: 5, price: 10,
  product: { price: 10, product_has_discount_list: discounts },
  ...over,
});

// what Discounts.findAll returns: discount 1, "3 for ..." on product 100
const discountList: DiscountListEntry[] = [{ discount_id: '1', discount_type: { min_amount: 3 } }];

const today = new Date('2026-09-30');
const price = (items: PricedLine[], date: Date | string = today) => calculateDiscountPrices(items, discountList, date)[0];

const fixedRow = () => discountRow({ isPercentage: false, discount_price: 25 });
const productLine = (id: number, unitPrice: number, amount: number, discounts: ProductDiscount[]): PricedLine => ({
  id, product_id: id, amount, price: unitPrice,
  product: { price: unitPrice, product_has_discount_list: discounts },
});
const total = (items: PricedLine[]) => Math.round(items.reduce((sum, item) => sum + +(item.discounted_price as number), 0) * 100) / 100;
const pooled = (items: PricedLine[]) => calculateDiscountPrices(items, discountList, today);

describe('pricing', () => {
  it('updateProductPrice copies the current product price onto the line', () => {
    const item = { price: 8, product: { price: 12 } };
    updateProductPrice(item);
    expect(item.price).toBe(12);
  });

  it('without a discount the price is price x amount', () => {
    const result = price([line({}, [])]);
    expect(result.discounted_price).toBe(50);
    expect(result.normal_total_price).toBe(50);
  });

  it('normal_total_price uses the picked amount when present', () => {
    expect(price([line({ picked: 4 }, [])]).normal_total_price).toBe(40);
  });

  it('percentage combination discount: 3 of 5 get 20% off, the remainder is full price', () => {
    const result = price([line()]);
    expect(result.discounted_price).toBe(44); // 3 x 10 x 0.8 + 2 x 10
    expect(result.normal_total_price).toBe(50);
  });

  it('percentage combination discount: a multiple of the minimum amount is all discounted', () => {
    expect(price([line({ amount: 6 })]).discounted_price).toBe(48);
  });

  it('percentage combination discount: below the minimum amount there is no discount', () => {
    expect(price([line({ amount: 2 })]).discounted_price).toBe(20);
  });

  it('a discount outside its date range is ignored', () => {
    const expired = [discountRow({}, { end_date: '2026-01-31' })];
    const notStarted = [discountRow({}, { starting_date: '2027-01-01', end_date: '2027-12-31' })];
    expect(price([line({}, expired)]).discounted_price).toBe(50);
    expect(price([line({}, notStarted)]).discounted_price).toBe(50);
  });

  // Regression tests for bugs fixed in REV-013
  it('a date given as a string (as the order routes pass it) applies the discount', () => {
    expect(price([line()], '2026-09-30').discounted_price).toBe(44);
  });

  it('percentage discount without combination is applied', () => {
    expect(price([line({}, [discountRow({}, { isCombination: false })])]).discounted_price).toBe(44);
  });

  it('fixed-price discount without combination is applied', () => {
    expect(price([line({}, [discountRow({ isPercentage: false, discount_price: 25 }, { isCombination: false })])]).discounted_price).toBe(45); // 3 for 25.00 + 2 x 10
  });

  it('fixed-price discount with combination on a single product: 3 for 25 plus 2 at full price', () => {
    expect(price([line({}, [fixedRow()])]).discounted_price).toBe(45);
  });

  // "3 for 25" across a combination of products: the units of all products with the discount are pooled
  it('3 for 25 across two products: 2 + 1 units cost 25.00 in total', () => {
    const items = pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 1, [fixedRow()])]);
    expect(items.map((i) => i.discounted_price)).toEqual([16.67, 8.33]);
    expect(total(items)).toBe(25);
  });

  it('3 for 25 across three products with one unit each: the cents add up to exactly 25.00', () => {
    expect(total(pooled([1, 2, 3].map((id) => productLine(id, 10, 1, [fixedRow()]))))).toBe(25);
  });

  it('3 for 25 across products, 4 units: the leftover unit is charged full price on the most expensive product', () => {
    const items = pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 2, [fixedRow()])]);
    expect(items.map((i) => i.discounted_price)).toEqual([18.33, 16.67]);
    expect(total(items)).toBe(35); // 25.00 + 10.00
  });

  it('3 for 25 across products: fewer units than the minimum are all full price', () => {
    expect(total(pooled([productLine(1, 10, 1, [fixedRow()]), productLine(2, 8, 1, [fixedRow()])]))).toBe(18);
  });

  it('3 for 25 across products: a leftover larger than one product spills over to the next product', () => {
    // 1 unit of 10.00 + 4 units of 8.00 = 5 units: one group of 3, leftover 2 = the 10.00 unit and one 8.00 unit
    expect(total(pooled([productLine(1, 10, 1, [fixedRow()]), productLine(2, 8, 4, [fixedRow()])]))).toBe(43); // 25.00 + 10.00 + 8.00
  });

  it('20% off 3 across two products is applied to every unit of both products', () => {
    const items = pooled([productLine(1, 10, 2, [discountRow()]), productLine(2, 8, 1, [discountRow()])]);
    expect(items.map((i) => i.discounted_price)).toEqual([16, 6.4]);
  });

  it('products with another discount, or none, are not pooled with the combination', () => {
    const other = discountRow({ discount_id: '2' });
    const items = pooled([productLine(1, 10, 2, [fixedRow()]), productLine(2, 8, 1, [fixedRow()]), productLine(3, 5, 4, [other]), productLine(4, 4, 2, [])]);
    expect(+(items[0].discounted_price as number) + +(items[1].discounted_price as number)).toBe(25);
    expect(items[3].discounted_price).toBe(8);
  });

  it('a combination pool is shared only while the discount is active', () => {
    const expired = () => discountRow({ isPercentage: false, discount_price: 25 }, { end_date: '2026-01-31' });
    expect(total(pooled([productLine(1, 10, 2, [expired()]), productLine(2, 8, 1, [expired()])]))).toBe(28);
  });

  it('without combination every product is its own pool', () => {
    const separate = () => discountRow({ isPercentage: false, discount_price: 25 }, { isCombination: false });
    const items = pooled([productLine(1, 10, 2, [separate()]), productLine(2, 8, 3, [separate()])]);
    expect(items.map((i) => i.discounted_price)).toEqual([20, 25]); // 2 < 3: full price; 3 for 25
  });
});
