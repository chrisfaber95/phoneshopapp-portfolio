# REV-001 — Vue 3 migration spike (Klant/Client copy)

| Field  | Value                                                              |
| ------ | ------------------------------------------------------------------ |
| Date   | 2026-09-28                                                         |
| Repo   | `Klant/Client copy` (a full standalone copy of `Klant/Client`, own git remote) |
| Branch | `vue3-migration`                                                   |
| PR     | None — explicitly requested as a review-only branch, not a revision to merge |
| Status | Implemented, not merged, not reviewed by a human yet               |

## What this revision does

Migrates the `Klant/Client copy` app from Vue 2 (Vue CLI 4 / webpack) to Vue 3 (Vite), as a spike for the user to review before deciding whether/how to bring this to the real `Klant/Client` app. Every Vue-2-only API, every Vue-2-only dependency, and the build tooling itself were replaced with their Vue 3 / Vite equivalents. Component styling was also converted from plain CSS to SCSS with a small shared variables partial, per explicit request.

## Why this revision exists

The user asked for an exploratory Vue 3 migration, done in the existing `Klant/Client copy` sandbox (not the live `Klant/Client`), on its own branch, with no PR and no CI wait — purely so they can review the result locally before deciding whether to carry it forward.

## What changed

**Build tooling**: Vue CLI 4/webpack → Vite 5. `vue.config.js` removed; `vite.config.js` added (`@vitejs/plugin-vue`, `@` alias to `src/`, `vite-plugin-pwa` for the PWA manifest, `server.https`/`server.host`). Root `index.html` added (Vite's entry point convention, replacing `public/index.html`'s role). `babel.config.js` emptied (no longer used for the build — Vite uses esbuild — only kept so `@babel/eslint-parser` has a config file to find).

**Framework core**: `vue` 2.6→3.4, `vue-router` 3→4 (`createRouter`/`createWebHistory`), `vuex` 3→4 (`createStore`, `Vue.set`/`Vue.delete` calls replaced with plain property assignment/`delete`). `src/main.js` rewritten around `createApp(App)`; the custom `v-closable` directive's `bind`/`unbind` hooks became `mounted`/`unmounted`, and `vnode.context` became `binding.instance` (Vue 3 directives no longer receive a vnode with `.context`).

**Plugins** (`src/plugins/*.js`): `bootstrap-vue.js`, `axios.js`, `fontawesome.js` rewritten from Vue-2-style `Vue.use`/`Vue.component`/`Vue.prototype` registration to Vue-3-style exports consumed by `main.js`'s `app.use()`/`app.component()`/`app.config.globalProperties`.

