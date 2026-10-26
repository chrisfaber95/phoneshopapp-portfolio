# Possible hardenings and changes for later

Collected during REV-003 to REV-020 (dependency upgrades, security fixes, the NestJS rewrite). Nothing here is scheduled; it is a
backlog to pick from. Each item says where it came from. Priority: **H** high (security or data risk), **M** medium, **L** nice to have.
This file is local documentation (like the rest of `docs/`) and is extended with every revision.

## 1. Security

| P | Item | Why / detail | From |
|---|---|---|---|
| H | **Rotate all credentials that were in git** | `Server/.env` (DB password, Mollie live key, mail password, `TOKEN_KEY`) was committed from the first commit and stays in history. Rotate, optionally purge history (`git filter-repo`). `TOKEN_KEY` rotation logs everybody out. | REV-010 |
| H | **Ownership checks on customer data** | "owner" endpoints accept any valid `customer_id` (UUID) as proof; the token's id is not compared. Require token id == customer id (customers) or an employee token. | REV-017 |
| H | **Guest checkout is unlimited** (rate limit added in REV-039; still open: clean up pending orders) | `POST /order` is public and creates a Mollie payment per call; a script can create thousands of `pending` orders. Rate limit per IP, and clean up `pending` orders without a completed payment after some hours. | REV-028 |
| H | **Rate limiting and lockout** (partly done in REV-039: @nestjs/throttler, 10 requests a minute on logins, sign-up, password reset, guest checkout, applications, feedback; 300 on everything else. Still open: lockout of an account after repeated failures) | Logins (password and NFC card), registration, password reset, guest checkout and feedback are unlimited. Use `@nestjs/throttler` on the new server; nginx/limit on the old one. | REV-017/020 |
| H | **Remove the legacy fallback keys** | `ORDER_CRYPT_KEY` falls back to the old hardcoded key `myTotalySecretKey`; set the variable, then rotate (old e-mail links stop working, decide on a grace period) and delete the fallback. | REV-007/019 |
| M | **JWT lifetime, refresh and revocation** | 20 h tokens, no refresh, no logout/revocation (the stored `accessToken` is not checked). Consider short access tokens + refresh, or check the stored token. | REV-019 |
| M | **Password policy and reset flow** | No minimum strength; check reset token expiry and single use; the registration generates a random password (see customers module). | REV-019 |
| M | **Account enumeration** | The reset request answers differently for known and unknown e-mails, and sign-up names existing fields; both let someone find out who has an account. Needs a client change (same message for both). | REV-025 |
| M | **Password policy** | No minimum strength at sign-up, password change or reset. | REV-025 |
| M | **CORS `*`** (configurable since REV-039: set CORS_ORIGINS) | Every origin may call the API. Restrict to the shop domains once known. | REV-018 |
| M | **HTTP security headers** (helmet added in REV-039; HTTPS and HSTS at the proxy are still open) | `helmet`-style headers, HTTPS only, HSTS. The old server runs plain HTTP (TLS code is commented out); terminate TLS at a proxy. | REV-018 |
| M | **Stricter input validation** | Start permissive (`whitelist: false`); add DTOs with `class-validator` per module, then enable `whitelist`/`forbidNonWhitelisted`. | REV-018 |
| M | **Upload safety** | Image uploads (`discounts/images`, product images): check file type by content, size limit, random file names, store outside the web root. | REV-007 |
| M | **Guest checkout abuse** | `POST /order` and `PUT /order/:id` are public by design; add rate limiting and basic abuse detection. | REV-017 |
| M | **NFC card handling** | Card login is password-less: keep the card/serial secret, add a way to register and revoke cards, log card logins, rate limit. | REV-020 |
| L | **Audit log** | Who changed products, prices, orders. There is none. | - |
| L | **Dependency audit in CI** | `npm audit` still reports issues in deprecated transitive packages of the old server (request, nedb); they disappear with the rewrite. | REV-003 |

## 2. Performance and data

