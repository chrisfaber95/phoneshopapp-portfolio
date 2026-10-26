# Branch and Implement

Part of the [revision workflow](../WORKFLOW.md).

### Step 3 — Create a feature branch

Never implement a normal project feature directly on main.

Create a branch for the revision, named `feature/rev-XXX-short-description` (e.g. `feature/rev-003-order-tests`).

The branch should contain only the work for that revision.

### Step 4 — Implement

Implement only the agreed scope of the revision.

Do not add unrelated improvements just because they are noticed during implementation.

When an unrelated improvement is discovered:

- Document it
- Do not implement it in the current revision
- Mention it in the final revision notes if relevant

Keep architectural boundaries clean.
