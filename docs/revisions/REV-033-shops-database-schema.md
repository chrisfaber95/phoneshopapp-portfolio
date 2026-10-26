# REV-033 — Rebuild the `shops` database schema

| Field  | Value                                       |
| ------ | ------------------------------------------- |
| Date   | 2026-10-01                                  |
| Branch | `feature/rev-033-shops-database-schema`     |
| PR     | #32                                         |
| Status | Merged                                      |

Repo touched: the root repo (`Database/`, `ARCHITECTURE.md`). No server code changed.

## What this revision does
Adds `Database/shops_schema.sql` (creates the `shops` database and its 10 tables) and `Database/shops_seed.example.sql` (template to register one shop).

## Why this revision exists
The `shops` database (the lookup database behind `Server/config/connection_store.js`) was lost and there is no backup of any kind. The only dump in the repo covers the per-shop main database `cooplubbers_test`.

## What changed
- `Database/shops_schema.sql`: Address, Information, Terms_And_Conditions, Shops, Job_Offer, Job_Application, Timeslots, Delivery_Location, Socials, Business_Hours, with the foreign keys the model associations define. Idempotent (`IF NOT EXISTS`, no drops).
- `Database/shops_seed.example.sql`: placeholders only, to be copied and filled in per shop.
- `ARCHITECTURE.md`: paragraph on the two kinds of databases.

## Implementation decisions
- The DDL was derived from the Sequelize models in `Server/store_models` (a throwaway script ran `sequelize.sync()` against a stubbed `query`, so nothing touched a database), then written out as plain SQL by hand so it is reviewable and runs without Node.
- Column types are what Sequelize generates (STRING = varchar(255), UUID = char(36)). The lost original may have used other types or lengths.
- `Shops.TAC_id` has no foreign key: the models do not declare one.
- Default collation of utf8mb4 (case-insensitive), not the `utf8_bin` of the main dump, so a domain lookup does not depend on letter case. Easy to change if the original was `_bin`.
- Paranoid models with `timestamps: false` (Shops, Socials) get no `deletedAt`: Sequelize ignores `paranoid` for them. Job_Offer and Job_Application do get `createdAt/updatedAt/deletedAt`.
- The seed is a template, not data: the shop rows, and above all each shop's `database_name/user/pw`, cannot be recovered from the repo.

## Architectural decisions
None beyond documenting that the schema script and the models must change together.

## Tests added
None. This is SQL only; the repo's rules forbid tests against a real database.

## Tests executed
- A throwaway script compared the tables and column names of the SQL against the DDL Sequelize generates from the models: 10 tables each, 0 differences.
- Ran `shops_schema.sql` twice in the local Podman MySQL 8.0 container (`cooplubbers_mysql`): exit 0 both times, 10 tables, 8 foreign keys. Ran the seed template inside a rolled-back transaction: the Shops-Information-Address join returned the row, nothing left behind. Not run against any real or production server.
- No Server/ServerNest code changed, so their checks were not run.

## Known limitations
- All data is lost: shops, credentials, opening hours, socials, delivery zipcodes, timeslots, job offers/applications, terms text. It must be re-entered (shop rows via the seed template).
- Types and collation are reconstructed, not original.
- The rebuilt database lives wherever you run the script; `docker-compose.yml` was not changed and does not create `shops`.

## Future work discovered
- Add the schema to `docker-compose.yml` (second init script) so local development has a `shops` database.
- Back up both kinds of databases on a schedule; this loss had no recovery path.
- The ServerNest rewrite has no store-site module yet; it will need this schema.

## Summary
The lost `shops` database can be recreated empty from `Database/shops_schema.sql`; shops are re-registered with the seed template. Column parity with the models is verified; execution on a real MySQL is not.
