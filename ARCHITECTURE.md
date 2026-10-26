# Architecture

This document describes the architecture of the webshop (Vue 2 client and Express/MySQL server) and records the decisions behind it. Sections are marked **Implemented** or **Planned (REV-XXX)** so the document never claims more than the code does.

## Goals and constraints

## Database

**Implemented.** MySQL 8, accessed via Sequelize (`Server/config/connection.js`), with a `mysql2` driver.

Local development runs MySQL in a container via the root-level `docker-compose.yml`, seeded from `Database/Dump20240103 (3).sql` (main database) and `Database/shops_schema.sql` (empty `shops` database). Init scripts only run on an empty volume; for an existing container run the schema script once with `mysql`. Container engine is Podman (rootless, no paid-license concerns for a solo/small-team project); the compose file is engine-agnostic and also works with Docker.

The server uses two kinds of databases: one `shops` lookup database (`Server/config/connection_store.js`, models in `Server/store_models`) that holds each shop's details, opening hours, job offers and the credentials of that shop's own main database, and one main database per shop (`Server/config/connection.js`). The `shops` database was lost without a backup and rebuilt in REV-033: its schema is `Database/shops_schema.sql`, a template to register a shop is `Database/shops_seed.example.sql`. The schema script is derived from the Sequelize models, so change both together.

Staying on MySQL was a deliberate choice, not an oversight: the target scale (10,000+ products, 3,000 users) is well within what MySQL/InnoDB handles without tuning, and switching engines now would mean rewriting all 38 tables and every Sequelize query for no measured benefit. Per `docs/ENGINEERING_RULES.md`, infrastructure is only made replaceable where that gives a concrete benefit. If a specific performance problem is ever measured, the schema's `char(36)` UUID primary keys (fragmented InnoDB clustered index) are the first thing to look at before considering a different engine.

## Server rewrite to NestJS

**In progress (REV-016 onwards).** The Express `Server/` is being rewritten as a NestJS (TypeScript) application in `ServerNest/`, built alongside the old server and cut over at the end. The old server stays the production server until the cutover revision, then `Server/` is removed and `ServerNest/` is renamed to `Server/`.

- **Framework:** NestJS 11 (CommonJS, Express 5 platform), TypeScript with `strict: true`, Jest for tests, ESLint. Nest 12 is ESM-only and was not chosen (REV-018): it needs an ESM project setup that adds friction without benefit for this migration; moving up later is a mechanical step.
- **Persistence:** the existing MySQL schema through `@nestjs/sequelize` (Sequelize 6), so no data migration. Models map 1:1 to `Server/models`. `synchronize` is off: the application never creates or alters tables.
- **Wire format is kept:** same URLs (`/api/v1/...`, `/api/v2/...`, images under `/api/back-images/`), same response shapes, same JWT payload and `TOKEN_KEY`, same encrypted order ids, so the Klant client and links in e-mails keep working.
- **Parity:** `parity/` runs the old and the new server against the same disposable test database and compares responses (see `parity/README.md`). A module is done when its endpoints pass that comparison or every difference is documented.
- **Status:** scaffold (`GET /api/health`) and authentication (REV-019: employee and customer login, tokens, the access rules as a global guard). Modules follow one per revision (reference data, products and pricing, customers, orders, payments, spaaractie, store site).
