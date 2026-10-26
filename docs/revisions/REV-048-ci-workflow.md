# REV-048 — GitHub Actions CI

| Field  | Value                          |
| ------ | ------------------------------ |
| Date   | 2026-10-01                     |
| Branch | `feature/rev-048-ci-workflow`  |
| PR     | #47                            |
| Status | Open                           |

Repo touched: root repo (`.github/`, `docs/workflow/`).

## What this revision does
Adds `.github/workflows/ci.yml`, run on every pull request and on pushes to `main`, and documents how to use it when merging.

## Why this revision exists
The repo had no CI, so PRs were only checked by GitGuardian and merging relied on local runs. The repository is private on a plan without branch protection (the API returns 403), so GitHub cannot block a merge; the workflow doc is the gate.

## What changed
- `ci.yml`, three jobs on Node 22 with `npm ci` and npm cache:
  - `server-nest`: `npm ci` in ServerNest and in `Server` (the parity tests `models-parity` and `mail-parity` require the old server's modules; the first CI run failed without it), then `typecheck`, `lint`, `test`, `build`.
  - `klant`: `build`.
  - `employees`: `build` (`npm ci --legacy-peer-deps` because `vue-d3-charts` peers on Vue 2; pre-existing).
- `docs/workflow/07-ci-merge-and-report.md`: how to wait for and read CI, merge only when every check passes, and how to merge stacked PRs.
- `docs/workflow/03-test-locally.md`: CI complements local runs.

## Implementation decisions
- Lint for Klant and Employees is not in CI yet: it only passes after REV-046/047 (Klant) and an Employees cleanup. Each of those revisions adds its own lint step.
- No deploy, no secrets, read-only permissions.

## Architectural decisions
None.

## Tests added
None (CI configuration).

## Tests executed
Locally, from a clean `npm ci` in ServerNest: typecheck, lint, 565 tests and build all pass. The workflow itself is first exercised by this PR's own run (`gh pr checks`); result recorded in the PR.

## Known limitations
No branch protection, so passing CI is enforced by process only. Klant and Employees have no tests, only build checks.

## Future work discovered
Fix the 34 Employees lint errors and add its lint step; consider upgrading to a plan or public repo for required checks.

## Summary
Every PR now runs ServerNest checks and the Klant/Employees builds on GitHub.
