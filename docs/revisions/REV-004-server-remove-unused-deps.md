# REV-004 — Server: remove unused dependencies

| Field  | Value                                            |
| ------ | ------------------------------------------------ |
| Date   | 2026-09-30                                       |
| Branch | `feature/rev-004-server-remove-unused-deps`      |
| PR     | #3                                           |
| Status | Merged (squash)                                  |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Removes Server dependencies that no server file requires, removes the unused imports behind them, and declares the two packages that were required but undeclared.

## Why this revision exists
First step of the "replace deprecated / clean up" work. Fewer packages means a smaller attack surface and no native `canvas` build.

## What changed
- Removed from `package.json`: `canvas`, `chart.js`, `vue-chart`, `vue-js-modal` (client-side libraries), `jwt-decode`, `lodash`, `express-fileupload`, `cors` (CORS is set by a hand-written middleware in `index.js`), `fast-csv`. Dropped the `"canvas": false` `allowScripts` entry.
- Added `moment` and `body-parser` to `dependencies` (required in `index.js` and ~30 route files but never declared; `body-parser` only arrived via express).
- `index.js`: removed the unused `moment`, `multer`, `fast-csv` and `mysql` requires. `https`, `fs`, `path` are kept because the commented-out TLS block uses them.
- `routes/discounts/get_images.js`: removed the unused `request` require.
- `package-lock.json` updated.

## Implementation decisions
- Verified with a search of `index.js`, `routes`, `store_routes`, `models`, `store_models` that nothing requires the removed packages.
- `mysql` and `mysql2` are kept: `Server/config/` is not in the repo, so whether `config/connection*.js` needs them cannot be checked.
- `valid-url` was never in `package.json` (only mentioned in a comment), nothing to do.

## Architectural decisions
None.

## Tests added
None (no server logic changed).

## Tests executed
- `npm test`: 3/3 pass.
- `npm outdated`: empty; `npm ls`: no missing/extraneous.
- `npm approve-scripts --allow-scripts-pending`: no unreviewed scripts.
- Scratch copy with stubbed `config/*`: all route/model files load, real `index.js` boots and answers requests.
- No lint/format/typecheck configured; no CI workflow exists.

## Known limitations
Cannot confirm that the untracked `config/` files don't use a removed package (none of the removed ones is a typical config dependency; `lodash` or `cors` would be the likeliest). If `npm start` fails with "Cannot find module", re-add it.

## Future work discovered
Still to do in later revisions: `request`/`request-promise`, `nedb`, `html-pdf`, security fixes, and deciding whether `mysql` can go.

## Summary
Nine unused packages removed, two undeclared ones declared, no behaviour change.
