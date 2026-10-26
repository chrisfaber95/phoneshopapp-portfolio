# REV-002 — Klant dependency upgrade

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-002-klant-dependency-upgrade`   |
| PR     | #1                                           |
| Status | Merged (squash, branch kept)                 |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Klant` |

## What this revision does

Upgrades every outdated `Klant` dependency (per `npm outdated`) to its latest release, removes the obsolete `vue-cli-plugin-vue-next`, and fixes the code that the upgrades broke.

## Why this revision exists

Requested: bring the client's plugins up to date. On `main` the production build was already failing (a stale webpack 4 install hoisted by the old Vue-next plugin, then `https` not resolving under webpack 5).

## What changed

- `package.json`: 31 packages bumped to latest; `vue-cli-plugin-vue-next` removed (Vue CLI 5 prints that it is no longer needed). Notable majors: axios 0.27→1.20, jquery 3→4, vue-router 4→5, luxon 1→3, jwt-decode 3→4, @vuepic/vue-datepicker 3→14, sass-loader 10→17, swiper 8→14, pdfjs-dist 3→6, bcryptjs 2→3, @zxing/library 0.19→0.23, @zxing/browser 0.1→0.2, vue3-touch-events 4→5, vue3-datepicker 0.3→0.4, vue3-carousel 0.1→0.17, weekstart 1→2, vue 3.2→3.5.
- `package-lock.json` regenerated from scratch.
- `src/assets/scripts/auth/index.js`: jwt-decode 4 has no default export → `import { jwtDecode as jwt_decode }`.
- `src/assets/scripts/http-common.js`: removed `import https from 'https'` and the `httpsAgent` option. Node's `https` is not available in the browser bundle under webpack 5 and axios's browser adapter ignores `httpsAgent`, so it had no effect.
- `allowScripts` in `package.json`: reviewed the 5 pending install scripts and denied all (see below).

## Implementation decisions

- Went straight to latest majors as requested. Code usage checked in `src`: luxon (`DateTime`, `Info`), jquery (`$` selectors), vue-router (`createRouter`, `useRoute`), the datepicker props (`format`, `enable-time-picker`, `min-date`) and zxing named imports are all still valid in the new majors; only jwt-decode needed a code change.
- Install script review (all denied, build works without them):
  - `core-js` postinstall: prints a funding banner.
  - `vue3-date-time-picker` postinstall: logs a deprecation message.
  - `sharp` install: checks for global libvips; prebuilt binaries come from optional dependencies.
  - `vue-demi` postinstall: picks the Vue 2/3 entry; not needed for Vue 3 default.
  - `@parcel/watcher` install: only runs `node-gyp` when `build_from_source=true`.

## Architectural decisions

None.

## Tests added

None. The client has no unit tests; Cypress specs exist but were not run.

## Tests executed

- `npm install` clean (no lockfile, no node_modules): OK.
- `npm run build`: passes ("Build complete"). 79 warnings, all Sass `@import` deprecation (pre-existing, not addressed).
- `npm run lint`: NOT run — the `lint` script fails with `command "lint" does not exist` (no `@vue/cli-plugin-eslint` installed). Pre-existing.
- Cypress e2e and a browser smoke test against the API: NOT run.

## Known limitations

- Runtime behaviour of the new majors (datepicker 14 on Order/Register, jquery 4, axios 1, touch events 5, barcode scanners) is verified by build only, not in a browser. Needs a manual smoke test.
- Vue Router 5 and Datepicker 14 changed a lot internally; regressions would show only at runtime.
- 25 `npm audit` findings remain (largely transitive, in Vue CLI 5 / build tooling); not addressed.

## Future work discovered

- Remove unused dependencies (no imports in `src`: bcryptjs, sequelize, swiper, pdfjs-dist, weekstart, zxing, quagga, vue-meta, several cookie/lazy/datepicker libraries) — separate revision.
- Add `@vue/cli-plugin-eslint` so `npm run lint` works.
- Migrate Sass `@import` to `@use`.
- `vue3-date-time-picker` is deprecated (moved to `@vuepic/vue-datepicker`).

## Summary

All outdated Klant dependencies are at their latest versions; the production build, which was broken on main, now passes. Two small source fixes were required (jwt-decode import, removal of the Node-only https agent).
