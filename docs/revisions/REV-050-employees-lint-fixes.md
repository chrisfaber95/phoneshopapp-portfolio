# REV-050 — Employees lint fixes

| Field  | Value                                      |
| ------ | ------------------------------------------ |
| Date   | 2026-10-01                                 |
| Branch | `feature/rev-050-employees-lint-fixes`     |
| PR     | #49                                        |
| Status | Merged                                     |

Repo touched: root repo (`Employees/`, `.github/workflows/ci.yml`).

## What this revision does
Clears all ESLint errors and warnings in Employees (was 34 errors / 111 warnings) and adds `npm run lint` to the Employees and Klant CI jobs.

## Why this revision exists
Follow-up to REV-046/047: Klant was cleaned up and linted in CI; Employees was not.

## What changed
- Deleted two unreferenced scratch files: `components/Scanners/Barcodescanner3.vue` (parse error) and `components/Scanners/test.js` (32 of the 34 errors).
- `BezorgingScreen/Order.vue`: the local computed `order` collided with the `order` prop (`vue/no-dupe-keys`). Renamed to `currentOrder`; still exposed as `order`, so parents reading `ref.order` are unaffected.
- Removed unused imports, locals, functions and unused initial values (one-off AST script, not committed).
- Scanners: unused `getCapabilities()` results removed; unused `new window.BarcodeDetector(...)` results kept as statements (the constructor throws when unsupported, which the surrounding `try` relies on).
- `eslint.config.mjs`: same as Klant (rules are errors; unused function args and caught errors ignored; component-name rules off).
- `ci.yml`: Employees and Klant jobs run `npm run lint` before the build. The Klant step was meant to land in REV-047, but only the job name changed there; the first push of this PR repeated that mistake for Employees. Both were caught by reading the workflow file and the CI logs, and the logs now show `Run npm run lint` in both jobs.

## Implementation decisions
Same approach as REV-047. Removals were applied by AST position, then the remaining 7 by exact line, after the REV-047 lesson that first-match regex edits can hit the wrong declaration.

## Architectural decisions
None.

## Tests added
None (Employees has no test suite).

## Tests executed
- `npm run lint` (Employees): 0 errors, 0 warnings.
- `npm run build` (Employees): compiles (65 Sass deprecation warnings, pre-existing).
- CI on the PR.
- Not run: manual check of the Employees scanner, delivery and collecting screens.

## Known limitations
No automated tests cover the touched UI.

## Future work discovered
Employees, like Klant, has many duplicated scanner variants (Barcodescanner, 1, 2, 4-7) that are probably unused.

## Summary
Both Vue apps now lint clean and CI enforces it.
