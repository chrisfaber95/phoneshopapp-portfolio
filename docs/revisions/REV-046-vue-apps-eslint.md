# REV-046 — ESLint for Klant and Employees

| Field  | Value                              |
| ------ | ---------------------------------- |
| Date   | 2026-10-01                         |
| Branch | `feature/rev-046-vue-apps-eslint`  |
| PR     | #45 |
| Status | Merged |

Repo touched: root repo (`Klant/`, `Employees/`).

## What this revision does
Installs ESLint (flat config, `eslint-plugin-vue`) in Klant and Employees so `npm run lint` works.

## Why this revision exists
Both apps had a `lint` script/`eslintConfig` but no ESLint packages. The old config used `babel-eslint` and `vue-cli-service lint` (the removed `@vue/cli-plugin-eslint`). ServerNest already had working ESLint, so it is unchanged.

## What changed
- `Klant`, `Employees`: dev dependencies `eslint@10`, `@eslint/js`, `eslint-plugin-vue@10`, `vue-eslint-parser`, `globals`.
- New `eslint.config.mjs` in each (`flat/essential` Vue rules + `eslint:recommended`; ignores `dist`, `public`, `tests`).
- `package.json`: `lint` is now `eslint .`; the stale `eslintConfig` block is removed.

## Implementation decisions
- Existing code is not fixed here. Noisy pre-existing findings (`no-unused-vars`, `no-useless-assignment`, `no-empty`, `no-useless-escape`) are warnings; `vue/multi-word-component-names` and `vue/no-reserved-component-names` are off (renaming components is a refactor).
- Real problems stay errors, so `npm run lint` currently exits non-zero. Baseline: Klant 53 errors / 801 warnings, Employees 34 errors / 111 warnings.
- Employees install needed `--legacy-peer-deps`: `vue-d3-charts@0.2.8` peers on Vue 2, a conflict that predates this revision.
- No dependency install scripts needed review (`npm approve-scripts --allow-scripts-pending`: none pending).

## Architectural decisions
None.

## Tests added
None (tooling).

## Tests executed
- Klant, Employees: `npm run build` passes; `npm run lint` runs and reports the baseline above.
- ServerNest: `npm run lint` passes (unchanged).
- No unit tests exist for these apps; no formatter or typecheck configured.

## Known limitations
Lint fails until the baseline errors are fixed, so it is not wired into CI (there is no CI workflow in the repo).

## Future work discovered
- Genuine bugs: undefined `inputValue` (Klant `assets/scripts/auth/index.js`), `itemClass` (`Select.vue`), `currentDepartment`/`initSwipe` (`discountsPage/ShelfUnit.vue`), `cart` redeclared (`assets/receipt/index.js`), computed properties without a return (`Folder.vue`, `Actiefolder.vue`), missing `.value` (`ProductModal.vue`), duplicate key `order` (Employees `BezorgingScreen/Order.vue`).
- `Scanners/Barcodescanner3.vue` (parse error) and `Scanners/test.js` (undefined globals) look like scratch files in both apps; likely deletable.
- Clear the warnings (mostly unused variables/imports), then make lint a required check.

## Summary
`npm run lint` works in Klant and Employees and reports 87 real errors to fix in follow-up revisions.
