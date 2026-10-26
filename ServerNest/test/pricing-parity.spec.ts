import * as fs from 'node:fs';
import * as path from 'node:path';
import { calculateDiscountPrices, DiscountListEntry, PricedLine, ProductDiscount } from '../src/pricing/pricing';

// Runs generated carts through the pricing of the old Server and of the new code and compares every price. Skipped once the old
// Server folder is gone (after the cutover).
const oldPricing = path.resolve(__dirname, '..', '..', 'Server', 'config', 'priceCalculations', 'index.js');
const describeIfOld = fs.existsSync(oldPricing) ? describe : describe.skip;

// small deterministic random numbers, so a failure can be reproduced
const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const discountList: DiscountListEntry[] = [1, 2, 3].map((n) => ({ discount_id: String(n), discount_type: { min_amount: n + 1 } }));

const buildCart = (next: () => number): PricedLine[] => {
  const pick = (n: number) => Math.floor(next() * n);
  const discounts = (): ProductDiscount[] => {
    const n = pick(4); // 0 = no discount
    if (n === 0) return [];
    return [{
      discount_id: String(n), isPercentage: next() < 0.5, discount_price: next() < 0.5 ? 10 + pick(40) : 5 + pick(30) + pick(100) / 100,
      discount_info: {
        starting_date: '2026-01-01', end_date: next() < 0.8 ? '2026-12-31' : '2026-02-01', isCombination: next() < 0.6, discount_type: { min_amount: n + 1 },
      },
    }];
  };
  return Array.from({ length: 1 + pick(5) }, (_, i) => {
    const price = 1 + pick(2000) / 100;
    return { id: i + 1, product_id: 100 + pick(5), amount: 1 + pick(7), price, picked: next() < 0.3 ? pick(5) : null, product: { price, product_has_discount_list: discounts() } };
  });
};

describeIfOld('pricing parity with the old Server', () => {
  it('gives the same prices for 300 generated carts', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const old = require(oldPricing) as { calculateDiscountPrices: (list: PricedLine[], discounts: DiscountListEntry[], date: string) => Promise<PricedLine[]> };
    const next = random(26);
    for (let i = 0; i < 300; i++) {
      const cart = buildCart(next);
      const forOld = structuredClone(cart);
      const expected = await old.calculateDiscountPrices(forOld, discountList, '2026-09-30');
      const actual = calculateDiscountPrices(cart, discountList, '2026-09-30');
      expect(actual.map((l) => [l.discounted_price, l.normal_total_price])).toEqual(expected.map((l) => [l.discounted_price, l.normal_total_price]));
    }
  });
});
