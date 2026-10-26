# REV-030 — NestJS order update (picking, scanning, paying)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-030-nest-order-update`          |
| PR     | #29                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Adds `PUT /order/:orderRef` with the four request types of the old Server: `Onlinepayment` (the customer pays the final price from the link in the pick-up mail), `Update` (the picking/scanning app saves an order), `Product` (add a product to an order) and `Storepayment` (paid at the counter).

## Why this revision exists
Last part of the order write side (create → webhook → update). It is also the endpoint with the most serious hole of the old Server.

## What changed
- `src/orders/`: `OrdersUpdateService`, `order-update-input.ts` (the whitelists), `order-reference.ts` (one way to read an order reference from a URL, now also used by `GET /order/single`), `PUT /order/:orderRef`.
- No change to the access rules: the route stays open because `Onlinepayment` is called by customers without a login; the service demands an employee token for everything else.

## Problems of the old handler, fixed here
1. **Anyone could rewrite any order.** The route was open and `Update` passed the whole request body to `Order.update`, so a stranger could set an order to paid, change its prices, status, payment id, customer or contact records, and trigger mails and stamps. Now only `Onlinepayment` is public; `Update`, `Product` and `Storepayment` need an employee token (401 without a token, 403 for a customer), and `Update` only writes the fields of a whitelist (not the payment id, invoice number, customer or contact links, ids or timestamps). Order lines are updated by id, only when they belong to this order, and only their amount/price/picked/returned fields.
2. **`Product` added a line to any order** named in the body (`product.order_id`); it now uses the order in the URL and a whitelist of fields.
3. **The answer of `Update` was the request body echoed back**; it is now the saved order from the database.
4. **Mail on every save.** The "your order is picked" mail (with the payment link and QR code) was sent on every save while the status was `scanned`; it is now sent once, when the status changes to `scanned`.
5. **Stamps never worked and could crash the server.** The savings-action code used the result of `findOrCreate` (an array) as a record and called `.catch` on `forEach`, which raised an unhandled rejection. It now does what it was meant to do, once, when the order becomes `afgehaald`: for every action in the order, `floor(final price / price per stamp)` stamps, from the stored final price (not from the body); guest orders and empty entries are skipped.
6. **Payment link.** The link in the mail carried `order||<encrypted>` and the payment page called `PUT /order/order||<encrypted>`, which the old code could not decrypt. The reference reader accepts the prefix. It also reads both the UUID (what the mails encrypt) and the numeric id (what older links encrypted); a UUID is never compared with the numeric column.
7. `Onlinepayment` answered with Mollie's complete payment object and the order with the customer's password hash; it now returns only `docs._links.checkout.href` (what the client uses) and the order without secrets. Any other order status answers the order, as before; errors are `{ err }` without error objects.
8. Unknown request type: the old handler never answered (the request hung); it is a 400 now.

## Implementation decisions
- Kept: the request shapes (`type`, `order`, `product`, `picker`), the answers of `Storepayment` (`{ success, message }`) and `Onlinepayment` (`{ docs, order }`), the price rule of the old `updateProducts`: lines get the current product price as long as the pickup day has not started (the comparison is `now <= pickup date at 00:00 UTC`, so on the pickup day itself prices stay frozen), then the discount calculation of REV-027.
- The whitelist of order fields is my reading of the Order table; the admin app is not in this repository. A field the admin app needs and that is missing shows up as an ignored change: check with `ACCESS_MODE=log` and the first real use (listed in `docs/FUTURE_HARDENING.md`).
- The test-card setting of REV-028 also applies to the second payment.

## Tests added
`ServerNest`: 39 suites, 388 tests (24 new): `orders-update.service.spec` (who may do what for every type, Onlinepayment with the prefix and failures, Storepayment, Product, Update: whitelist, lines of this order only, repricing before/after the pickup day, answer from the database, mail once, stamps once and the cases without stamps, failures that do not fail the update), reference reader cases in `orders.service.spec`, route in `test/orders.e2e-spec`.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (388/388): clean.
- **Live run on the Podman test database with a fake Mollie and mail transport** (script outside the repo, everything removed afterwards, database back to its original row counts): customer places an order (linked to their account), webhook → ordered; `Update` without token 401, as customer 403; as employee `scanned` with `finalPrice` 25 while the body also tried to change the payment id and the customer: both unchanged, line `picked` saved, one mail with the QR attachment, a second save while still scanned sends nothing; `Onlinepayment` with the `order||<encrypted UUID>` reference returns the checkout link and stores the second payment id; its webhook → `payed`; `afgehaald` → 2 stamps (25.00 / 10.00 per stamp) and a second save adds none; `Storepayment`, `Product` (line added to the order of the URL), unknown type 400.
- No parity run (the old handler talks to Mollie and mail, and the intended behaviour differs on purpose).
- Not run: a real Mollie test payment for the second payment; the admin app against the new endpoint.

## Known limitations
- The order update is not guarded against two employees saving at the same time (last write wins).
- Replacing the whole body of the admin app's `Update` with a whitelist can drop a field the app relies on (see above).

## Future work discovered
Optimistic locking (`updatedAt` check) for `Update`; split the four request types into separate endpoints in a later API version; a state machine for the status flow.

## Summary
Orders can be picked, scanned, paid and handed out on the new server; only the customer's payment link is public, everything else needs an employee, and the stamps and mails happen once.
