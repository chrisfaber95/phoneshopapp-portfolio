# REV-021 — NestJS reference data (departments, user roles, settings, root routes)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-021-nest-reference-data`        |
| PR     | #20                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds the small lookup endpoints to the NestJS server: `GET /api/v1` and `/api/v2` ("Connected"), departments, user roles and settings. First module with a full controller, service and model slice, and the first module to use the parity harness for GET/PUT/POST/DELETE with tokens.

## Why this revision exists
Third step of the rewrite (plan order: reference data before products, customers, orders).

## What changed
- `src/reference-data/`: `RootV1Controller` / `RootV2Controller`, `DepartmentsController` + `DepartmentsService`, `UserrolesController`, `SettingsController`, `ReferenceDataModule`.
- `src/database/models/department.model.ts` (same attributes as `Server/models/department.js`).
- `src/common/query-filter.ts` (`whereFromQuery`): the old routes passed the whole query string to Sequelize (`where: req.query`); this keeps `?column=value` and `?column[]=a&column[]=b`, but only for real columns and plain text values (anything else answers 400; the old server ran an invalid query and never answered).
- `src/main.ts`: `app.set('query parser', 'extended')`, as in the old server (Express 5 defaults to the simple parser, which broke `?department_id[]=1&...`; found by the parity run).
- Endpoints: `GET /api/v1/departments` (filterable), `DELETE /api/v1/departments?department_id=` (employees; answers the number of deleted rows as a bare JSON number, failures `{ err }` with HTTP 200 like the old server), `GET /departments/single/:id`, `POST /departments/post`, `PUT /departments/update/:id` (placeholders that answer the JSON string `"No"`, exactly as before), `GET /api/v1/userroles` (filterable, employees), `GET /api/v1/settings/rights` and `/language`.
- `parity/check.js` (new): one command that builds, loads fixtures, starts both servers, runs specs and cleans up; `run.js` gets `--spec-only` and `{{token:employee}}` / `{{token:customer}}` placeholders for headers; `parity/specs/reference-data.json`.

## Implementation decisions
- `settings/rights`: the old route read a table `Userroles` that does not exist (the table is `Userrole`), so it never answered; it now returns the user roles, which is what the query was after. `settings/language` read `bollegraafdb.Language` (a database of an older project); it answers an empty list.
- `GET /api/v1/info` and `POST /api/v1/info/post` (product information) move to the products module, where their model lives.
- The department stubs are kept rather than invented; see the hardening backlog.

## Architectural decisions
`whereFromQuery` is the shared way to do the old "filter by query string" lists in later modules (product, orders, ...), with a column whitelist.

## Tests added
`ServerNest`: 13 suites, 138 tests in total (23 new): `query-filter.spec` (filters, lists, ignored keys, unknown column, non-text values), `departments.service.spec` (list, delete, non-numeric ids never reach the database, database refusal), `test/reference-data.e2e-spec` (root messages, list with filter, delete answer, the `"No"` placeholders with JSON content type, userroles 400, settings).

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test`: clean, 138/138.
- Parity (`node parity/check.js --spec auth,reference-data`), old vs new on the Podman test database: `reference-data` 18 requests, 18 same, 0 different (roots, departments with no filter / visible / id / id list / no match, the three placeholders with and without token, DELETE of an unknown id with employee / no / customer token, userroles with employee / filter / no token / customer token). The first run had 1 difference (the id list), caused by the query parser; fixed, re-run 18/18. `auth` still 12/12.
- Not run: `settings/*` against the old server (it crashes or never answers there), a DELETE of a real department (the test database is shared; covered by unit tests).

## Known limitations
- An invalid or missing `department_id` on DELETE answers `{ err: 'department_id must be a number' }` (the old server answered its raw Sequelize error object).
- Unknown filter columns answer 400 instead of hanging.

## Future work discovered
See `docs/FUTURE_HARDENING.md` (placeholder department routes, language setting).

## Summary
The first lookup module runs on the new server with identical answers, and the parity check is now a single command.
