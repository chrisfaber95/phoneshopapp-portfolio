# REV-008 — Server: escape the remaining live SQL

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-008-server-sql-escaping`        |
| PR     | #7                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Escapes request and scraped values in the last live queries that were built by string concatenation.

## Why this revision exists
Follow-up to REV-007, which listed the remaining concatenated queries.

## What changed
- `routes/user/register.js`, `routes/customer/register.js`: `CALL register_user(...)` now uses `db.connection.escape` for email, password hash and name (public registration endpoints).
- `routes/discounts/images.js`: `call addImages(path, originalname, mimetype, @LID)` escapes all three; the file name comes from the uploaded file.
- `routes/site/site.js`: the scraper's INSERT escapes every value, like `scanner.js` in REV-007.

## Implementation decisions
- Same approach as REV-007 (`db.connection.escape`), since it works whichever driver sits behind `db.connection.query`.
- Correction to REV-007's "remaining" list: the ~12 concatenated statements in `routes/actie_order/update.js` are inside a block comment (`/*const db ... }*/`, from line 191), as are the ones in `user/add.js`, `shoppinglist/add.js`, the Mollie/site webhooks and the old blocks in `site.js`. They are dead code, not live holes. No live concatenated SQL with request data remains (searched `routes/` for `sqlquery` and `connection.query` call shapes).

## Architectural decisions
None.

## Tests added
None. The handlers require `config/connection`, which is not tracked in git (see below), so a committed test cannot load them.

## Tests executed
- `npm test`: 16/16 pass (unchanged).
- Direct handler calls in a scratch copy with Sequelize's real `escape`: the register and upload calls with `'); DROP TABLE ...` input produce properly quoted and escaped SQL.
- Not run: real DB, real registration or upload.

## Known limitations
- **`Server/config/` is still not in git.** The original files now exist in the working tree (untracked: authentication, connection, connection_store, customer_authentication, logging, mailing, mailTemplates, priceCalculations) but were NOT committed here: an older copy of the file (`webshop/Visualshopping-Server/config/connection.js`) contains plain-text server passwords in a comment, and I could not review these for credentials. They need to be reviewed, secrets moved to env vars, and committed in their own revision.
- `routes/customer/register.js` / `routes/user/register.js`: `createUser` ignores its callback, so `result.registered` is read from `undefined` and the request never answers (existing bug, not touched).

## Future work discovered
- Commit `Server/config/` (after credentials review) + `.env.example`; untrack `Server/.env` and rotate its credentials (see REV-007).
- Delete the large commented-out blocks (dead SQL) in `actie_order/update.js`, `user/add.js`, `shoppinglist/add.js`, `site/site.js`.

## Summary
All live concatenated SQL is now escaped; the config-folder problem is diagnosed but waits on a credentials review.