| P | Item | Why / detail | From |
|---|---|---|---|
| H | **Paginate `GET /product` and `GET /order`** | `/product` returns all 12,304 products (26 MB) in one response, `/order` 778 KB. Violates the performance rule in `ENGINEERING_RULES.md`; needs database-side paging, filtering and sorting (client change needed). | REV-016 |
| M | **Indexes** | All 38 tables use `char(36)` UUID primary keys and the dump shows few secondary indexes; measure slow queries (search uses `MATCH ... AGAINST`) before changing anything. | REV-015 (podman) |
| M | **Logging volume** | The old server wrote every SQL statement to `logs/LogInfo.txt` and failed logins with headers/bodies. The new server uses Nest's logger; add log rotation/shipping. | REV-007/019 |
| M | **Image handling** | Cache headers for product images, resize on upload (sharp), lazy loading in the client. | - |
| L | **Product images as base64 in JSON** | `update_images` takes base64 in a 10 MB JSON body; switch to multipart uploads. | REV-007 |
| H | **Order list loads everything** | `GET /order` loads every association (customer, product lines with product, information, discounts) for every order that matches, with no paging or limit; an empty filter returns all orders ever placed. Add `limit/offset`, a lighter list shape and a separate detail call (needs an admin/client change). | REV-026 |
| M | **Filter language stays a client contract** | The JSON filter in the query string (`0[]={"filterType":"and",...}`) is kept because Klant and the admin app send it; it is whitelisted now (columns, operators), but a plain query-parameter API would be simpler to validate and cache. | REV-026 |
| M | **Money as floating point** | Prices and totals are JS numbers rounded through cents at the end; use integer cents or a decimal type for order totals when the order write side is built. | REV-027 |
| M | **Payment method is never passed on** | Klant sends `orderDetails.paymentMethod`, the server (old and new) reads `selectedBetaal`, so Mollie always shows its own method list. Fix in the client or accept both. | REV-028 |
| M | **Invoice numbers** | Counted per day without a lock (duplicates possible), month counted from 0 (kept for continuity). Add a unique index and a sequence table. | REV-028 |
| M | **One pricing implementation** | The server and the Klant client each carry a copy of the discount rules; totals can differ by cents. Let the client ask the server for a quote. | REV-028 |
| M | **Check the paid amount** | The webhook trusts Mollie that the payment is paid but does not compare the amount with the order (`picking_price`, later `finalPrice`). Compare, and log a mismatch. | REV-029 |
| M | **Order update: whitelist and concurrency** | `PUT /order/:id` (type Update) now writes only a whitelist of order fields; confirm with the admin app that it needs nothing else. Two employees saving the same order overwrite each other: add an `updatedAt` check. The four request types could become separate endpoints. | REV-030 |
| M | **Images on local disk** | Product, discount and action images are written to `public/` of the server (as before) and served from there; use object storage/CDN, resize on upload, and keep them out of the app server before running more than one instance. | REV-031 |
| M | **Audit trail for points and stamps** | Employee counter functions change stamps and points with only a log line as trace; add a table of changes (who, when, before/after). | REV-031 |
| H | **Actie order delivery is undefined** | Delivery of savings-action orders never worked in the old Server; the new endpoint refuses it. Needs a decision on the price rule (collection fee 5.36 / 7.86 only, or products too) and on when stamps are taken, then a Mollie flow + webhook. | REV-032 |
| L | **Actie orders are not linked to their action** | The table has no `spaaractie_id`; the stamps are taken from the right card but the order does not say which action. Add the column. | REV-032 |
| L | **Connection pool sizes** | The old server used `max: 150`; the new one 30. Tune with real load. | REV-018 |

## 3. Architecture and code

| P | Item | Why / detail | From |
|---|---|---|---|
| H | **CI workflow** | No GitHub Actions exist; only GitGuardian runs. Add typecheck, lint, test, build for `ServerNest` (and lint/build for `Klant`). | REV-018 |
| M | **Ownership of pricing rules** | Discounts use the ordered `amount`, while `normal_total_price` uses `picked || amount`; decide and unify (compute from picked once an order is picked). Remainder units of a combination deal are charged on the most expensive product; confirm that is what the shop wants. | REV-013 |
| M | **Single pricing function** | `getTotalPrice` and `productRows` repeat the same pricing rules. | REV-013 |
| M | **Dead code in the old server** | Large commented-out blocks (`actie_order/update.js`, `site.js`, ...), unused functions, `salt` set up in files that never hash. Disappears with the cutover. | REV-008 |
| M | **Deployment story** | No Dockerfile, process manager or environment documentation for the new server; define at cutover (env file handling, health check on `/api/health`, restart policy). | REV-018 |
| M | **API documentation** | `@nestjs/swagger` on the new server (cheap once DTOs exist). | plan |
| L | **Upgrade path** | NestJS 12 is ESM-only; moving up needs an ESM project setup. TypeScript is on 6.x because `ts-jest` needs `<7`. | REV-018 |
| L | **Shared types with the client** | A types package for API shapes used by Klant. | - |
| M | **Signed-in customers' order history access** | Orders, receipts and payment links are identified by UUID / encrypted ids only (capability links); decide how long they stay valid. | REV-025 |
| M | **Mail queue and retries** | E-mails are sent inline by the request that triggers them; a slow or failing SMTP server slows or fails the request. Queue them (with retries) and keep the request fast. Also pass `BASE_URL` into the templates instead of reading `process.env`. | REV-024 |
| L | **Unimplemented department routes** | `GET /departments/single/:id`, `POST /departments/post`, `PUT /departments/update/:id` only answer `"No"` in the old server and in the new one (kept for parity). Implement department maintenance properly or remove the routes and tell the admin app. | REV-021 |
| L | **Language setting** | `GET /settings/language` answers an empty list: the table it read (`bollegraafdb.Language`) belongs to an older project. Remove the route if nothing uses it. | REV-021 |

