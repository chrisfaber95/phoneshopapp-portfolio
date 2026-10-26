# Test Locally

Part of the [revision workflow](../WORKFLOW.md).

### Step 5 — Test locally

Before creating a Pull Request:

- Run formatting checks.
- Run linting if configured.
- Run unit tests.
- Run integration tests if applicable.
- Run the production/build check.
- Perform any relevant application smoke test.

Do not create a PR when known tests are failing.

If a test failure is unrelated to the current revision, investigate it and document it rather than silently ignoring it.

#### Local dependencies and test speed

The repository has two separate npm packages and no root `package.json`. Run commands from the package's own folder: `Klant` (client) or `Server` (server).

Rules:

- Reinstall only when that package's `package.json` or `package-lock.json` changed, then run `npm install` in that folder. Do not use `npm ci` locally: it deletes `node_modules` and reinstalls everything, which takes many minutes on Windows. `npm ci` is for CI only. If the install is still slow, do not wait on it: push and let CI run the checks.
- Client checks: `npm run lint` and `npm run build`. Cypress end-to-end specs live in `tests/e2e/specs`; run them with `npm run test:e2e` when the change affects them.
- Server checks: `npm test` is still the npm placeholder and runs no tests. Any server logic you change or add needs a test added in that revision, and the revision document must say how it is run. Never present the placeholder as a passing test run.
- `ServerNest` (the NestJS rewrite, its own npm package) has real checks: `npm run typecheck`, `npm run lint`, `npm test` (Jest, no real database/Mollie/mail) and `npm run build`. Run all four for any change there. Parity against the old server: see `parity/README.md`.
- `Klant` and `Server` have no formatter or typecheck configured. Do not report those checks as run.
- Smoke test: start the server with `npm start` (or `npx nodemon index.js`) and the client with `npm run serve`, against a test database and Mollie test mode, never the live shop.
- CI runs the same checks on every PR (`.github/workflows/ci.yml`), but run them locally first; CI is a second check, not a replacement.
- Before creating a PR, run every check that exists for the packages you touched and list exactly which ones ran.
