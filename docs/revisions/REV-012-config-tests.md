# REV-012 — Server: tests for priceCalculations and mailing

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-012-config-tests`               |
| PR     | #11                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Adds automated tests for `config/priceCalculations` and `config/mailing.js` (follow-up from REV-009) and documents the bugs the tests exposed. No production code changed.

## Why this revision exists
Pricing and e-mail are core shop logic (ENGINEERING_RULES: cart and price calculation must be tested) and had no tests.

## What changed
- `tests/price_calculations.test.js` (11 tests): `updateProductPrice`; no discount; `normal_total_price` with picked amount; percentage-combination discount (5 -> 44.00, 6 -> 48.00, below the minimum -> no discount); date window (expired / not started ignored); plus 4 `todo` tests for the bugs below.
- `tests/mailing.test.js` (7 tests): `setMailOptions` (recipient, subject, QR attachment is a PNG with the expected cid), the other four option builders, password-reset mail link built from `BASE_URL` + code, account-created mail, order-placed mail (products + price), order-picked mail (pay link, pickup time, price); plus 1 `todo`.
- No database, SMTP or network: the pricing code receives plain objects; mail options are built but never sent.

## Implementation decisions
Bugs are recorded as `todo` tests that assert the intended result (`node:test` runs them, reports them, and does not fail the suite). When a bug is fixed, remove the `todo` option and the test becomes a normal regression test. Production code was NOT changed: fixing the pricing bugs changes what customers pay.

## Architectural decisions
None.

## Tests added
See above: 18 tests, 5 of them `todo`.

## Tests executed
`npm test`: 38 tests, 33 pass, 0 fail, 5 todo (all 5 confirmed failing as described), exit code 0.

## Known limitations / bugs found (not fixed)
In `config/priceCalculations/index.js`:
1. **Discounts never apply when the date is a string.** `routes/order/updateFunctions/updateProducts.js` and `routes/order/test.js` pass `'YYYY-MM-DD'`; the code compares `currentDate >= new Date(...)`, which is always false for a string, so the order totals contain no discount. A `Date` works.
2. **Percentage discount without combination and fixed-price discount without combination return `NaN`.** `discountPercentageNoCombination` / `discountNoPercentageNoCombination` take 4 parameters but are called with 5 (`productList` is passed in the `applicableDiscount` slot). `NaN` is falsy, so `getTotalPrice` silently falls back to the full price.
3. **Fixed-price discount with combination throws** (`discountNoPercentageCombination` reads `discount.discount_info.discount_type`, but the discount list items have `discount_type` directly). It also compares `value.id` where the percentage variant compares `value.product_id`.
4. `getProductInfo` references `Product`, `ProductHasDiscount`, `Discounts` that are never imported (unused function); `discountPrice` is an implicit global.

In `config/mailing.js`: template values (e.g. the feedback text in `feedbackTemplate`, which also has a stray `">`) are inserted as raw HTML, so user input is not escaped in the e-mail; `setMailOptions` assigns an undeclared global `qrcode`.

## Future work discovered
Decide with the shop how discounts must behave (bugs 1-3 together mean, in practice, that discounts may currently not be applied on orders at all), fix them, and flip the `todo` tests. Escape HTML in the mail templates.

## Summary
Pricing and mail logic are now tested, and five real defects in them are written down with tests that will pass once they are fixed.
