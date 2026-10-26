# REV-018 — NestJS scaffold (ServerNest)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-018-nest-scaffold`              |
| PR     | #17                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), new folder `ServerNest` |

## What this revision does
Creates `ServerNest/`, the empty NestJS (TypeScript) application the old Server will be rewritten into: tooling, configuration check, shop database connection and a health endpoint. No business endpoints yet.

## Why this revision exists
Second step of the approved rewrite (plan: build alongside, prove parity with `parity/`, cut over at the end).

## What changed
- `ServerNest/` (own `package.json`, own lockfile): NestJS 11 on Express 5, TypeScript 6 with `strict: true`, Jest + supertest, ESLint (typescript-eslint). Scripts: `build`, `start`, `start:dev`, `typecheck`, `lint`, `test`.
- `src/main.ts`: same body limits as the old server (10 MB JSON/urlencoded), CORS for every origin with the same methods/headers, product images at `/api/back-images/`, global `ValidationPipe` (permissive for now), global prefix `/api`.
- `src/config/env.validation.ts`: checks the environment at start-up (same variable names as the old server: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `TOKEN_KEY`, optional `PORT`, `ORDER_CRYPT_KEY`); a missing one stops the start with a clear message.
- `src/app.module.ts`: `@nestjs/config` and the shop database through `@nestjs/sequelize` (same database, timezone `+01:00`, `synchronize: false`: the app never creates or alters tables).
- `src/health/`: `GET /api/health` answers 200 `{status:'ok',database:'up'}` or 503 `{status:'error',database:'down'}`.
- `.env.example`, `.gitignore`, `README.md`; `ARCHITECTURE.md` gets a section "Server rewrite to NestJS".

## Implementation decisions
- **Nest 11, not Nest 12.** Nest 12 (current latest) is ESM-only: TypeScript reports the packages as ES modules and Jest could not load them under CommonJS. Using it means an ESM project (`"type": "module"`, `.js` suffixes in TypeScript imports, Jest ESM mode). Nest 11 is CommonJS and mature; moving up later is mechanical. Matching versions: `@nestjs/config` 4, `@nestjs/sequelize` 11, `@nestjs/cli` 11.
- **TypeScript 6.0.3**: `ts-jest` requires `<7`. `baseUrl` is not used (deprecated in TS 6); `rootDir` is explicit in `tsconfig.build.json`.
- **Install scripts reviewed (dependency policy), both denied:** `@parcel/watcher` (install: `node-gyp rebuild`, only builds from source when no prebuilt binary exists; the prebuilt `@parcel/watcher-win32-x64` is installed) and `unrs-resolver` (postinstall: fallback installer for platforms without a native binding; `@unrs/resolver-binding-win32-x64-msvc` is installed). Jest, ESLint and the build all work without them.
- The store-site database (`shops`, `/api/v2`) is not connected yet; it is added with its module. The shop database is the only connection now.
- Only the variables the scaffold needs are required; Mail, Mollie and `BASE_URL` are validated by the modules that use them.

## Architectural decisions
See `ARCHITECTURE.md` ("Server rewrite to NestJS"): NestJS 11, strict TypeScript, Sequelize on the existing schema, wire format unchanged, parity harness as the acceptance test.

## Tests added
- `src/config/env.validation.spec.ts` (8 tests): defaults, PORT and ORDER_CRYPT_KEY, every missing variable named, empty string counts as missing, invalid ports.
- `test/health.e2e-spec.ts` (2 tests): `GET /api/health` answers 200 when the (fake) database connection works and 503 when it fails.

## Tests executed
- `npm run typecheck`, `npm run lint`: clean. `npm test`: 2 suites, 10 tests pass. `npm run build`: compiles to `dist/`.
- Start-up without environment variables fails with "Missing environment variables: DB_HOST, DB_USER, DB_PASS, DB_NAME, TOKEN_KEY (see .env.example)".
- Smoke test: the built server started through `parity/start-server.js` against the Podman test database (`cooplubbers_test`, safe environment): `GET /api/health` 200 `{"status":"ok","database":"up"}`; CORS preflight answers 204 with `Access-Control-Allow-Origin: *`, methods and headers identical to the old server; an unknown route answers 404.
- Not run: the 503 case against a really unreachable database (covered with a fake connection only); old Server tests are unchanged (62/62 before this revision, not affected).

## Known limitations
- No business endpoints: the parity harness reports every old endpoint as different until modules land.
- `ValidationPipe` is permissive (`whitelist: false`); modules tighten their DTOs.
- No CI workflow exists; adding a GitHub Action for `ServerNest` (typecheck, lint, test, build) is a good next small revision.

## Future work discovered
- CI workflow; a `Dockerfile`/deployment story at cutover time; connect the `shops` database with the store-site module.

## Summary
`ServerNest/` exists, builds, is tested and talks to the test database; modules can now be added one by one and compared with the old server.
