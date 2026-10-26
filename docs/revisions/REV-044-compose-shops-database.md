# REV-044 — Create the `shops` database in the dev compose container

| Field  | Value                                      |
| ------ | ------------------------------------------ |
| Date   | 2026-10-01                                 |
| Branch | `feature/rev-044-compose-shops-database`   |
| PR     | #43                                        |
| Status | Merged                                     |

Repo touched: root repo (`docker-compose.yml`, `ARCHITECTURE.md`). Follow-up to REV-033.

## What this revision does
Mounts `Database/shops_schema.sql` as a second init script in the compose MySQL container.

## Why this revision exists
REV-033 rebuilt the `shops` schema, but a fresh dev container only created the main database.

## What changed
- `docker-compose.yml`: one extra volume line (`shops_schema.sql` -> `/docker-entrypoint-initdb.d/shops.sql`).
- `ARCHITECTURE.md`: sentence on the two init scripts and that they only run on an empty volume.

## Implementation decisions
The schema script is independent of the main dump and idempotent, so init order does not matter.

## Architectural decisions
None.

## Tests added
None (infrastructure config).

## Tests executed
Started a throwaway `mysql:8.0` container (port 3307, no volume) with the same two init mounts: both scripts ran, `shops` had 10 tables, `cooplubbers_test` 38, no errors. Container removed afterwards. `docker-compose.yml` itself was not run through compose (no compose tool used); the existing `cooplubbers_mysql` container was not touched.

## Known limitations
The existing running container keeps its old volume, so it gets no automatic `shops` (it was created by hand in REV-033). A volume reset would also wipe the main database, so it was not done.

## Future work discovered
Scheduled backups of both kinds of databases.

## Summary
New dev containers start with an empty `shops` database next to the main one.
