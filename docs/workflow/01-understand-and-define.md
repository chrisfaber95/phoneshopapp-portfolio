# Understand and Define the Revision

Part of the [revision workflow](../WORKFLOW.md).

### Step 1 — Understand the current state

Before changing code:

- Inspect the repository.
- Inspect CLAUDE.md.
- Inspect ARCHITECTURE.md.
- Inspect docs/revisions/REVISION_SUMMARY.md.
- Inspect the most recent revision document.
- Inspect relevant existing code and tests.
- Determine the next available revision number.

Never assume the repository is in the state described by an older document.

### Step 2 — Define the revision

Before implementing a revision, determine:

- Revision number
- Short revision name
- Goal
- Scope
- Acceptance criteria
- Tests required
- Architectural implications

Use the next sequential revision number.

Example:

- REV-001
- REV-002
- REV-003

Never reuse a revision number.

Never silently skip a revision number.

## Revision Quality Requirements

A revision should normally solve one cohesive problem.

Good revisions:

- Add server tests for order creation
- Fix cart price calculation
- Product search endpoint
- Discount images upload
- Mollie webhook error handling
- Remove unused client dependencies

Poor revisions:

- "Implement the whole application"
- "Frontend improvements"
- "Various fixes and cleanup"
- "Everything related to orders"

When a proposed task is too large, split it into multiple revisions.
