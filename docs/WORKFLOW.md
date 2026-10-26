# Revision Workflow

Every development task follows this workflow. **Before starting a step, read its linked file** — the details are not loaded automatically.

## Steps

When the user asks for a new feature:

1. Determine whether it should be one revision or multiple, and split logically. Determine the next revision number → [01 Understand and define](workflow/01-understand-and-define.md)
2. Create a feature branch, implement one revision → [02 Branch and implement](workflow/02-branch-and-implement.md)
3. Add tests, run tests, run the pre-PR checks → [03 Test locally](workflow/03-test-locally.md)
4. Update documentation (revision doc and summary) → [04 Revision docs](workflow/04-revision-docs.md)
5. Commit and push → [05 Commit and push](workflow/05-commit-and-push.md)
6. Create the PR → [06 Pull request](workflow/06-pull-request.md)
7. Monitor CI, merge only when all conditions are met, confirm the merge, report → [07 CI, merge and report](workflow/07-ci-merge-and-report.md)

Do not silently implement multiple unrelated revisions in one PR.

## Hard rules (always apply)

Never:

- Use `gh pr merge --admin` or otherwise bypass checks, branch protection or reviews
- Push feature work directly to main
- Merge despite failing required tests
- Skip revision documentation or the PR
- Pretend tests passed when they did not run
- Claim a PR was merged when it was not, or that CI passed without checking its status

Be explicit about the real repository state.
