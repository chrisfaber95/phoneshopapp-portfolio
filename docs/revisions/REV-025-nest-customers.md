# REV-025 — NestJS customers, favorites, saved addresses, shopping lists, cookies, feedback

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-025-nest-customers`             |
| PR     | #24                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds the customer-facing account endpoints to the NestJS server: sign-up, profile, password reset, favorites, saved delivery/invoice details, shopping lists, cookie acceptance and the feedback form, and closes the holes the old versions had.

## Why this revision exists
Next in the plan. Reading the old code showed that these endpoints (written for an older, trusted setting) allowed account takeover, so they were rebuilt with the same client-visible behaviour but with the security problems fixed, and the parity harness was extended to tell intended differences from regressions.

## What changed
- `src/customers/`: `CustomersService` + controller (`GET /customer`, `/customer/single`, `/customer/employee`, `/customer/employee-all`, `POST /customer`, `PUT /customer`, `POST /customer/passwordreset`, `DELETE /customer`), `FavoritesService` (`/customer_favorites` GET/POST/DELETE), `OrderInformationService` (`/order_information` GET/DELETE), `customer-fields.ts` (which fields may be written by whom).
- `src/shopping-lists/` (`GET /shoppinglist`, `/shoppinglist/:listId`, `POST /shoppinglist`), `src/site/` (`POST /site/cookies`, `POST /feedback`).
- `src/auth/ownership.ts` (customer only for themself, employees for anyone), `principal.decorator.ts`, a rule for the employee-only customer lookups in `access.rules.ts`; `FEEDBACK_EMAIL` setting.
- Parity: `run.js` per-request `ignoreKeys` (secrets the new server no longer sends) and `knownDifference` (intended differences are reported, not counted as failures); `compare.js` drops ignored keys; `check.js` removes fixtures in reverse order; `fixtures/customers.sql`, `specs/customers.json` (25 requests).

## Security problems of the old endpoints, fixed here
1. **Password reset with an empty token reset any account without an outstanding reset** (`where email AND resettoken = ''`), tokens came from `Math.random`, never expired, every field of the body was written, and the mail went to any address. Now: random token (`crypto`) with an expiry (2 h, as the e-mail promises), single use, empty/malformed/expired tokens never reach the database, only the password and the token are written, nothing is mailed to an address that is not a customer.
2. **`PUT /customer` updated whichever `customer_id` the body named, and wrote every field** (loyalty points, access token, activation, even a plain-text password when `old_password` was missing). Now: only the logged-in customer themself, only profile fields, a new password needs the correct old one and is stored hashed, addresses can only be changed when they belong to the customer.
3. **`POST /customer` (sign-up) wrote every field** (a customer could set their own points) **and answered with the password hash**. Now: only the sign-up fields, the e-mail is stored lower case without spaces (the login looks it up that way; the old sign-up stored it as typed), the answer has no password, token or reset token.
4. **Customer data leaks:** `GET /customer_favorites` and `GET /order_information` included the whole customer (password hash, access token, reset token) in every record; `GET /customer` returned the reset token (the exclusion list had a typo); `GET /order_information` with only a token returned the saved addresses of ALL customers (202 records). Now secrets are never sent and a customer only ever gets their own records.
5. **No ownership checks:** `GET /customer/single`, favorites and saved addresses could be read, added or deleted by id for any customer. Now 403 for another customer's data.
6. `POST /site/cookies` stored the whole login token in the database next to the cookie record; it is no longer stored. `POST /feedback` mailed a personal gmail address hardcoded in the code; it goes to `FEEDBACK_EMAIL` (default: the shop mailbox `MAIL_USER`).

## Implementation decisions
- Kept: the answer shapes and texts the client relies on (`{ err }` with HTTP 200, `{ data: { success } }`, `"No Auth"`, `[favorite, created]`, JSON `null`), including the quirky duplicate message (`De volgende velden bestaan al: <index names>`).
- The fields a customer may change are the ones the Klant profile pages send (first/last name, e-mail, gender, birth date, phone, updates, loyalty card, default address ids). `storepoints`, `waitinglist`, `activated`, tokens and ids are server-controlled.
- **Not carried over:** `POST /customer/register` (called a stored procedure that does not exist and never answered) and `PUT /shoppinglist` (a copy of the customer update that changed a Customer without any check).
- `GET /customer/single` is for customers only (the old route guard rejected employees as well); employees use `/customer/employee`.

## Architectural decisions
Who may write which field is one list per purpose (`customer-fields.ts`), and ownership is one helper used by every endpoint that touches one customer's data.

## Tests added
`ServerNest`: 28 suites, 272 tests in total (70 new): `customers.service.spec` (sign-up whitelist, hashing, duplicate and incomplete cases; update whitelist, password change rules, settings, addresses scoped to the customer; reset request/confirmation including empty, malformed and expired tokens; random tokens), `favorites.service.spec`, `order-information.service.spec` (ownership, scoping, secrets excluded), `shopping-lists.service.spec`, `site.service.spec` (no token stored, UUID check, feedback recipients and escaping), `test/customers.e2e-spec` (401/403/200 for every customer endpoint, JSON `null` and `"No Auth"` bodies), rules test extended.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (272/272), `npm run build`: clean.
- Parity against the old server on the Podman test database (`node parity/check.js --spec customers --fixtures auth.sql,products.sql,customers.sql`): **25 requests: 21 identical, 4 intended differences, 0 unexpected.** Intended: another customer's profile (403 instead of the data), employee token on `/customer/single` (403 instead of 401), updating another customer (403 instead of success), saved addresses with only a token (own record instead of all 202). Secrets in favorites, addresses and the customer answers are dropped from the comparison on purpose (`ignoreKeys`).
- **Live security run on the new server** (test database, test account created and removed): sign-up with `storepoints`/`accessToken`/`activated` in the body (not stored; answer without secrets; e-mail lower-cased), duplicate e-mail, login with the new account, reset request (random 41 character token with expiry), unknown e-mail, four reset attacks (empty, missing, wrong, well-formed but unknown token: all refused, old password still works), real reset (works, token gone, cannot be used twice, new password works and old does not), profile update (name changed; `storepoints` and access token unchanged; settings and address saved), updating and reading another customer (403, unchanged), own profile without secrets: 27/27 checks OK.
- Not run: sending the reset e-mail through a real mail server; POST/DELETE of favorites and addresses against the old server (they change shared data; covered by unit and e2e tests and the ownership tests).

## Known limitations
- The "unknown e-mail" answer of the reset request still differs from the success answer, which lets someone find out whether an e-mail has an account (kept because the client shows that message; the sign-up reveals the same). See `docs/FUTURE_HARDENING.md`.
- Reset tokens in the old format (no expiry part) no longer work: customers who asked for a reset before the cutover must ask again.
- No rate limiting on sign-up, reset requests or feedback.

## Future work discovered
Password policy (minimum strength) for sign-up, change and reset; rate limiting; send the same answer for known and unknown e-mails; let the client show server validation errors instead of alerting `err` texts.

## Summary
The customer account endpoints are on the new server with the behaviour the Klant client depends on, and with account takeover, data leaks and ownership holes closed and proven by tests and a live run.
