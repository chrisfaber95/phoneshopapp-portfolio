# REV-026 — NestJS orders, read side

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-026-nest-orders`                |
| PR     | #25                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds the order read endpoints to the NestJS server: the filtered order list (`GET /order`, `GET /order/:date`), one order by link (`GET /order/single/:orderRef`) and the number of orders per pickup time (`GET /order/count/:date`).

## Why this revision exists
Next in the plan. Creating and changing orders (pricing, mail, Mollie) is a larger step and follows separately; the read side is needed first and the old handlers had several problems worth fixing on their own.

## What changed
- `src/orders/`: `OrdersService`, `OrdersController`, `OrdersModule`, `order-filters.ts` (parser of the JSON filter language), `order-includes.ts` (what is loaded with an order).
- `access.rules.ts`: `GET /order/:date` is an "owner" endpoint like `GET /order` (before it fell through to the employee-only default).
- Parity: `fixtures/orders.sql` (one order with one product line for the test customer), `specs/orders.json` (8 requests).

## Problems of the old handlers, fixed here
1. **Operator injection.** Filters arrive as JSON in the query string and the old code mapped the names straight onto Sequelize (`Op[filterType]`) and used any column name. Now only `and`/`or` groups, the operators `eq ne gt gte lt lte like notLike in notIn`, real `Order` columns and plain values are accepted; anything else is a 400. (A first version of the check used `in`, which accepts `constructor`; the test for that caught it, it uses `Object.hasOwn`.)
2. **A write on every read.** The old list called `save()` on every order it returned. Removed.
3. **Any customer could list any customer's orders**; a customer now only gets their own (`customer_id` is forced to the token's id), employees are unrestricted.
4. **Customer secrets in order answers.** `{ all: true }` included the full customer with password hash and tokens, and the exclusion list for the nested customer had a typo (`resetToken`), so the reset token leaked. The customer is always loaded without secrets.
5. A broken filter used to be logged and ignored, which returned **all orders**; it is now a 400.

## Implementation decisions
- Kept: the filter language (Klant and the admin app send it), deleted orders included in the list, `pickupDate` filters compared as ISO dates, JSON `null` for an unknown order, the encrypted-id convention (reference longer than 40 characters = `Cryptr`-encrypted id, else `uuid_id`), public `single` and `count` (links in e-mails, guest checkout).
- A reference that cannot be decrypted answers `null` without a query.
- **Not carried over:** `DELETE /order` (stub that never answered), `GET /order/test/:id` and `GET /order/product/:id` (debug/legacy). The receipt PDF (`GET /order/receipt/:id`) needs the store database and follows later.

## Tests added
`ServerNest`: 31 suites, 295 tests (23 new): `order-filters.spec` (operators, groups, date handling, 8 rejected inputs), `orders.service.spec` (customer scoping, employees, no secrets, no write, short/encrypted/invalid references, day count), `test/orders.e2e-spec` (routes, JSON `null`, access rules). The existing rules test no longer lists `GET /order/<date>` as employee-only.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (295/295): clean.
- Parity on the Podman test database (`node parity/check.js --spec orders --fixtures auth.sql,products.sql,customers.sql,orders.sql`): **8 of 8 identical** (secrets of the old top-level customer are dropped from the comparison on purpose). The first run found one difference (the nested customer's timestamps), which was fixed.
- Not run: order links with a real encrypted id (covered by unit tests with a mocked crypto service).

## Known limitations
- The list is not paged and loads every association (see `docs/FUTURE_HARDENING.md`); changing that needs a client change.

## Future work discovered
Paging and a lighter list shape for `GET /order`; a plain query-parameter API instead of the JSON filter language.

## Summary
The order read endpoints are on the new server with the same answers, a whitelisted filter language, ownership scoping and no secrets or writes on read.
