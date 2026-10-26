# REV-009 — Server: add the config folder to git

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-009-server-config-folder`       |
| PR     | #8                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Adds `Server/config/` to the repository, plus `Server/.env.example` and a `logs/` placeholder.

## Why this revision exists
The server could not start from a clean checkout: `index.js`, ~90 route files and all models require `config/*`, which had never been committed.

## What changed
- `Server/config/`: `authentication.js`, `customer_authentication.js` (`sign_token`, `hash_password`), `connection.js`, `connection_store.js` (database connections), `logging.js`, `mailing.js` + `mailTemplates/*` (nodemailer transport and all mail templates), `priceCalculations/index.js` (product and discount pricing). Files are the original ones, unchanged.
- `Server/.env.example`: every variable the code reads (DB_*, MAIL_*, MOLLIE_*, TOKEN_KEY, ORDER_CRYPT_KEY, BASE_URL, PORT), no values.
- `Server/logs/.gitkeep` + `.gitignore` rule: `config/logging.js` writes `./logs/*.txt`, the folder has to exist.

## Implementation decisions
- The owner reviewed all config files and confirmed they contain no hardcoded credentials; they read everything from `process.env`. (Claude's own scan was blocked by the auto-mode safety classifier, so this rests on the owner's check; the one masked scan that ran showed only `process.env.*` references for TOKEN_KEY, DB_PASS, MAIL_PASS.)
- Committed unchanged, no refactoring of the config code in this revision.

## Architectural decisions
None. `config/` was already the layer the routes depend on; it is now versioned.

## Tests added
None (configuration only).

## Tests executed
- Loaded all 201 JS files under `config`, `routes`, `store_routes`, `models`, `store_models` against the real config (no stubs): 0 failures.
- `npm test`: 16/16 pass.
- Not run: connecting to a database, sending mail, pricing against real data.

## Known limitations
- `Server/.env` is still tracked in git with real values (see REV-007); not changed because untracking deletes the file on deployments that `git pull`. Recommended: `git rm --cached Server/.env`, add `.env` to `.gitignore`, and rotate the credentials.
- Earlier scratch tests used stubbed config; the real `connection.js` is now the reference for the `db.connection` API.

## Future work discovered
- `priceCalculations` and `mailing.js` (660 lines of HTML templates) have no tests.
- `mailing.js` and the auth modules duplicate code between `authentication.js` and `customer_authentication.js`.

## Summary
A clean checkout now contains everything the server requires; environment values are documented in `.env.example`.
