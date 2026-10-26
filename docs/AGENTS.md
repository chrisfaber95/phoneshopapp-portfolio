# Specialist Agents

Project agents live in `.claude/agents/`. Delegate to one only when the task clearly matches; otherwise work directly.

| Workflow step | Agent | Use for |
|---|---|---|
| 1 Understand and define | `architect-reviewer`, `api-designer` | Judging a design or a new/changed endpoint before implementing |
| 2 Implement (client) | `frontend-developer` | Vue 2 client work in `Klant` |
| 2 Implement (server) | `backend-developer`, `node-specialist` | Express server work in `Server` |
| 2 Implement (payments) | `payment-integration` | Mollie order/webhook code; review its changes closely |
| 2 Implement (email) | `email-deliverability-engineer` | nodemailer / mailing config |
| 2 Implement (database) | `sql-pro`, `database-optimizer` | Queries, schema, indexing, database-side filtering |
| 2 Dependencies | `dependency-manager` | Audits and upgrades; follow the Dependency Policy |
| 3 Test locally | `test-automator` | Writing and running tests |
| 3 Pre-PR review | `code-reviewer` | Review of the diff before committing |
| 4 Revision docs | `documentation-engineer` | Revision doc and `ARCHITECTURE.md` updates |
| 5-7 Commit, PR, CI | `git-workflow-manager`, `devops-engineer` | Branching, PR flow, CI configuration |

Rules for delegation:

- An agent works inside the current revision only; the Hard rules in `docs/WORKFLOW.md` still apply.
- Review what an agent changed before committing, as with any other change.
- `agent-installer` is for adding agents; `typescript-pro` is installed but unused (codebase is plain JavaScript).
