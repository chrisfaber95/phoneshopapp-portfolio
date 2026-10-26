# REV-047 — Klant lint fixes

| Field  | Value                                   |
| ------ | --------------------------------------- |
| Date   | 2026-10-01                              |
| Branch | `feature/rev-047-klant-lint-fixes`      |
| PR     | #46                                     |
| Status | Merged |

Repo touched: root repo (`Klant/`).

## What this revision does
Clears all ESLint errors and warnings in Klant (was 53 errors / 801 warnings), so `npm run lint` passes, and makes the previously downgraded rules errors again.

## Why this revision exists
REV-046 installed ESLint but left the existing code's findings as a baseline.

## What changed
- Removed unused imports, locals, functions and dead assignments (mechanical, mostly via `eslint-plugin-unused-imports --fix` run temporarily, not added as a dependency, plus small one-off scripts).
- Deleted two unreferenced scratch files: `components/Scanners/Barcodescanner3.vue` (parse error) and `components/Scanners/test.js`.
- Real bug fixes: `auth/index.js` `resolve(inputValue)` used an out-of-scope variable (now `myInput.value`); `Select.vue` called an undefined `itemClass` (uses the existing `getItemClass(index)`); `discountsPage/ShelfUnit.vue` called an undefined `initSwipe()` (error was swallowed by `.catch`, call removed); `receipt/index.js` redeclared parameter `cart`; unreachable `return` in `NoAccess.vue`; stray `\` attribute in `FavoriteIcon.vue`; `@click=""` in `Coinexchange.vue`; `v-html` on `<router-link>` replaced by plain text.
- Removed `<Transition>` wrappers with no `v-if`/`v-show` (they never animated) in Ingredients, Nutrients, StandardInfo.
- Replaced `for (const [key, value] of Object.entries(cart))` with `Object.values` where the key was unused; for the three loops that only recomputed `discount`, the guard is now `if (Object.keys(cart).length > 0)` (same result, including for an empty cart).
- `.github/workflows/ci.yml`: the `klant` job was renamed to "lint, build", but the lint step itself was not added (a scripted edit silently failed to match). Corrected in REV-050.
- `eslint.config.mjs`: rules are errors again. `no-unused-vars` ignores unused function arguments and caught errors (watchers like `(newVal, oldVal)`). Component-name rules stay off.

## Implementation decisions
Dead code was removed rather than silenced. Constructors and calls with possible side effects (`new window.BarcodeDetector(...)`, which throws when unsupported) were kept as statements.

## Architectural decisions
None.

## Tests added
None (no test suite in Klant).

## Tests executed
- `npm run lint` (Klant): 0 errors, 0 warnings.
- `npm run build` (Klant): compiles (79 pre-existing Sass deprecation warnings).
- Not run: browser smoke test of the scanners, select, cart and receipt screens. These touched files should be checked manually.

## Known limitations
No automated test covers the touched UI code; behavior was preserved by reading the diffs, not by running the screens.

## Future work discovered
- Many Klant components exist in duplicated variants (`Stamp`/`Stamp1`, `Voucherfield`/`Voucherfield1`, `ShelfPicnicStyle`/`ShelfPicnicStyle1`, Barcodescanner1-7); most appear unreferenced and could be deleted.
- Employees still has 34 errors (REV-046 baseline).

## Summary
Klant lints clean; a handful of latent runtime errors were fixed along the way.