## 4. Product and client (Klant)

| P | Item | Why / detail | From |
|---|---|---|---|
| M | **Vue 2 is end of life** | Klant uses Vue 2; a Vue 3 migration spike exists (REV-001, not reviewed). | REV-001 |
| M | **Guest checkout and API errors** | The API answers many failures with HTTP 200 and `{ err }`; the client depends on it. Real status codes need a client change and a transition period. | REV-019 |
| L | **Env values in the bundle** | `VUE_APP_*` values are visible to every visitor; never put secrets there. | REV-010 |

## 5. Operations

| P | Item | Why / detail | From |
|---|---|---|---|
| H | **Backups and restore test** | Nothing in the repository describes backups of the production database. | - |
| M | **Monitoring** | `/api/health` exists on the new server; add uptime checks and error alerting. | REV-018 |
| M | **Test database reseed** | `parity/reseed.ps1` was never run (it wipes the test DB); try it once deliberately. | REV-016 |
| L | **`shops` database for `/api/v2`** | The store site's database is not in the dump, so v2 parity checks cannot run yet. | REV-016 |

## 6. Known differences the rewrite introduces on purpose
Kept here so they are not forgotten at cutover.
- Failed logins are no longer logged with request headers/bodies.
- Unknown routes answer 404 (the old server: 401).
- NFC card login works for employees (the old one crashed).
- Unauthenticated requests to the old open endpoints answer 401 (already so since REV-017).
- `POST /actie_order`: stamp price and stamps taken by the server from the customer's own card, customers only, delivery refused (it never worked), contact address now stored, shop note goes to `ACTIE_ORDER_EMAIL`; `PUT /actie_order/:id` is employee-only with a field whitelist; `count` counts actie orders; `DELETE` and `/product/:id` stubs are not carried over.
- `PUT /customer_spaaractie`: the points balance comes from the database, points are always taken (the first exchange used to be free); `employeeupdate/employeechange/nostamps` are employee rules; stamp cards of other customers answer 403; `POST /customer_spaaractie` and `GET /customer_spaaractie/reminder` are not carried over; an exchange of zero stamps answers a message.
- `PUT /order/:id`: only type Onlinepayment is public (the old route let anyone rewrite any order); Update writes a field whitelist and answers the saved order; the pick-up mail goes out once; stamps are added once on the status change to afgehaald (the old code could not add them); link references with the order|| prefix work.
- `POST /mollie/webhook`: unknown or malformed payment ids answer 422 (the old one crashed or leaked the error); the confirmation mail goes out once and falls back to the customer account e-mail; product variants are loaded for the mail.
- `POST /order`: prices, fee and customer link come from the server (the old one used the client's values); the two hardcoded test loyalty cards no longer switch to Mollie test mode (`MOLLIE_TEST_CARDS`); a failed payment removes the order; new settings `PICKUP_FEE`, `DELIVERY_FEE`, `BASE_URL`.
- `GET /order`: a customer only gets their own orders; unknown filter columns/operators answer 400 (the old server ignored a broken filter and returned everything); orders are no longer re-saved on read; customer secrets, incl. the reset token (typo in the old exclusion list), are never sent. `DELETE /order` (stub that never answered), `/order/test/:id` and `/order/product/:id` (debug) are not carried over.
