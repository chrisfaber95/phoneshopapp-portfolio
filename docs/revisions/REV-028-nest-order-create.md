# REV-028 — NestJS order creation and the first Mollie payment

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-028-nest-order-create`          |
| PR     | #27                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Adds `POST /order` to the NestJS server: it validates the order, prices it from the database, stores the order with its lines and contact details, starts the first Mollie payment (the picking fee) and answers with the checkout link. Includes the Mollie service the webhook revision will reuse.

## Why this revision exists
Next step of the plan (order write side, split in create / webhook / update). The old handler trusted the client for every amount, so it is rebuilt rather than copied.

## What changed
- `src/orders/`: `OrdersCreateService`, `order-input.ts` (validation), `invoice-number.ts`, `POST /order` in the controller.
- `src/payments/`: `MollieService` (create/get payments, live and test key, behind an injectable factory so tests never reach Mollie), `PaymentsModule`.
- `src/pricing/pricing.ts`: discount ids may be numbers (as in the database).
- `src/auth/access/access.guard.ts`: a valid token is now recognised on public routes too (so guest checkout can link the order to the logged-in customer); invalid or missing tokens are ignored there as before.
- `src/config/env.validation.ts`, `.env.example`: `BASE_URL`, `MOLLIE_API`, `MOLLIE_TEST_API`, `MOLLIE_WEBHOOK`, `MOLLIE_TEST_CARDS`, `PICKUP_FEE`, `DELIVERY_FEE` (all optional, fees default to 2.00 / 3.00, the values hardcoded in the Klant order page).
- Dependency: `@mollie/api-client` 4.6 (the version the old Server uses; official Mollie library; no install scripts; `npm approve-scripts --allow-scripts-pending` reported nothing to review). `npm audit` shows the 4 moderate findings in `sequelize` that were already there.

## Problems of the old handler, fixed here
1. **The client decided what to pay.** `picking_price` (the amount charged online), `totalPrice` and the price of every product line were taken from the request. A customer could pay 0.01 for an order. Now the fee comes from the settings (`PICKUP_FEE` / `DELIVERY_FEE`), line prices from the products table, and the total is computed with the pricing module (discounts of the pickup day, deposit, 0.05 per koopzegel).
2. **Free orders through a loyalty card number.** Two card numbers were hardcoded to switch the payment to Mollie's *test* mode. Now only the cards listed in `MOLLIE_TEST_CARDS` do (none by default), and only when a test key is set.
3. **Orders for other customers.** `customer_id` was taken from the body, so a guest could attach an order to any customer. Now the order is linked to the customer of the token only.
4. **Payment before order.** The old code created the payment first and the order after; a failed insert left a payment for nothing. Now the order and its lines are stored in one transaction, then the payment is created, and when the payment fails the order is removed again.
5. **Unvalidated input / raw errors in answers.** Amounts, dates, times, texts and the e-mail address are validated (400 with `{ docs, success: false }` like before), error objects are no longer sent to the client. The redirect URL comes from `BASE_URL` when set (else the `Origin` header, as before).
6. The payment method is only passed on when it is one the shop offers.

## Implementation decisions
- Kept: the request shape of the Klant order page (`userDetails`, `invoiceDetails`, `orderDetails`, `orderProducts`), the answer `{ payment, success }`, status `pending`, the payment id stored in `paymentMethod` (the webhook finds the order by it), the invoice number format (`NL3555_<year><month 0-9><day>_<nnnn>`, including its month counting from 0, so the series continues).
- Guest checkout stays possible (public endpoint).
- The lines now also store `discounted_price` and `normal_total_price` (the old create left them empty until the first update).
- Not ported: `country` (the table has no such column).

## Tests added
`ServerNest`: 36 suites, 351 tests (34 new): `order-input.spec` (what is kept, what is dropped, 13 rejected inputs, invoice number format), `orders-create.service.spec` (server-side pricing and fee, delivery fee, customer link for guest/customer/employee, discounts, test card, invalid order, unknown product, payment failure removes the order), `payments/mollie.service.spec` (amount/method/webhook, test key, missing key, test cards, live-then-test lookup), `test/orders.e2e-spec` (POST route), `test/access.e2e-spec` (token recognised on public routes), env test.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (351/351): clean.
- **Live run against the Podman test database with a fake Mollie** (script outside the repo, test rows removed afterwards): a guest order with a forged `totalPrice`/`picking_price` of 0.01 and a customer id in the body: stored as total 4.78 (3 x 1.56 + 2 koopzegels), picking price 2.00, customer null, lines with the database price, contact details stored, Mollie called with 2.00 and the dummy key; a second order got invoice number `…_0002`; an order without products answered 400. No leftovers.
- **No parity run for this endpoint:** the old handler creates a real Mollie payment and the parity harness (dummy keys) cannot reach Mollie, and the intended behaviour differs on purpose (server-side prices).
- Not run: a real Mollie payment (test mode) end to end; it needs the shop's test key and is part of the pre-cutover smoke test.

## Known limitations
- The Klant page sends the chosen method as `orderDetails.paymentMethod`, but (also in the old code) the server reads `selectedBetaal`, so the chosen method is never passed to Mollie and the customer picks on the Mollie page. Kept for now; a client or server fix is listed in `docs/FUTURE_HARDENING.md`.
- No rate limit: anyone can place orders (each creates a Mollie payment). The client totals shown to the customer can differ by cents from the server total because the client has its own copy of the discount rules.
- Invoice numbers are counted per day without a lock (two orders at the same moment can get the same number); the old code had the same race.

## Future work discovered
Rate limiting for guest checkout, one shared pricing function between server and client, a unique index on the invoice number, a scheduled clean-up of `pending` orders whose payment was never completed.

## Summary
Orders can be placed on the new server with the amounts decided by the server, the payment started at Mollie, and the old holes (client-set prices, test-card backdoor, foreign customer ids, payment without order) closed.
