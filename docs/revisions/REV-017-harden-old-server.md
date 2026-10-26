# REV-017 — Harden the old Server (access rules, crash guard)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-017-harden-old-server`          |
| PR     | #16                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `Server` and `parity` |

## What this revision does
Fixes the two serious problems the parity harness found in the old server, which stays in production until the NestJS cutover: 83 of 98 endpoints needed no login (customer data, catalogue edits, deletes), and one unauthenticated request could crash the whole process.

## Why this revision exists
REV-016 findings. The old server is live until cutover, so it cannot wait for the rewrite.

## What changed
- `routes/middleware/access_rules.js` (new): one table of who may call what, first match wins, deny by default.
  - `public`: shop front (product, departments, discounts, spaaractie, info, order count), login / registration / password reset, guest checkout (`POST /order`, `POST /actie_order`, `PUT /order/:id` from the payment link), e-mail links (`/order|actie_order/single|receipt/:id`), shared shopping list, site cookies, feedback, Mollie webhook.
  - `owner`: a customer's own data (`/customer`, `/customer_favorites`, `/customer_spaaractie`, `/order_information`, `GET /order`): a valid token (customer or employee) **or** a `customer_id` in the query/body. This ends the anonymous bulk dump while guests and the Klant client keep working (customer ids are UUIDs).
  - `user` (employee token): everything else: catalogue and department changes, scanner, image upload/update, deleting orders or customers, users, day totals, settings, roles, order lists by date, the list of all shopping lists, job applications and `PUT /shops` on the store site.
- `routes/middleware/access.js` (new): the middleware. Verifies the JWT with `TOKEN_KEY` and checks that the id exists as employee (`User`) or customer (`Customer`). 401 without or with a bad token, 403 when a customer token hits an employee endpoint. CORS preflight (`OPTIONS`) is never blocked. `ACCESS_MODE=log` only logs what would be denied (for trying it on live traffic first).
- `routes/index.js` (`/api/v1`) and `store_routes/index.js` (`/api/v2`): register the middleware before any router.
- `routes/middleware/request_timeout.js` (new) + `index.js`: a request that has not been answered after 30 s gets `503` (routes whose database callback never fires used to hang forever).
- `index.js`: `process.on('unhandledRejection')` logs instead of letting Node exit (this is what crashed the server on `GET /settings/language`).
- `parity/list-endpoints.js` / `inventory.json`: every endpoint now has a `guard` label (`user` / `customer` / `store` / `none`).
- `Server/.env.example`: documents `ACCESS_MODE`.

## Implementation decisions
- Guest checkout is a real Klant feature (`/bestellen` has `requiresAuth: false`, `Order.vue` handles a missing `customer_id`, `Paypage.vue` pays from an e-mail link), so order creation and the payment link stay public; they are only protected by unguessable ids.
- A central table instead of editing 23 route files: one place to review, and a test fails when an admin endpoint becomes public.
- The old per-route guards (`auth`, `customer_auth`) stay; the new layer runs first. For the three already guarded customer/user endpoints the 401 body changes from `{ "error": {} }` to `{ "error": "Authentication required" }`.
- The unhandled-rejection handler is a stopgap: it keeps the server alive, the broken routes still never answer (503 after 30 s) until the rewrite replaces them.

## Architectural decisions
None beyond the rule table. The NestJS rewrite will replace it with guards, using this table as the list of what each endpoint needs.

## Tests added
`tests/access.test.js` (12 tests): public/owner/employee classification for ~70 endpoint/method pairs, deny by default, store site rules, a check against `parity/inventory.json` that no mutating endpoint the Klant client does not use is public (only the Mollie webhook and the employee login), 401/403/200 behaviour, bad tokens (wrong key, expired, unknown user, Bearer prefix), owner rules with `customer_id` in query and body, preflight, log mode, request timeout.

## Tests executed
- `npm test`: 62/62 pass. All 205 files load against the real config.
- Harness, before (main) vs after (this branch), both against the Podman test database, 33 GET endpoints: public endpoints identical (`/api/v1`, product, search, departments, discounts, info, spaaractie, the public `/api/v2` ones); 401 on the previously open customer, order, order_information, customer_spaaractie, shoppinglist, daytotals, userroles, site, actie_order and job_application endpoints; `settings/language|rights` no longer crash the server; `discounts/get_images` answers 503 instead of hanging.
- Authenticated checks with tokens signed with the parity key and real ids from the test database: employee 200 on `/userroles`, `/order`, `/order_information`; customer 200 on `/order_information` and 403 on `/userroles` and `DELETE /product/delete/1`; no token 401; `customer_id` without a token 200 on `/order_information`; wrong-key token 401; `GET /settings/language` with an employee token: 503 after 30 s, 0 server restarts, the next request answers.
- Not run: the admin/picker app (not in this repository) and real Klant sessions.

## Known limitations / risks
- **The admin app must send its employee token on every call.** It does for `/user`, `/departments` delete etc. already; if it calls other endpoints (product edits, scanner, order lists, day totals) without a token they now return 401. Deploy with `ACCESS_MODE=log` first, read the log for "would be denied" lines, then switch to enforce (the default).
- `owner` endpoints accept any valid `customer_id`: someone who learns another customer's UUID can read that customer's data. Real ownership checks (the token's id must equal `customer_id`) come with the NestJS guards.
- `GET /product` still returns the whole catalogue (26 MB) in one response.
- Guest checkout endpoints remain public and can be spammed; there is no rate limiting.

## Future work discovered
Rate limiting, ownership checks, pagination of `/product` and `/order` (all planned for the rewrite).

## Summary
Anonymous visitors can no longer read customer data or change the shop, guest checkout and the payment links still work, and one request can no longer take the server down.
