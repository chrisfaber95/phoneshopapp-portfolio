# REV-032 — NestJS savings-action orders (actie orders)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-032-nest-actie-orders`          |
| PR     | #31                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds the orders of the savings-action shop (products bought with stamps) to the NestJS server: `GET /actie_order` (+ `/:date`), `GET /actie_order/single/:ref`, `GET /actie_order/count/:date`, `POST /actie_order` (pick-up orders paid with stamps) and `PUT /actie_order/:id` (employees: `Update`, `Product`).

## Why this revision exists
Next in the plan. The old handlers took the stamp price of every product from the client, so products could be ordered for no stamps at all.

## What changed
- `src/actie-orders/`: read, create and update services, input validation, includes, controller, module.
- `GET` of the list and `PUT` use the access rules' default (employee token). `POST`, `count` and the mail link `single` stay public, as in the rules since REV-017.
- `ACTIE_ORDER_EMAIL` setting (where the shop's note about an order goes).
- `orders/order-filters.ts` also treats `pickup_date` as a date; `order-input.ts` exports `contact` and `isEmail`.
- Parity: `fixtures/actie-orders.sql`, `specs/actie-orders.json` (5 requests).

## Problems of the old endpoints, fixed here
1. **Products for free.** The stamp cost per product came from the request (`actieproduct.stamps_cost`) and the check "enough stamps" threw when the customer had no card; the stamps were taken afterwards without a transaction. Now the cost comes from the action's product list in the database, is taken from the customer's own card with a conditional update (never below zero) in the same transaction as the order, and a customer without enough stamps gets the existing "te weinig zegels" answer.
2. **Orders for other customers.** `customer_id` came from the body. Now only a logged-in customer can order, for themself (guests have no stamps).
3. **Delivery never worked.** The old code created delivery orders with an association that does not exist (`order_information` on an actie order), so the request never answered and nothing was stored, and its Mollie amount came from the client. It is not rebuilt because its price rule is unknown: the endpoint answers `{ success: false, error }` for delivery (see the open question below). The actie Mollie webhook (`actiewebhook.js`) belongs to that flow and is not ported.
4. **Contact details.** The pick-up branch read `userDetails.street` etc., but the client sends them in `userDetails.address`, so the address was never stored. Now read from the address object.
5. **Hardcoded personal address.** The shop note about an order went to a private gmail address in the code. It goes to `ACTIE_ORDER_EMAIL` (default `FEEDBACK_EMAIL`, then the shop mailbox).
6. **Anyone could rewrite any actie order** (`PUT` was open, whole body written; the `Product` branch always failed because of undefined variables; `afgehaald` tried to add stamps for a final price that actie orders do not have). Now employees only, a field whitelist, lines of this order only, `Product` adds to the order of the URL, the "ready" mail with QR code goes out once when the status becomes `picked`, the answer is the saved order.
7. `GET /actie_order/single/:id` passed the query string as filter and `{ all: true }` loaded the customer with password hash; `count` counted the rows of the wrong table (`Order`) and never answered (it used a callback style that the connection no longer supports). Fixed; the answer shape `{ ordercounter: [...] }` is kept.
8. Not carried over: `DELETE /actie_order/:id` and `GET /actie_order/product/:id` (empty stubs that never answered).

## Implementation decisions
- Kept: request shape of the Klant page (`userDetails`, `invoiceDetails`, `orderDetails`, `orderProducts` with `variant` lists), answers `{ message, success }` / `{ error, success: false }`, statuses `ordered` → `picked`, paycode `afhaal-<customer>-<time>`.
- A product with variants becomes one line per unit with its variant ids (as before); every variant must belong to the ordered product.
- The order is not linked to the action (the table has no such column; the old code ignored `spaaractie_id` as well).

## Open question for the owner
Delivery of actie orders (`Bezorgen`): what must the customer pay (only the collection fee of 5.36 / 7.86 as the page shows, or also the product prices) and when are the stamps taken? Until this is decided the endpoint refuses delivery.

## Tests added
`ServerNest`: 48 suites, 471 tests (41 new): `actie-order-input.spec`, `actie-orders-create.service.spec` (stamp cost from the database, not enough stamps, no card needed for free products, variants, unknown product/variant, delivery refused, customers only, mails with the configured address, failing mail), `actie-orders-update.service.spec` (employees only, whitelist, lines of this order only, mail once, Product), `actie-orders.service.spec` (filters, references, count), `test/actie-orders.e2e-spec` (routes, access rules).

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (471/471): clean.
- Parity on the Podman test database (`node parity/check.js --spec actie-orders --fixtures auth.sql,actie-orders.sql`): **5 requests: 4 identical, 1 intended difference** (count; the old Server never answered), 0 unexpected.
- **Live run on the test database with a fake mail transport** (rows removed afterwards, database back to its original counts): no token 401, employee 403, three units with only five stamps refused, two units with the client claiming zero stamps cost 4 stamps (5 → 1), mails to the customer and the shop, delivery refused without touching the stamps, order/lines/contact stored (address now saved), list/single/count, update as customer 403, update as employee with a forged `paycode` (ignored) and `picked` (one mail with QR; a second save sends nothing), product added.

## Known limitations
- No delivery (see above). The old Mollie webhook for actie orders is not ported.

## Future work discovered
Link actie orders to their action (new column), audit of stamp changes (see REV-031), delivery once specified.

## Summary
Pick-up orders paid with stamps work on the new server with the stamp price and the stamps taken by the server, and the actie order endpoints can no longer be used by strangers.
