// Price calculation of an order: the discount rules, ported 1:1 from the old Server (config/priceCalculations, REV-013).
//
// A discount is "<min_amount> for <discount_price>" (fixed price, e.g. 3 for 25.00) or "<discount_price>% off every <min_amount>".
// Units are counted per group of min_amount; the units that do not fill a group are the remainder and are charged the normal price.
// - isCombination = true:  all order lines with the same discount share one pool (3 for 25 across products)
// - isCombination = false: every order line is its own pool
// The remainder units are taken from the most expensive line first (the rule the old code used for combinations).

type Num = number | string | null | undefined;

export interface DiscountInfo {
  starting_date: Date | string;
  end_date: Date | string;
  isCombination?: boolean | number | null;
  discount_type?: { min_amount?: Num } | null;
}

export interface ProductDiscount {
  discount_id: string | number;
  isPercentage?: boolean | number | null;
  discount_price: Num;
  discount_info: DiscountInfo;
}

export interface PricedLine {
  id?: Num;
  product_id?: Num;
  amount: Num;
  price?: Num;
  picked?: Num;
  discounted_price?: Num;
  normal_total_price?: Num;
  product: { price?: Num; product_has_discount_list?: ProductDiscount[] | null };
}

// The discount list the old code passed along (Discounts.findAll): only the minimum amount is read from it
export interface DiscountListEntry {
  discount_id: string | number;
  discount_type?: { min_amount?: Num } | null;
}

const toCents = (value: Num): number => Math.round(+(value as number) * 100);

const isActive = (info: DiscountInfo, currentDate: Date): boolean => currentDate >= new Date(info.starting_date) && currentDate <= new Date(info.end_date);

// Shares `totalCents` over the lines by their weights (whole cents, the parts always add up to the total)
const distributeCents = (totalCents: number, weights: number[]): number[] => {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum === 0) return weights.map(() => 0);
  const shares = weights.map((weight) => (totalCents * weight) / weightSum);
  const parts = shares.map(Math.floor);
  let left = totalCents - parts.reduce((sum, part) => sum + part, 0);
  shares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (left > 0) {
        parts[index] += 1;
        left -= 1;
      }
    });
  return parts;
};

// Prices one pool of order lines that share a discount. Returns the discounted price per line, in the same order.
const priceDiscountPool = (lines: PricedLine[], discountRow: ProductDiscount, discountFromList: DiscountListEntry | undefined): number[] => {
  const minAmount = Math.max(1, +(discountRow.discount_info?.discount_type?.min_amount || discountFromList?.discount_type?.min_amount || 1));
  const unitPrice = (line: PricedLine): number => +((line.price ?? line.product.price) as number);

  const order = lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => unitPrice(b.line) - unitPrice(a.line) || +(b.line.product_id as number) - +(a.line.product_id as number) || +(b.line.id as number) - +(a.line.id as number));

  let remainder = lines.reduce((sum, line) => sum + +(line.amount as number), 0) % minAmount;
  const plan: { full: number; discounted: number }[] = new Array(lines.length);
  order.forEach(({ line, index }) => {
    const full = Math.min(remainder, +(line.amount as number));
    remainder -= full;
    plan[index] = { full, discounted: +(line.amount as number) - full };
  });

  const fullCents = lines.map((line, i) => toCents(plan[i].full * unitPrice(line)));
  let discountedCents: number[];
  if (discountRow.isPercentage) {
    discountedCents = lines.map((line, i) => toCents(plan[i].discounted * unitPrice(line) * (1 - +(discountRow.discount_price as number) / 100)));
  } else {
    const groups = plan.reduce((sum, p) => sum + p.discounted, 0) / minAmount;
    discountedCents = distributeCents(Math.round(groups * toCents(discountRow.discount_price)), plan.map((p) => p.discounted));
  }
  return lines.map((_line, i) => (fullCents[i] + discountedCents[i]) / 100);
};

// An order line is priced at the current product price (as long as the pickup day is not past, see the order update)
export const updateProductPrice = (item: { price?: Num; product: { price?: Num } }): void => {
  item.price = item.product.price;
};

// Sets discounted_price and normal_total_price on every line; the date is the pickup date ('YYYY-MM-DD'), today when missing
export const calculateDiscountPrices = <T extends PricedLine>(productList: T[], discountList: DiscountListEntry[] | null | undefined, date?: Date | string | null): T[] => {
  const currentDate = date ? new Date(date) : new Date();
  const pools = new Map<string | PricedLine, { discountRow: ProductDiscount; lines: PricedLine[] }>();

  productList.forEach((product) => {
    const applicableDiscount = (product.product.product_has_discount_list || []).find((discount) => isActive(discount.discount_info, currentDate));
    product.discounted_price = +((product.price ?? product.product.price) as number) * +(product.amount as number);
    product.normal_total_price = +(product.price as number) * +((product.picked || product.amount) as number);
    if (!applicableDiscount) return;

    const key = applicableDiscount.discount_info.isCombination ? `discount-${applicableDiscount.discount_id}` : product;
    const pool = pools.get(key) ?? { discountRow: applicableDiscount, lines: [] };
    pool.lines.push(product);
    pools.set(key, pool);
  });

  pools.forEach(({ discountRow, lines }) => {
    const discountFromList = (discountList || []).find((entry) => entry.discount_id === discountRow.discount_id);
    const prices = priceDiscountPool(lines, discountRow, discountFromList);
    lines.forEach((line, i) => {
      line.discounted_price = prices[i];
    });
  });
  return productList;
};
