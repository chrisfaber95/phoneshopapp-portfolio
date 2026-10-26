# REV-016 — Parity harness for the NestJS rewrite

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-015-parity-harness` (merged under the name REV-015, see note) |
| PR     | #15                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), new folder `parity` |

> **Numbering note:** PR #15 and its commit are titled "rev-015" because another revision (PR #14, "Local dev database via Podman") was merged under REV-015 while this one was in progress. To keep revision numbers unique this document is REV-016; the PR title cannot be changed after the merge.

## What this revision does
First step of the NestJS rewrite: a differential test harness (`parity/`) that runs the old Server and the future NestJS server against the same disposable test database, sends both the same requests and compares the responses. It also produces the exact endpoint inventory of the old server.

## Why this revision exists
A rewrite is only safe if "same behaviour" can be checked. Recorded responses are not committed because the test database holds customer and order rows; the two servers are compared live instead.

## What changed
- `parity/list-endpoints.js` + `inventory.json`: every endpoint of the old server, read from the Express routers while the route files load, with a `usedByKlant` flag from the calls in `Klant/src`. **98 endpoints** (87 `/api/v1`, 11 `/api/v2`; 52 GET, 24 POST, 13 PUT, 9 DELETE), of which **32 are called by Klant**. (The earlier "about 106" counted commented-out routes.)
- `parity/compare.js` (+ 10 unit tests): status, content type and normalised JSON comparison; timestamps and tokens ignored; differences reported as JSON paths and types, never values.
- `parity/run.js`: sends the same requests to `--old` and `--new`, retries when a server is restarting, exit code 1 on any difference; GET only unless `--include-mutations` + `PARITY_CONFIRM_DISPOSABLE_DB=yes`.
- `parity/start-server.js`: starts a server with the safe environment and restarts it when it exits.
- `parity/safe-env.js`: sets every environment variable the servers read so `Server/.env` (live database, live Mollie key, real mail account) is never loaded; dummy Mollie/mail values; refuses a database that is not local and `*_test`.
- `parity/reseed.ps1`: reloads the test database from the dump (Podman or Docker). **Written but not run**: it would wipe and reload the container's `cooplubbers_test`.
- `parity/README.md`, `package.json` (no dependencies), `.gitignore` (`reports/`).

## Implementation decisions
- Differential (old vs new, live) instead of golden-master files: no customer data in git.
- Zero dependencies, plain Node 24 (`fetch`, `node:test`), in line with the dependency policy.
- Podman (not Docker) runs the database on this machine; the container `cooplubbers_mysql` from `docker-compose.yml` is used (`cooplubbers_test`, 38 tables, seeded from the dump).

## Architectural decisions
The rewrite is built alongside the old server in `ServerNest/` and cut over at the end (plan approved by the owner: full NestJS rewrite, all endpoints, broken ones fixed).

## Tests added
`parity/tests/compare.test.js` (10 tests).

## Tests executed
- `node --test parity/tests/*.test.js`: 10/10 pass. `Server` `npm test`: 50/50 pass.
- End to end: old server started by `start-server.js` against the Podman test database, `run.js` old-vs-itself over the 33 GET endpoints without path parameters: 33 same, 0 different, including 4 automatic restarts after crashes.
- Not run: the mutating mode, `reseed.ps1`, the NestJS side (does not exist yet).

## Findings about the old server (by running it; none fixed in this revision)
1. **`GET /api/v1/settings/language` and `GET /api/v1/settings/rights` crash the whole server process** (unhandled promise rejection: `db.connection.query(sql, callback)` returns a promise, the callback is never called, and the SQL uses the non-existing database `bollegraafdb`). In production the same routes may hang instead of crashing, but they never answer. This applies to the ~19 files that call `db.connection.query` with a callback.
2. **Many endpoints return data without authentication**: `GET /api/v1/order` (all orders), `/order_information` (all customer records with names and phone numbers), `/customer_spaaractie` (all loyalty records), `/actie_order`, `/shoppinglist`, `/product` and more return HTTP 200 and full data without any token. (`/customer/single`, `/customer/employee`, `/user` do answer 401.)
3. `GET /api/v1/product` returns the entire catalogue (12,304 products, 26 MB) in one response; `GET /api/v1/order` returns 778 KB (against the performance rule of not loading whole collections).
4. `/api/v2` answers 400 everywhere on the test container: the store database `shops` is not in the dump.
5. `GET /api/v1/discounts/get_images` never answers (same callback problem).

## Known limitations
- The default spec only covers GET endpoints without path parameters (33 of 98) and no authenticated calls; per-module specs extend it (see README).
- `start-server.js` leaves the child process running if the launcher is killed forcibly (Ctrl+C is handled).

## Future work discovered
- **Urgent for the old server until cutover (separate hardening revision):** add authentication to the open endpoints (finding 2) and guard the crashing routes (finding 1, e.g. a process-level `unhandledRejection` handler plus answering with an error). Needs a decision because the Klant client calls some of these endpoints and must keep working.
- Seed a `shops` database for the `/api/v2` parity checks.

## Summary
The rewrite now has an objective yardstick, an exact inventory of what has to be rebuilt, and a first set of serious findings about the old server.
