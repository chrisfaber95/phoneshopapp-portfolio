# REV-027 — NestJS pricing (discount calculation)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-027-nest-order-write`           |
| PR     | #26                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Ports the order price calculation (`Server/config/priceCalculations`: percentage and fixed-price discounts, "3 for 25" across a combination of products) to typed, framework-free functions in `ServerNest/src/pricing/pricing.ts`.

## Why this revision exists
Creating and updating orders (next revisions) needs the pricing, and it is the part of the rewrite where a silent change costs money. It is therefore ported and verified on its own, before it is wired into any endpoint.

## What changed
- `src/pricing/pricing.ts`: `calculateDiscountPrices`, `updateProductPrice` and the types of lines and discounts. Same algorithm as the old code (pools per discount or per line, remainder units from the most expensive line, whole-cent distribution), only typed. `getProductInfo` and `getProductDiscount` of the old module were never used and are not ported (the first was also broken: it used models that were not imported).
- `src/pricing/pricing.spec.ts`: the 21 tests of `Server/tests/price_calculations.test.js`, ported to Jest.
- `test/pricing-parity.spec.ts`: runs 300 generated carts (random prices, amounts, percentage/fixed discounts, combination or not, expired or active, picked amounts) through the old and the new code and compares every `discounted_price` and `normal_total_price`. Skipped when the old `Server/` folder is gone.

## Implementation decisions
Pure functions instead of an injectable service: there is no state or dependency to inject, and the functions are easy to test. The order service will call them.

## Tests executed
- `npm run typecheck`, `npm run lint`: clean. Pricing tests: 21/21; full suite see the PR.
- The differential test passes: the old and the new code agree on all 300 carts.

## Known limitations
The prices are still floating point numbers converted via cents at the end, as before. Order totals should move to integer cents or a decimal type when the order write side is rebuilt (see `docs/FUTURE_HARDENING.md`).

## Future work discovered
The client sends prices in the order (`value.product.price`, `totalPrice`, `picking_price`); the write side must compute them on the server instead of trusting the client (REV-028).

## Summary
The discount rules are in the new server with the same results as the old code, proven by the ported tests and a differential test.