**Dependency swaps** (no Vue 3 build existed for these):
- `bootstrap-vue` → `bootstrap-vue-next` (+ Bootstrap 4→5). Only one prop rename was needed across all 8 consuming components: `<b-checkbox>` → `<b-form-checkbox>` (App.vue's cookie banner); everything else bootstrap-vue-next already accepts.
- `vue-meta` → removed outright. Its only real usage was a static `HandheldFriendly` meta tag in two components (`Home.vue`, `Departments.vue`); replaced with one static `<meta>` tag in `index.html` rather than pulling in `@unhead/vue` for a single non-dynamic tag.
- `vue-js-modal` → removed outright. It was registered globally in the old `main.js` but its `$modal` API was never actually called anywhere in `src/` — dead dependency.
- `vue-barcode-scanner` → removed outright. Never imported; `Barcodescanner.vue` uses `quagga` directly (kept, framework-agnostic).
- `vue-datetime` + `vue2-timepicker` → `@vuepic/vue-datepicker` (one package covering both, used as two separate picker instances in `Order.vue` to preserve the original two-widget UX — a date picker and a conditionally-shown time picker, not a merged datetime picker).
- `vue-pdf` → `vue-pdf-embed` in `Info.vue`/`Privacy.vue`. `Privacy.vue`'s old code faked multi-page display by hardcoding `v-for="i in 6"` separate single-page `<pdf>` instances; `vue-pdf-embed` renders all pages continuously by default, so that hardcoded loop was replaced with one component — same visual result, no fixed page count baked in.
- `vue-cookie-law` → hand-rolled cookie banner in `App.vue` (a `localStorage`-backed boolean driving the same existing markup/transition), rather than depend on an unmaintained package for something this small.
- `register-service-worker` + `@vue/cli-plugin-pwa` → `vite-plugin-pwa` (`virtual:pwa-register`'s `registerSW()` in `main.js`).
- `node-sass`/`sass-loader` → `sass` (Dart Sass), since Vite's built-in Sass support just needs the `sass` package, no loader.
- `eslint` 5→8, `eslint-plugin-vue` 5→9 (`plugin:vue/vue3-essential` ruleset), `babel-eslint` → `@babel/eslint-parser`.
- Removed as orphaned by the above: `@babel/polyfill`, `mutationobserver-shim`, `vue-template-compiler`, the whole `@vue/cli-plugin-*`/`vue-cli-plugin-*` family, `popper.js` (Bootstrap 4-era, unused, superseded by Bootstrap 5's own Popper dependency), `font-awesome`/`fontawesome` (the old standalone packages — distinct from the still-used `@fortawesome/*` scoped ones — lost their only import when the dead `import 'fontawesome'` side-effect import was removed from `main.js`), `core-js` (only ever pulled in for `@babel/polyfill`, never imported directly).
- Added because newly needed: `autoprefixer` as an explicit devDependency (previously a transitive dependency of `@vue/cli-service`, still referenced directly by the `postcss` config in `package.json`).

**Env vars**: `.env`/`.env.development`'s `VUE_APP_*` variables renamed to `VITE_APP_*` (Vite only exposes `VITE_`-prefixed vars to client code), and every `process.env.*`/`process.env.BASE_URL` reference in `src/` (`http-common.js`, `Header.vue`, `Info.vue`, `Privacy.vue`, `router/index.js`) became `import.meta.env.*`. This was necessary for the app to actually run under Vite — `process` isn't defined in the browser bundle Vite produces.

**Styling**: every `<style>` block across ~23 style tags in 17 components/views got `lang="scss"`; selector chains that were already implicitly nested by naming convention (e.g. `.controls fieldset.input-group`, `#result_strip ul.thumbnails > li`) were rewritten as nested SCSS — mechanical only, verified to compile to equivalent CSS via a full `npm run build`. A new `src/assets/styles/_variables.scss` holds `$color-orange`/`$color-red`, the two color literals repeated across multiple files (`#ffa500`, `#ee151e`), consumed via `@use` in the files that use them.

**Test scaffold**: `tests/e2e/` (the untouched default Vue-CLI Cypress boilerplate — its one spec checks for placeholder text `'Welcome to Your Vue.js App'` that was never in this app) is now orphaned since `@vue/cli-plugin-e2e-cypress` had no Vite equivalent and was removed per the plan. Deleting the directory was blocked by the session's destructive-action guard, so instead it's excluded from `eslint`'s `ignorePatterns` (it was making `npm run lint` crash — its own `.eslintrc.js` requires the now-uninstalled `eslint-plugin-cypress`). **The directory itself is left in place for the user to delete or restore Cypress for, deliberately not decided here.**

## Implementation decisions

- Kept Vuex (not switched to Pinia) — out of scope, user didn't ask for a state-management change, only a Vue 3 migration.
- Kept the Options API throughout (no Composition API rewrite) — Options API is fully supported in Vue 3, and rewriting every component's API style wasn't requested.
- `dist/` (pre-existing committed build output — unusual but pre-existing practice) is deliberately **not** updated in this branch. Running `npm run build` regenerates it with entirely different Vite/Rollup output (different filenames, chunking, content), which would bloat the diff with regenerated artifacts unrelated to the actual source migration. It was reverted after every build/verification step. **Flagging this for the user**: the committed `dist/` is now stale relative to this branch's source and this practice (committing build output at all) is worth reconsidering regardless of this migration.
- The `openMinutes` busy-pickup-slot exclusion in `Order.vue` (meant to grey out already-booked 15-minute slots in the time picker) could not be carried over as-is: `@vuepic/vue-datepicker`'s time picker only supports a min/max range + fixed increment, not an arbitrary excluded-minutes list the old `vue2-timepicker` supported via `:minute-range`. On inspection, the original `openMinutes` computation already had a pre-existing bug (comparing a string-typed split value against a number array via `indexOf`, so the comparison never matched and the wrong element was spliced) — so no working exclusion behavior actually existed before this migration either. Left as-is; not a regression, but the underlying feature (preventing double-booked pickup slots) was never functioning and would be worth fixing properly, likely server-side, independent of this migration.

## Architectural decisions

None beyond the build-tooling swap itself (Vue CLI/webpack → Vite) and the Bootstrap-Vue → bootstrap-vue-next replacement, both already covered above.

## Tests added

None — this app had no unit/component test suite before this revision (only the untouched, non-functional Cypress placeholder scaffold noted above), and adding one wasn't part of the scope requested.

## Tests executed

- `npm install` — succeeds (after removing the stale Vue-CLI-era `package-lock.json` and fixing the `eslint`/`@babel/eslint-parser` version conflict and the `autoprefixer` gap).
- `npm run build` — succeeds, producing a working Vite/Rollup production bundle (verified repeatedly after each fix).
- `npm run lint` — runs cleanly (no crashes). It reports ~790 pre-existing lint findings (unused vars, mixed tabs/spaces, multi-word component name violations, a few real pre-existing bugs like `Quagga` used without import in `Search.vue`) that predate this migration and were **not** touched, per the project's surgical-changes rule — fixing them would be a large, unrelated change. Two real Vue-2→3 migration issues the linter caught *were* fixed: `destroyed()` lifecycle hooks (renamed to `unmounted()` in `Barcodescanner.vue` and `Search.vue` — Vue 3 silently never calls the old name, this was a real functional regression) and the eslint config itself needed the Vue 3 ruleset/parser upgrade to run at all.
- Vite dev server — booted successfully (`npm run serve`). Because the project's `server.https: true` setting (pre-existing, presumably for camera/WebRTC secure-context requirements in the barcode scanner) generates a minimal self-signed cert that this Windows environment's TLS stack (curl/schannel, .NET's `Invoke-WebRequest`) rejects independent of this migration, automated HTTPS verification wasn't possible here. Verified instead by temporarily running the dev server over plain HTTP: `index.html` and every migrated `.vue`/`.js` file (`App.vue`, `Home.vue`, `Order.vue`, `Info.vue`, `Privacy.vue`, `ProductModal.vue`, `Barcodescanner.vue`, `main.js`) transform and serve without compile errors. This confirms the app's module graph resolves and compiles correctly, but **does not** confirm in-browser runtime behavior (no headless browser was available in this session) — clicking through the app (routes, add-to-cart, checkout flow, cookie banner, barcode scanner camera permission, PDF viewer, date/time picker) has not been done and should be the user's first step after pulling this branch.

## Known limitations

- No in-browser interactive testing was performed (see above) — only build-time and dev-server transform verification.
- The `dist/` folder committed in this repo is now stale relative to this branch (see Implementation decisions).
- `tests/e2e/` is an orphaned, always-non-functional Cypress scaffold, left in place rather than deleted (destructive-action guard) or fixed (out of scope) — the user should decide whether to remove it or restore Cypress tooling.
- The pickup-slot double-booking prevention in `Order.vue` was already non-functional before this migration (pre-existing bug) and is unchanged by it.
- Package version numbers for the newly-added libraries (`bootstrap-vue-next`, `@vuepic/vue-datepicker`, `vue-pdf-embed`, `vite-plugin-pwa`, etc.) were chosen from training knowledge and confirmed installable via `npm install`, but their exact prop/slot APIs (especially `bootstrap-vue-next`'s checkbox props and `@vuepic/vue-datepicker`'s time-picker props) were not verified against in-browser behavior — only that the build compiles.
- ~790 pre-existing lint findings (unrelated to this migration) remain unaddressed, per scope.

## Future work discovered

- Fixing the pickup-slot double-booking validation properly (likely needs a server-side check regardless of client picker library, since the client-side exclusion was never reliable).
- Deciding on `tests/e2e/`: either restore Cypress (or a Vite-era alternative like Playwright/Vitest) or remove the placeholder scaffold.
- Reconsidering whether `dist/` should be committed to the repo at all, given how differently Vite's output is structured/hashed compared to the old webpack output.
- The build reports one chunk (`index-*.js`) at ~3.6 MB minified — code-splitting via dynamic imports or `manualChunks` would help, but this predates the migration in spirit (the old webpack build likely had the same monolithic-bundle issue) and wasn't part of the requested scope.
- If page-specific `<title>`/meta management beyond the single static `HandheldFriendly` tag is ever needed, `@unhead/vue` is the currently-recommended Vue 3 replacement for `vue-meta` (which is archived/unmaintained for Vue 3).

## Summary

`Klant/Client copy` now builds and serves on Vue 3 + Vite, with every Vue-2-only dependency swapped for a maintained Vue 3 equivalent (or removed where genuinely unused), core Vue 2 APIs (Options API lifecycle names, directives, Vuex, Vue Router) translated to their Vue 3 forms, and all component styling converted to SCSS with a small shared variables partial. The branch is pushed for review only — no PR was opened, no merge was performed, and CI was not monitored, per the user's explicit instruction. The main thing still needed before this could be trusted is actual in-browser click-through testing, which this session's tooling couldn't perform.
