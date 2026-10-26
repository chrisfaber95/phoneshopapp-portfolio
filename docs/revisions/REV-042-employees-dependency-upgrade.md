# REV-042 — Employees dependency upgrade

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-042-employees-dependency-upgrade` |
| PR     | #41                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folder `Employees` (worked in a git worktree) |

## What this revision does
Brings the employee app up to date so that it builds at all: it was on Vue CLI 4.5 / webpack 4 with `node-sass` 6 (cannot be installed on a current Node), and its `package.json` was incomplete (six imported packages were not listed).

## What changed
- `package.json`/`package-lock.json` rewritten the way `Klant` was upgraded in REV-002: Vue CLI 5 (webpack 5), `sass` + `sass-loader` instead of `node-sass`, `vue` 3.5, `vue-router` 5, `vuex` 4.1, `axios` 1.20, `jquery` 4, `luxon` 3, `jwt-decode` 4, `chart.js` 4 / `vue-chartjs` 5 / `vue-chart-3` 4, and the rest at their latest releases.
- **Added the imported packages that were missing from the old `package.json`:** `@zxing/library`, `html5-qrcode`, `vue-datetime`, `vue-d3-charts`, `chart.js`, `vue-chartjs`.
- **Removed the 14 packages nothing imports:** `fs` (an empty placeholder package), `node-sass`, `vee-validate`, `vue-js-modal`, `vue-meta`, `weekstart`, `phonegap-nfc`, `debounce`, `font-awesome`, `@fortawesome/fontawesome-free`, `chartjs-adapter-luxon`, the Vue CLI 4 plugins and the old ESLint packages (the app has no lint script now, like Klant).
- `vue3-date-time-picker` 2.8.3 is published without its `dist` folder (it cannot be imported any more); it is replaced by its successor `@vuepic/vue-datepicker` (8 files; the app only uses `v-model` and `format`). Version 14 has no default export, so it is imported as `{ VueDatePicker as Datepicker }`.
- `jwt-decode` 4 has no default export: `import { jwtDecode as jwt_decode }`.
- `vue.config.js`: `disableHostCheck` (webpack-dev-server 3) became `allowedHosts: 'all'`.
- `Employees/.gitignore` ignores `dist/`.
- `allowScripts`: reviewed the 4 install scripts and denied all, as in REV-002 (`core-js` prints a funding banner, `@parcel/watcher` only builds from source on request, `vue-demi` picks the Vue 2/3 entry, `vue3-date-time-picker` no longer installed). `vue-datetime` needs `--legacy-peer-deps` to install (it asks for luxon 1; it is a legacy library used in two screens).

## Compatibility with the new server
axios 1.x serialises the order list filters as `0[0][filterType]=and&0[0][value][0][status]=...`. Checked that it parses into the same filter structure as the JSON text axios 0.x sent (the server accepts both since REV-040).

## Tests executed
- `npm run build` (production build): **passes** (6 JS chunks, 28 MB `dist`), only Sass `@import` deprecation warnings (the same code style as Klant). The build had two real errors that the upgrade exposed and that are fixed above (the datepicker and jwt-decode imports).
- `vue-cli-service serve` starts (configuration valid; webpack-dev-server warns that `https` is deprecated, as in Klant).
- **Not verified:** the app in a browser (there is no browser or test suite here). The app still contains Vue 2 era libraries (`vue-slick`, `vue-barcode`, `vue-datetime`, `vue-d3-charts`, `vue-qrcode-reader`'s old API, the `Line`/`mixins` API of `vue-chartjs` 2 in `Sellcharts.vue`, and `b-form-input` BootstrapVue tags in two screens). They bundle, but the screens that use them can fail at runtime under Vue 3, exactly as before the upgrade. A click-through of the scanner, checkout, accounts and statistics screens is needed.

## Known limitations
The Employees app has no automated tests.

## Summary
The employee app builds again on a current toolchain, its dependency list is complete and clean, and its API calls match what the new server accepts.
