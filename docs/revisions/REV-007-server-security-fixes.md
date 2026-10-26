# REV-007 — Server: security fixes

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-007-server-security-fixes`      |
| PR     | #6                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Fixes SQL injection and path traversal in a number of routes, moves the hardcoded secrets out of the source, and repairs one Express 5 leftover from REV-003.

## Why this revision exists
Found while reading the code for the dependency work (see the plan for REV-004..007).

## What changed
- SQL injection (request values are now escaped or validated):
  - `routes/discounts/get_images.js`: `imgId` must be digits (`isDigits`, 400 otherwise); query errors / missing image now answer 500 / 404 instead of hanging the request.
  - `routes/product/search.js`: `department_id` is escaped (it was interpolated raw); the EAN `LIKE` no longer double-quotes its value; removed two `console.log`s of the search text.
  - `routes/order/product.js` (`orderId`), `routes/product/delete.js` (`userId`), `routes/actie_order/count.js` (`date`): `db.connection.escape(...)`.
  - `routes/product/scanner.js` (`POST /product/scanner`): every `req.body` value and scraped value in the SELECT/UPDATE/INSERT is escaped; the product URL uses `encodeURIComponent(ean)`.
- Path traversal: `routes/product/update_images.js` only accepts a digits-only `ean` (it is used in the file name).
- Secrets: new `routes/middleware/secrets.js` exporting `cryptr` (key from `ORDER_CRYPT_KEY`) and `getJwtSecret()` (`TOKEN_KEY`). Replaced the 9 `new Cryptr('myTotalySecretKey')`; removed 18 unused `const SECRET_KEY = "secretkey23456"` declarations; `routes/customer/register.js` and `routes/user/register.js` now sign with `getJwtSecret()`; removed the unused Mollie test-key client (hardcoded key) from `routes/mollie/index.js`.
- Express 5 leftover: `res.send(200, result)` (removed in Express 5) in `get_images.js` -> `res.status(200).send(result)`. My REV-003 scan missed this two-argument form; a search for the other removed call shapes found no more.
- New `routes/middleware/validate.js` (`isDigits`).

## Implementation decisions
- Escaping with the existing `db.connection.escape` rather than changing the query API: `Server/config/` is not in the repo, so the driver behind `db.connection.query` cannot be checked. Escaping and digit validation work with any of them.
- `ORDER_CRYPT_KEY` falls back to the old built-in key (with a console warning) so existing order links in e-mails keep working. To finish: set `ORDER_CRYPT_KEY` in the real `.env` (first to `myTotalySecretKey`, rotate when old links no longer matter).
- Registration tokens used to be signed with the hardcoded `secretkey23456`, while the auth middleware verifies with `TOKEN_KEY`, so they could never verify. They are now signed with `TOKEN_KEY` (set in the existing `.env`). `getJwtSecret()` throws if `TOKEN_KEY` is missing.
- `secrets.js` loads dotenv itself (quiet): `index.js` requires the routes before it calls `dotenv.config()`.

## Architectural decisions
Shared secrets/validation helpers live in `routes/middleware/` next to the other shared helpers.

## Tests added
`tests/secrets.test.js` (key from env, wrong key cannot decrypt, legacy fallback, TOKEN_KEY required), `tests/validate.test.js` (digits accepted; traversal, SQL, empty, decimals rejected).

## Tests executed
- `npm test`: 16/16 pass. Scratch copy: all route/model files load. Scratch HTTP checks with the real Sequelize `escape`: `/img/1 OR 1=1` -> 400 with no query run; injected `orderId` and `date` come out quoted and escaped; `update_images` with `ean: ../../x` -> 400; scanner INSERT still built correctly.
- Not run: real DB, the Mollie webhooks, e-mail links end to end.

## Known limitations
- **`Server/.env` is tracked in git** and holds real values (DB password, Mollie live key, mail password, `TOKEN_KEY`). The repo is private, but I did not untrack it: `git rm --cached` would delete the file on any deployment that updates via `git pull`. Recommended: untrack it (add `.env` to `.gitignore`, keep an `.env.example`), and rotate those credentials, since they remain in history.
- Many more queries are built by string concatenation and were not touched: most of `routes/actie_order/update.js` (about 12 statements with `req.body`/`req.params`), `routes/daytotals/post.js`, `routes/settings/*`, `routes/shoppinglist/add.js`, `routes/user/{add,register,employee}.js`, `routes/customer/register.js`, the Mollie webhooks, `routes/site/site.js`. They are the subject of a follow-up revision.
- `update_images.js` still sends a response twice on success (existing bug).
- Endpoints have no rate limiting; CORS is `*` (existing).

## Future work discovered
- REV-008 candidate: the remaining SQL concatenation listed above (prefer Sequelize models or bound parameters once `config/connection` is in the repo).
- Untrack and rotate `.env` credentials (see limitations).
- `salt`/`bcrypt` set up in many route files that never hash.

## Summary
Injection and traversal holes closed in the routes that were easy to fix safely, secrets out of the code, and the list of what is still open is written down.
