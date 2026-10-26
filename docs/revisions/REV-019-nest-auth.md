# REV-019 — NestJS authentication (login, tokens, access rules)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-019-nest-auth`                  |
| PR     | #18                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
First real module of the NestJS rewrite: employee and customer login, token signing/verifying, password hashing, order-id encryption, and the access rules of REV-017 as a global guard.

## Why this revision exists
Everything else depends on authentication, and the token format has to stay identical so that existing sessions and the old server keep working while both run.

## What changed
- `src/database/models/`: `User`, `Userrole`, `Customer`, `CustomerSettings`, `CustomerInformation` (Sequelize models with the same attributes as `Server/models`, so responses keep the same fields). `AppModule` now loads models (`autoLoadModels`).
- `src/auth/`:
  - `TokenService`: HS256, `TOKEN_KEY`, payload `{ user_id, email }`, 20 h (customers carry their customer id in `user_id`), `verify` returns null instead of throwing. Uses `@nestjs/jwt`.
  - `PasswordService`: bcryptjs, cost 10, compatible with existing hashes; never throws.
  - `CryptoService`: Cryptr for order ids in e-mail links; `ORDER_CRYPT_KEY`, falling back (with a warning) to the legacy key so old links keep working.
  - `access/access.rules.ts` + `access.guard.ts` + `@Public()`: the rule table of the old server (public / owner / employee, deny by default) as a global `APP_GUARD`; 401 / 403, `ACCESS_MODE=log`, preflight never blocked. `GET /api/health` is `@Public()`.
  - `UserAuthService` / `CustomerAuthService` + `login.controllers.ts`: `POST /api/v1/user/login` and `POST /api/v1/customer/login`, HTTP 200 with `{ user }` or `{ err }` exactly like the old server.
- `parity/fixtures/` (auth test accounts + loader), `parity/specs/auth.json` (12 login cases), parity README.
- `ServerNest/.env.example`, README, `ARCHITECTURE.md` status.
- New dependencies: `@nestjs/jwt`, `bcryptjs`, `cryptr` (the same libraries and versions as the old server); dev: `jsonwebtoken`, `@types/jsonwebtoken`. No install scripts.

## Implementation decisions
- Login messages, the HTTP 200 for failures and the response shape (user record without `password`/`id`, including `user_role` or `customer_settings` + `customer_information`) are kept because the clients depend on them. `@HttpCode(200)` because Nest answers POST with 201 by default.
- **NFC/tag login is not offered.** In the old server it never worked (it searched non-existent attributes `nfcToken`/`nfcSerial`, customers have no NFC columns, and it then compared a missing password, which crashed the request). The new server answers "Verkeerde gegevens ingevoerd". Needs an owner decision: should an employee card log in without a password?
- Failed logins are logged without the request body and headers (the old server wrote passwords and tokens to its log).
- A missing or unhashed password is an ordinary mismatch (the old server crashed the request).
- Unknown non-versioned, non-`@Public` routes need an employee token; unknown paths answer 404 (the old server answered 401), which leaks nothing.

## Architectural decisions
Access control is one guard plus a rule table, as in the old server, so every later module is protected by default; a module only has to be listed in the table (or marked `@Public()`). Later revisions can replace the table by per-controller decorators.

## Tests added
`ServerNest`: 10 suites, 107 tests (Jest, no real database):
- `token.service.spec` (token format, lifetime, tokens from the old server, all invalid-token cases), `password.service.spec` (including a hash created by the old server), `crypto.service.spec` (round trip, key, legacy fallback with a value from the old library), `access.rules.spec` (~70 endpoint/method pairs, version prefix, inventory check that no admin endpoint is public), `user-auth.service.spec` and `customer-auth.service.spec` (success, wrong password, unknown/no-password account, missing fields, tag login, database error, non-text input), `test/access.e2e-spec` (401/403/200, bad tokens, owner rule, preflight, log mode, `@Public()`), `test/login.e2e-spec` (HTTP 200 contract).

## Tests executed
- `npm run typecheck`, `npm run lint`: clean. `npm test`: 107/107. `npm run build`: OK.
- **Parity against the old server on the Podman test database** with temporary test accounts (`parity/fixtures/auth.sql`, removed again afterwards): `parity/specs/auth.json`, 12 login cases (employee by e-mail, card number, upper-case e-mail, wrong password, unknown user, missing password, empty body; customer by e-mail, e-mail with spaces and capitals, wrong password, unknown user, empty body): 12 same, 0 different (the first run was invalid because the fixtures had not loaded; caught by checking that the successful logins really succeed, then re-run).
- Token interoperability: a token issued by the new server has payload `email, exp, iat, user_id`, lifetime 20 h, and is accepted by the old server's access rules (employee token: 200 on `/userroles`; customer token: 403 on `/userroles`, 200 on `/order_information`).
- Not run: the real (live) database, NFC cards, the admin app.

## Known limitations
- Registration, password reset and the other customer/user endpoints follow in their modules; only the two logins exist.
- Only the attributes the old models exposed are mapped (for example `User.phone` and `User.date` are columns but not modelled, as before).
- The two access guards (old and new) are separate implementations of the same table; the table is copied, not shared, until the cutover removes the old one.

## Future work discovered
- Decide NFC login. Decide whether `owner` endpoints should check that the token's id equals the customer id.
- `@nestjs/jwt` `expiresIn` is typed narrowly (`StringValue`); the cast in `TokenService.sign` can go when a typed lifetime constant is introduced.

## Summary
Employees and customers can log in on the new server with identical answers (checked by the parity harness) and compatible tokens, and every future endpoint is covered by the access rules from the start.
