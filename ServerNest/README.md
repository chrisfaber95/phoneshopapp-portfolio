# ServerNest

NestJS (TypeScript) rewrite of the ShopApp `Server`. Built alongside the old server; see `../ARCHITECTURE.md` (section "Server rewrite to NestJS") and `../parity/README.md`.

## Commands (run in this folder)
| Command | What |
|---|---|
| `npm install` | install (install scripts are reviewed, see `allowScripts` in `package.json`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Jest: unit tests (`src/**/*.spec.ts`) and e2e tests (`test/*.e2e-spec.ts`); no real database, Mollie or mail |
| `npm run build` | compile to `dist/` |
| `npm start` | run the build (`node dist/main`) |
| `npm run start:dev` | build and restart on changes |

## Configuration
Copy `.env.example` to `.env` (git-ignored). The variable names are the same as the old server's. Missing required variables stop the start-up with a clear message.

## Running it next to the old server (parity checks)
```
node ../parity/start-server.js --dir ServerNest --port 3102 --cmd "node dist/main"
```
starts it against the disposable test database with dummy Mollie/mail settings (never the live `.env`). Then `GET http://127.0.0.1:3102/api/health`.

## Layout
```
src/main.ts                  bootstrap: body limits, CORS, static images, validation, /api prefix
src/app.module.ts            config + shop database + modules
src/config/env.validation.ts environment check
src/health/                  GET /api/health (database reachable?)
src/auth/                    tokens, passwords, order-id encryption, access rules + guard, user/customer login
src/database/models/         Sequelize models of the shop database (same attributes as ../Server/models)
test/                        e2e tests with fake services / a fake database connection
```
Modules are added under `src/<module>/` (controller, service, DTOs, models) one revision at a time.
