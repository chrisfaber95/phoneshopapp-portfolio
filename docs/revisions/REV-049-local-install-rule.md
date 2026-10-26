# REV-049 — Use `npm install` locally, `npm ci` only in CI

| Field  | Value                                  |
| ------ | -------------------------------------- |
| Date   | 2026-10-01                             |
| Branch | `feature/rev-049-local-install-rule`   |
| PR     | #48                                    |
| Status | Merged                                 |

Repo touched: root repo (`docs/workflow/`).

## What this revision does
Makes the local reinstall rule explicit: `npm install`, never `npm ci`, and do not wait on a slow install.

## Why this revision exists
During REV-047 a local `npm ci` in Klant ran for over ten minutes, twice, and blocked progress. CI already runs a clean `npm ci` in about a minute.

## What changed
- `docs/workflow/03-test-locally.md`: reinstall rule reworded.

## Implementation decisions
Slow local installs are not worth waiting on: CI is the clean-install check.

## Architectural decisions
None.

## Tests added
None (documentation).

## Tests executed
CI on the PR.

## Known limitations
None.

## Future work discovered
Employees lint (34 errors) is still not in CI.

## Summary
Local installs use `npm install`; `npm ci` is left to CI.
