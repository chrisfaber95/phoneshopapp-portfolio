# REV-003 — Server dependency upgrade

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-003-server-dependency-upgrade`  |
| PR     | #2                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does

Upgrades every outdated `Server` dependency (per `npm outdated`) to its latest release and fixes the code the upgrades break.

## Why this revision exists

Requested: bring the server's plugins up to date. `npm ci` also failed on Node 24 (canvas 2.x has no prebuilt binary and cannot build).

## What changed

- `package.json` / `package-lock.json`: all 29 dependencies at latest. Majors: express 4→5, @mollie/api-client 3→4, multer 1→2, sharp 0.32→0.35, nodemailer 6→10, dotenv 8→18, jsonwebtoken 8→9, mysql2 2→3, fast-csv 3→5, bcryptjs 2→3, bwip-js 2→4, canvas 2→3, chart.js 2→4, jwt-decode 3→4, nodemon 1→3 (dev), vue-js-modal 1→2. `sequelize` stays on 6.37.8 (latest stable; v7 is pre-release).
- `routes/mollie/webhook.js`, `routes/mollie/actiewebhook.js`, `routes/site/webhook.js`: Mollie v4 removed `payment.isPaid()` / `payment.isOpen()` → `payment.status === 'paid'` / `payment.status !== 'open'`.
- `routes/middleware/express_compat.js` (new), registered in `index.js` after the body parsers: restores Express 4 behaviour the routes depend on (see decisions).
- `tests/express_compat.test.js` (new) and `npm test` now runs `node --test tests/*.test.js`.
- `allowScripts`: `phantomjs-prebuilt@2.1.16` approved, `canvas` denied (see below).

## Implementation decisions

- Express 5: (1) `req.query` is now a getter that re-parses on each access, so the routes that `delete req.query.customer_id` before passing `req.query` as a Sequelize `where` (product, favorites, discounts, ...) would have silently leaked those keys into the filter. The middleware pins `req.query` per request. (2) Default query parser became `simple`; set back to `extended`. (3) `req.body` is `undefined` when there is no body; defaulted to `{}`. No wildcard/regex route paths exist, so path-to-regexp 8 needed no changes.
- Checked and unchanged: Mollie `createMollieClient`, `payments.create/get`, `_links.checkout.href`; bwip-js `toBuffer` callback form (still supported); sharp `resize/composite/toBuffer`; multer `diskStorage`/`fileFilter`/`limits`; nodemailer `createTransport`/CID attachments; bcryptjs `genSaltSync/hash/compare`; jsonwebtoken `sign/verify` with string secret; cryptr; qrcode.
- Install script review: `phantomjs-prebuilt` (install: downloads the PhantomJS binary) approved, required by `html-pdf` for receipt PDFs (`routes/order/receipt.js`); `canvas` (install: `prebuild-install || node-gyp rebuild`) denied, it is not used by any server code.

## Architectural decisions

None. The compat shim is a temporary bridge and can be removed once the routes stop mutating `req.query` and reading `req.body` unguarded.

## Tests added

`tests/express_compat.test.js` (node:test, no new dependency): deleting a query key persists; nested query strings parse; `req.body` defaults to `{}`.

## Tests executed

- `npm test` in `Server`: 3/3 pass.
- `npm outdated`: empty after the upgrade.
- Scratch copy of `Server` with stubbed `config/*` (the `config/` folder is not in the repo): required all 161 files under routes, store_routes, models, store_models with no load errors; booted the real `index.js` and confirmed query/body behaviour over HTTP; exercised bcryptjs, jsonwebtoken, bwip-js, sharp, cryptr, qrcode, nodemailer (JSON transport), the Mollie client constructor, and html-pdf (PDF generated).
- Not run: real DB, live Mollie, real mail, multer upload, fast-csv (only imported, unused); no lint/format/typecheck configured; no CI workflow exists in the repo.

## Known limitations

- The Mollie webhooks and the order flow were not exercised against Mollie (test mode) or a database; only the API surface was checked against the v4 typings/source.
- `npm audit` still reports ~49 vulnerabilities, from deprecated transitive packages (`html-pdf`/`phantomjs-prebuilt`, `request`/`request-promise`, `nedb`). Not fixable by upgrading: those packages have no newer versions.
- dotenv 18 prints an "injected env" line on every `config()` call.

## Future work discovered

- `Server/config/` (logging, connection, connection_store, mailing, authentication, customer_authentication, price, priceCalculations) is required everywhere but not in the repo, so a clean checkout cannot start.
- Unused dependencies: canvas, chart.js, cors, lodash, jwt-decode, express-fileupload, vue-chart, vue-js-modal (and `mysql2` only as the Sequelize driver).
- Undeclared dependencies: `moment` and `valid-url` are required but not in `package.json`; `body-parser` only arrives transitively via express.
- `cheerio` is used as `$(selector, html)` (old 0.x API) in `routes/product/scanner.js` and `routes/site/site.js`; that does not work with cheerio 1.x (pre-existing).
- Replace `request`/`request-promise` (deprecated) with fetch, and `html-pdf` (PhantomJS, dead) with a maintained renderer.
- Secrets are hardcoded (`cryptr` key, a Mollie test key in `routes/mollie/index.js`).

## Summary

All Server dependencies are on their latest versions; Mollie v4 and Express 5 breakages are fixed and covered by the first automated server tests.
