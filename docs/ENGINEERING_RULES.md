# Engineering Rules

Architecture, safety, performance, testing and dependency rules. Imported by [CLAUDE.md](../CLAUDE.md).

## Architecture Rules

Keep concerns separated: UI (Vue client), API routes, application/use-case logic (cart, pricing, orders), persistence (MySQL), payments (Mollie), email, image handling (product and discount images).

- Do not place database queries or pricing/order logic directly inside UI components.
- Keep Mollie and email calls on the server, never in the client.
- Keep infrastructure replaceable where that provides a concrete benefit; avoid unnecessary abstractions.

## Performance Expectations

Target size: 10,000+ products, 3,000 users.

- Avoid loading the entire product collection into frontend memory; use database-side filtering and sorting.
- Cache product images; use lazy loading/virtualization for large collections.
- Long-running work (image processing, sending email) should not block the UI or the request.

## Testing Requirements

Important application logic must have automated tests.

Tests should cover, where applicable:

- Database persistence
- Cart and price calculation
- Order creation and updates
- Payment flow and Mollie webhooks
- Authentication and user rights
- Search
- Filtering
- Error handling

Tests must not depend on the real database, live Mollie or a real mail server.

Use a test database, test fixtures and mocked external services.

Don't test extreme edge cases.

## Dependency Policy

Before adding a dependency:

- Check whether the project already has a suitable dependency.
- Check whether the platform/runtime already provides the capability.
- Prefer mature libraries.
- Avoid dependencies that are abandoned or unnecessary.
- Consider offline/local operation.

Document significant dependency decisions.

Install scripts are reviewed, not trusted by default. After adding or upgrading a dependency, run `npm approve-scripts --allow-scripts-pending`. For each package listed, read what its install script does, then `npm approve-scripts <pkg>` (pinned to the reviewed version) or `npm deny-scripts <pkg>`, and record why in the revision document. The policy lives in `allowScripts` in each part's own `package.json` (`Klant/package.json`, `Server/package.json`).

## Documentation Policy

Documentation is part of the implementation.

- When architecture changes, update `ARCHITECTURE.md`.
- When a revision is completed, update `docs/revisions/REVISION_SUMMARY.md` and create `docs/revisions/REV-XXX-short-description.md`.

Do not leave documentation for "later".
