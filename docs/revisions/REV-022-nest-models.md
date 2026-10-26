# REV-022 — All shop models for the NestJS server (generated, with a drift test)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-022-nest-models`                |
| PR     | #21                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Adds TypeScript models for all 35 tables of the shop database to `ServerNest`, generated from the old Server's Sequelize definitions, plus a test that keeps them identical to the old ones.

## Why this revision exists
Every remaining module (products, customers, orders, payments, spaaractie) needs a large, interconnected set of models (the product list alone includes ~14). Writing 35 models with ~75 associations by hand would be slow and error-prone, so they are generated from the definitions that already work, and verified against them.

## What changed
- `tools/generate-models.js`: loads the old models (no database connection, safe environment) and writes `src/database/models/*.model.ts` and `index.ts`: table options (`tableName`, `paranoid`, `timestamps`), every attribute (column name, type including lengths and `DECIMAL(10,2)`, primary/auto-increment/not-null, defaults incl. UUID and `NOW`), default scopes (including the `Discounts` scope that includes its discount type) and all associations with their foreign/target/source keys and aliases. The files are generated once and maintained by hand afterwards (header in every file); the tool stays until the cutover.
- The six models written by hand earlier (User, Userrole, Customer, CustomerSettings, CustomerInformation, Department) are replaced by generated ones; `Customer.klantenkaart` keeps its card-number default through a small override.
- `AppModule` registers all models on the connection (`models: SHOP_MODELS`): the associations need every model to exist (found by starting the server).
- `test/models-parity.spec.ts`: compares every generated model with the old Server's model (table, paranoid, timestamps, every column with field/type/primary key/null, every association with type, foreign key and target table). It found one generator gap at once (primary keys lost their explicit `allowNull: false`), fixed.
- `tsconfig.json`: `isolatedModules` and `rootDir` (asked for by ts-jest with TypeScript 6); `eslint.config.mjs` ignores the JavaScript tool.

## Implementation decisions
- Class names follow the old export names (`Productinformation` stays, `Terms_And_Conditions` becomes `TermsAndConditions`, `actieOrderProductHasVariant` becomes `ActieOrderProductHasVariant`).
- `DECIMAL` columns are typed `string` (mysql2 returns decimals as text); `DATE` is `Date`, `DATEONLY`/`TIME`/`UUID` are `string`.
- Two defaults are not generated and are ported by the modules that need them: `Order.invoice_number` (an async function that counts today's orders; Sequelize never awaited it in the old server, so it is checked in the orders module) and `Terms_And_Conditions.TAC_id` (a data type used as a default).

## Architectural decisions
Models are data definitions only; business rules stay in services. Models live in one folder because their associations are circular.

## Tests added
`test/models-parity.spec.ts` (2 tests). Total 14 suites, 140 tests.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (140/140), `npm run build`: clean.
- The server starts with all models and associations against the Podman test database.
- Parity (`node parity/check.js --spec auth,reference-data`): auth 12/12 and reference-data 18/18 identical to the old server with the regenerated models (login loads user role, customer settings and addresses through the generated associations).
- Not run: queries on the other 29 tables (their modules follow and are checked by parity one by one).

## Known limitations
The store-site models (`store_models`, database `shops`) are not part of this set; they come with the store-site module.

## Future work discovered
`Order.invoice_number` default (orders module); remove `tools/generate-models.js` and the drift test at the cutover, when the old Server and its models are deleted.

## Summary
All 35 shop tables are modelled in TypeScript, provably identical to the old definitions, so the remaining modules can start from working models.
