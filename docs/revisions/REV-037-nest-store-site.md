# REV-037 — NestJS store site (/api/v2, the `shops` database)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-037-nest-store-site`            |
| PR     | #36                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folders `ServerNest` and `parity` (worked in a git worktree) |

## What this revision does
Adds the store site endpoints on a second database connection (`shops`, the lookup database rebuilt in REV-033): `GET /v2/shops`, `PUT /v2/shops`, `GET /v2/timeslot`, `GET /v2/delivery_location`, `GET /v2/terms`, `GET/POST /v2/job_offer`, `GET/POST /v2/job_application`.

## What changed
- `src/store/`: ten models (`store.models.ts`), `StoreService`, controllers, module with `storeImports()` (second Sequelize connection named `shops`).
- `SHOPS_DB_NAME` setting (default `shops`, as hardcoded in the old server). **`SHOPS_DB_NAME=off` starts the server without the store site**: the connection is made at start-up, so a missing `shops` database would otherwise stop the whole server (the original database was lost, see REV-033).
- Parity: `fixtures/shops.sql` (+ cleanup, loaded into the local `shops` database created from `Database/shops_schema.sql`), `specs/store.json`.

## Problems of the old endpoints, fixed here
1. **The database passwords of the shops were public.** `GET /v2/shops`, `/timeslot`, `/delivery_location` and `/job_offer` are public and sent the `Shops` row, including `database_name`, `database_user` and `database_pw`. They are never sent now, and cannot be filtered on or changed from the API (live run with a marker value: no leak in any answer, and a `PUT` with a `database_pw` left it untouched).
2. `PUT /v2/shops` saved only the opening hours and then crashed in its error handler (an undefined transaction); the shop, information, address and socials were not saved. Now all are saved in one transaction from a whitelist; records are matched to the shop of the request.
3. `POST /job_application` and `POST /job_offer` were copies of the product information import and could not store anything. Applications (public) are validated (name, e-mail, birthday, existing offer, text lengths), get status `new` and only whitelisted fields; offers are employee-only.

## Not in this revision (waiting for your decision)
`POST/DELETE /v2/timeslot` and `DELETE /v2/business_hours`. The old routes guarded them inside the route; in the access rules the paths are listed as public for every method, so adding them now would make them open to everyone. I tried to change that rule to employee-only (`access.rules.ts`), but the change was blocked by the permission check, so the rule is unchanged and these three routes are left out. To finish: make those paths employee-only for POST/DELETE in the rules and add the handlers (the service code was written and removed again; it is in this revision's history in the session notes only).

## Tests
`ServerNest`: 55 suites, 540 tests (+12 in `store.service.spec`: secrets never sent or filterable, shop update whitelist and nesting, applications and offers validation). Typecheck and lint clean.
Parity on the Podman test database (`--spec store --fixtures auth.sql,shops.sql`): **8/8 identical** (the access data columns are ignored in the comparison on purpose: the old answers contain them). **Live run** (rows removed afterwards): no secret in any public answer, `PUT` as customer 403, full shop update, application stored with status `new`, invalid application 400, offer as employee 200 / without token 401, applications as customer 403.

## Summary
The store site endpoints that are safe under the current access rules work on the new server, without exposing the shops' database credentials.
