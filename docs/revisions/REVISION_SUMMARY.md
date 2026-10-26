# Revision Summary

Chronological history of the project. One row per revision; details live in the linked revision documents.

| Revision                                        | Date       | Title                                | PR  | Status |
| ----------------------------------------------- | ---------- | ------------------------------------ | --- | ------ |
| [REV-001](REV-001-vue3-migration-spike.md)      | 2026-09-28 | Vue 3 migration spike (Client copy)  | None (review branch, not merged) | Implemented, not reviewed |
| [REV-002](REV-002-klant-dependency-upgrade.md)  | 2026-09-30 | Klant dependency upgrade            | #1 | Merged |
| [REV-003](REV-003-server-dependency-upgrade.md) | 2026-09-30 | Server dependency upgrade           | #2 | Merged |
| [REV-004](REV-004-server-remove-unused-deps.md) | 2026-09-30 | Server remove unused dependencies | #3 | Merged |
| [REV-005](REV-005-server-replace-request-nedb.md) | 2026-09-30 | Server replace request/nedb, fix cheerio | #4 | Merged |
| [REV-006](REV-006-server-pdfmake-receipt.md) | 2026-09-30 | Server replace html-pdf with pdfmake | #5 | Merged |
| [REV-007](REV-007-server-security-fixes.md) | 2026-09-30 | Server security fixes | #6 | Merged |
| [REV-008](REV-008-server-sql-escaping.md) | 2026-09-30 | Server escape remaining SQL | #7 | Merged |
| [REV-009](REV-009-server-config-folder.md) | 2026-09-30 | Server config folder in git | #8 | Merged |
| [REV-010](REV-010-untrack-env-files.md) | 2026-09-30 | Untrack .env files (Server, Klant) | #9 | Merged |
| [REV-011](REV-011-dedupe-auth-modules.md) | 2026-09-30 | Server dedupe auth modules | #10 | Merged |
| [REV-012](REV-012-config-tests.md) | 2026-09-30 | Server tests for priceCalculations and mailing | #11 | Merged |
| [REV-013](REV-013-fix-discount-pricing.md) | 2026-09-30 | Server fix discount pricing bugs | #12 | Merged |
| [REV-014](REV-014-escape-mail-html.md) | 2026-09-30 | Server escape HTML in mail templates | #13 | Merged |
| [REV-015](REV-015-podman-dev-database.md) | 2026-09-30 | Local dev database via Podman, stay on MySQL | #14 | Merged |
| [REV-016](REV-016-parity-harness.md) | 2026-09-30 | NestJS rewrite: parity harness (PR title says rev-015) | #15 | Merged |
| [REV-017](REV-017-harden-old-server.md) | 2026-09-30 | Harden the old server (access rules, crash guard) | #16 | Merged |
| [REV-018](REV-018-nest-scaffold.md) | 2026-09-30 | NestJS scaffold (ServerNest) | #17 | Merged |
| [REV-019](REV-019-nest-auth.md) | 2026-09-30 | NestJS authentication (login, tokens, access guard) | #18 | Merged |
| [REV-020](REV-020-nest-employee-nfc-login.md) | 2026-09-30 | Employee NFC card login (ServerNest) | #19 | Merged |
| [REV-021](REV-021-nest-reference-data.md) | 2026-09-30 | NestJS reference data (departments, roles, settings) | #20 | Merged |
| [REV-022](REV-022-nest-models.md) | 2026-09-30 | NestJS: all shop models (generated + drift test) | #21 | Merged |
| [REV-023](REV-023-nest-product-read.md) | 2026-09-30 | NestJS product read side (products, search, discounts) | #22 | Merged |
| [REV-024](REV-024-nest-mail.md) | 2026-09-30 | NestJS mail module (templates, sending) | #23 | Merged |
| [REV-025](REV-025-nest-customers.md) | 2026-09-30 | NestJS customers, favorites, addresses, shopping lists, cookies, feedback | #24 | Merged |
| [REV-026](REV-026-nest-orders.md) | 2026-10-01 | NestJS orders read side (list, single, count) | #25 | Merged |
| [REV-027](REV-027-nest-pricing.md) | 2026-10-01 | NestJS pricing (discount calculation) | #26 | Merged |
| [REV-028](REV-028-nest-order-create.md) | 2026-10-01 | NestJS order creation + first Mollie payment | #27 | Merged |
| [REV-029](REV-029-nest-mollie-webhook.md) | 2026-10-01 | NestJS Mollie webhook (order payments) | #28 | Merged |
| [REV-030](REV-030-nest-order-update.md) | 2026-10-01 | NestJS order update (picking, scanning, paying) | #29 | Merged |
| [REV-031](REV-031-nest-spaaractie.md) | 2026-10-01 | NestJS savings actions and stamp cards (+ image helper) | #30 | Merged |
| [REV-032](REV-032-nest-actie-orders.md) | 2026-10-01 | NestJS savings-action orders (stamps) | #31 | Merged |
| [REV-033](REV-033-shops-database-schema.md) | 2026-10-01 | Rebuild `shops` database schema (no backup existed) | #32 | Merged |
| [REV-034](REV-034-nest-users.md) | 2026-10-01 | NestJS employee management (users) | #33 | Merged |
| [REV-035](REV-035-nest-admin-writes-1.md) | 2026-10-01 | NestJS day totals, info import, discount image upload | #34 | Merged |
| [REV-036](REV-036-nest-product-writes.md) | 2026-10-01 | NestJS product maintenance (admin) | #35 | Merged |
| [REV-037](REV-037-nest-store-site.md) | 2026-10-01 | NestJS store site (/api/v2, shops database) | #36 | Merged |
| [REV-038](REV-038-nest-receipt.md) | 2026-10-01 | NestJS receipt PDF | #37 | Merged |
| [REV-039](REV-039-nest-hardening.md) | 2026-10-01 | NestJS hardening (rate limits, headers, CORS, proxy) | #38 | Merged |
| [REV-040](REV-040-nest-admin-app-compat.md) | 2026-10-01 | NestJS: compatibility with the admin app | #39 | Merged |
| [REV-041](REV-041-add-employees-app.md) | 2026-10-01 | Add the Employees app to the repository | #40 | Merged |
| [REV-042](REV-042-employees-dependency-upgrade.md) | 2026-10-01 | Employees dependency upgrade | #41 | Merged |
| [REV-043](REV-043-klant-datepicker-import.md) | 2026-10-01 | Klant datepicker import fix | #42 | Merged |
| [REV-044](REV-044-compose-shops-database.md) | 2026-10-01 | Create the `shops` database in the dev compose container | #43 | Merged |
| [REV-045](REV-045-klant-remove-dead-code-and-deps.md) | 2026-10-01 | Klant: remove Vue 2 leftovers and unused dependencies | #44 | Merged |
| [REV-046](REV-046-vue-apps-eslint.md) | 2026-10-01 | ESLint for Klant and Employees | #45 | Open |
| [REV-047](REV-047-klant-lint-fixes.md) | 2026-10-01 | Klant lint fixes | #46 | Merged |
| [REV-048](REV-048-ci-workflow.md) | 2026-10-01 | GitHub Actions CI | #47 | Merged |
| [REV-049](REV-049-local-install-rule.md) | 2026-10-01 | Use `npm install` locally, `npm ci` only in CI | #48 | Merged |
| [REV-050](REV-050-employees-lint-fixes.md) | 2026-10-01 | Employees lint fixes | #49 | Merged |
| [REV-051](REV-051-branch-cleanup-rule.md) | 2026-10-02 | Allow deleting merged feature branches | #50 | Merged |
| [REV-052](REV-052-klant-image-host.md) | 2026-10-02 | Klant loads images from the configured API host | #51 | Merged |
| [REV-053](REV-053-servernest-images-dir.md) | 2026-10-02 | ServerNest images folder from `IMAGES_DIR` | #52 | Merged |
