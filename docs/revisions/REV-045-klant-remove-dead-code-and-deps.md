# REV-045 — Klant: remove Vue 2 leftovers and unused dependencies

| Field  | Value                                                  |
| ------ | ------------------------------------------------------ |
| Date   | 2026-10-01                                             |
| Branch | `feature/rev-045-klant-remove-dead-code-and-deps`      |
| PR     | #44 |
| Status | Merged |
| Repo   | ShopApp git repo, folder `Klant` (plus these docs)     |

## What this revision does
First step of moving Klant to TypeScript, SCSS and Vite (the plan was agreed with the user; Klant is already on Vue 3). It removes dead Vue 2 code and unused dependencies so the later revisions start from a clean base.

## Why this revision exists
Klant was ported to Vue 3 earlier, but left behind Vue 2 packages and code that no longer work or are not used. They would get in the way of the Vite and TypeScript revisions.

## What changed
- Removed the unused `import Vue from 'vue'` (Vue 3 has no default export) from `src/assets/actiecart/index.js`, `src/assets/cart/index.js`, `src/assets/groceryList/index.js`, `src/assets/receipt/index.js` and `src/store/location.js`, and from `src/main.js`.
- `src/main.js`: removed the `VueMeta` symbol, the `useToasted()` helper that nothing imports, and `.use(VueMeta)` (a bare Symbol is not a plugin).
- Deleted `src/store/index-backup.js` (nothing imports it).
- Removed 10 dependencies with zero imports in `src`, `public` and the build config: `bcryptjs`, `sequelize`, `vue-barcode-reader`, `vue-barcode-scanner`, `vue-cookie-comply`, `vue-cookie-law`, `vue-lazyload`, `vue-meta`, `vue-sweetalert2`, `vue-toggle-component`.
- Added `moment` (`^2.31.0`) and `validator` (`^13.15.35`) as explicit dependencies, see below.

## Implementation decisions
- Removing `sequelize` broke the build: `Timepicker.vue` imports `moment` and `ActieOrder.vue`/`Order.vue` import `validator`, and both had only been installed transitively through `sequelize`. They are now declared at the versions that were already installed, so runtime behavior does not change.
- `npm install --ignore-scripts` was used. `moment` and `validator` have no install scripts, and no package with an install script was added or upgraded, so `allowScripts` is unchanged.
- `@chenfengyuan/vue-barcode` was kept: four files import it.

## Architectural decisions
None.

## Tests added
None. This revision removes unused code and dependencies; Klant has no unit-test setup yet (planned in a later revision).

## Tests executed
- `npm run build` in `Klant`: failed after removing `sequelize` (missing `moment`, `validator`), passes after declaring them (build complete).
- `npm run lint`: not run, the script does not work (`vue-cli-service` reports that the `lint` command does not exist, no ESLint plugin is installed).
- Not verified in a browser.

## Known limitations
The repo has no CI workflow, so no CI check ran.

## Future work discovered
- `src/App.vue` imports `startOfDecade` from `date-fns` and `ReceiptPDF.vue` imports `html-pdf`; neither is in `package.json`. `date-fns` resolves through `@vuepic/vue-datepicker`; `html-pdf` is Node-only and the build did not report it. Fix in the tooling revisions.
- `vue-cookie-accept-decline`, `weekstart`, `zxing`, `quagga`, `v-lazy-image` and several date/time pickers were not checked for use.
- `docs/workflow/04-revision-docs.md` and `06-pull-request.md` say the revision docs are local only, but `docs/` is tracked in the repo and recent revision docs were committed.

## Summary
Klant no longer carries Vue 2 imports, a dead `VueMeta` hack, a backup store file or ten unused packages; `moment` and `validator` are now declared explicitly.
