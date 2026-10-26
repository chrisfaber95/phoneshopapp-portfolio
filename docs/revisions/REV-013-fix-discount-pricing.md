# REV-013 — Server: fix the discount pricing bugs

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-013-fix-discount-pricing`       |
| PR     | #12                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Fixes the three discount bugs found in REV-012 in `config/priceCalculations/index.js` and turns their `todo` tests into regular tests.

## Why this revision exists
Discounts were effectively not applied to orders (string date), two discount types produced `NaN`, and the fixed-price combination discount crashed.

## What changed
- Date: `calculateDiscountPrices` converts the given date with `new Date(date)`. The order routes pass `'YYYY-MM-DD'`, which used to be compared as a string and never matched.
- One pricing path replaces the four type-specific functions (`discountPercentage/NoPercentage x Combination/NoCombination`). It fixes the `NaN` (functions called with one argument too many) and the crash (`discount.discount_info` read on a discount-list item).
- Combination discounts now pool the units of all order lines that carry the same discount ("3 for 25 across a combination of products", confirmed by the owner). Non-combination discounts pool per line.
- Fixed-price deals are shared over the lines in whole cents, so the lines add up to exactly groups x price (e.g. three lines with one unit each of "3 for 25" = 8.33 + 8.33 + 8.34, not 24.99).
- `getProductDiscount` / `getProductInfo` (unused, reference undefined names) are left untouched.

## Implementation decisions
- Rules kept from the old code: a group is `min_amount` units; units that do not fill a group (the remainder) pay the normal price; in a combination the remainder is taken from the most expensive product first (ties: higher `product_id`). New: if the remainder is larger than that product's amount it spills over to the next most expensive product (the old code charged the excess on the same line).
- Unit price is `line.price` (fallback `product.price`) everywhere. The old no-discount branch used `product.product.price` (the current catalogue price) while everything else used the line price; for old orders whose catalogue price changed that produced a phantom discount/surcharge.
- `min_amount` comes from the line's `discount_info.discount_type`, with the discount list as fallback and a minimum of 1 (no more `NaN` from `% 0`).
- `normal_total_price` is unchanged.

## Architectural decisions
None.

## Tests added
In `tests/price_calculations.test.js`: the 4 former `todo` tests (string date, percentage without combination = 44.00, fixed without combination = 45.00, fixed combination single product = 45.00) plus 9 new ones: 3 for 25 across two products (16.67 + 8.33), three single units (exactly 25.00), leftover unit on the most expensive product, below the minimum, leftover spilling to the next product, 20% across products, other discount/no discount not pooled, expired discount not pooled, non-combination pools per line.

## Tests executed
`npm test`: 47 tests, 46 pass, 0 fail, 1 todo (the HTML-escaping mail issue, REV-014). All 202 files load with the real config. Not run: real orders against the database.

## Known limitations
- **This changes the totals customers see.** Orders that have an applicable discount will now be discounted, which before mostly did not happen. Try a test order (and a receipt) before relying on it in production.
- Discounts are calculated on `amount` (ordered), while `normal_total_price` uses `picked || amount`; after picking fewer items than ordered the two can disagree (existing behaviour, untouched).
- The remainder rule (most expensive product pays full price) is carried over from the old code; if the shop wants the cheapest products to be the leftover, it is a one-line change of the sort order in `priceDiscountPool`.

## Future work discovered
Escape HTML in the mail templates (REV-014). Consider computing discounts from `picked` once an order is picked.

## Summary
Discounts apply again, all four discount types work, and "3 for 25" pools across products with exact cents.
