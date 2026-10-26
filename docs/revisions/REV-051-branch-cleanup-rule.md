# REV-051 — Allow deleting merged feature branches

| Field  | Value                                    |
| ------ | ---------------------------------------- |
| Date   | 2026-10-02                               |
| Branch | `feature/rev-051-branch-cleanup-rule`    |
| PR     | #50                                      |
| Status | Merged                                   |

Repo touched: root repo (`docs/workflow/`, `.claude/settings.local.json`).

## What this revision does
States explicitly that merged `feature/*` branches are deleted after merge, locally and remotely, and when that is safe.

## Why this revision exists
Step 13 only said "delete the local feature branch if appropriate". Cleaning up twelve merged branches was refused by the permission classifier until the user granted permission.

## What changed
- `docs/workflow/07-ci-merge-and-report.md`: step 13 rule rewritten with safety conditions.
- `.claude/settings.local.json` (tracked): allow rules for `git branch -d/-D feature/*` and `git push origin --delete feature/*`.

## Implementation decisions
Allow rules are limited to `feature/*` so `main` and unrelated branches stay protected.

## Architectural decisions
None.

## Tests added
None (documentation).

## Tests executed
CI on the PR. Deleted the 12 stale branches beforehand after checking each matched its remote tip and its PR was merged.

## Known limitations
The allow rules cover only these exact command shapes; deleting several branches in one `git branch -D a b c` call may still prompt.

## Future work discovered
None.

## Summary
Deleting merged feature branches is now an explicit, scoped part of the workflow.
