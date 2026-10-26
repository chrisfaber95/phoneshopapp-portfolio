# Revision Document and Summary

Part of the [revision workflow](../WORKFLOW.md).

### Step 6 — Create the revision document

Every revision MUST have its own Markdown document at `docs/revisions/REV-XXX-short-description.md` (e.g. `docs/revisions/REV-003-order-tests.md`).

The document must explain:

- What this revision does
- Why this revision exists
- What changed
- Important implementation decisions
- Important architectural decisions
- Tests added
- Tests executed
- Known limitations
- Future work discovered
- A short summary

Use the revision template in `docs/revisions/REVISION_TEMPLATE.md`.

The revision document is part of the revision, but the docs are kept local only. They live in `N:\Projects\ShopApp\docs`, outside the `Klant` and `Server` git repos, so they are never committed or pushed. Write them before the PR is created and say in the revision document which repo the revision touched.

### Step 7 — Update the revision summary

Also update `docs/revisions/REVISION_SUMMARY.md`: add an entry for the new revision, keeping the summary concise.

Example:

| Revision | Date       | Title               | PR  | Status |
| -------- | ---------- | ------------------- | --- | ------ |
| REV-001  | 2026-09-24 | Project setup       | #1  | Merged |
| REV-002  | 2026-09-24 | Database foundation | #2  | Merged |

The summary represents the chronological history of the project.

Do not delete historical revisions from this file.
