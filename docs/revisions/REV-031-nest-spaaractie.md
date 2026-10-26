# REV-031 — NestJS savings actions and stamp cards

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-031-nest-spaaractie`            |
| PR     | #30                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds the savings actions ("spaaracties") and the stamp cards of customers to the NestJS server: `GET/POST/PUT /spaaractie`, `GET /spaaractie/:id`, `GET /customer_spaaractie`, `GET /customer_spaaractie/:customerId`, `PUT /customer_spaaractie` (exchange points for stamps) and the counter functions for employees (`employeeupdate`, `employeechange`, `nostamps`). Also adds the shared image-saving helper that the product and discount revisions will use.

## Why this revision exists
Next in the plan (remaining modules). Reading the old code showed that the stamp and point logic could be abused by customers, so it was rebuilt rather than ported.

## What changed
- `src/spaaracties/`: services and controllers for actions and cards, module.
- `src/common/images.ts`: `saveImage` / `imageColumn` for base64 data URLs (png, jpeg, gif, webp; first bytes must match the type; 5 MB; random file names; saved under `public/<folder>/`, URL path `api/back-images/<folder>/<file>`).
- `access.rules.ts`: the three counter functions are employee-only rules (in the old Server the check was inside the route).
- Parity: `fixtures/spaaractie.sql`, `specs/spaaractie.json` (9 requests).

## Problems of the old endpoints, fixed here
1. **Free and forged stamps.** `PUT /customer_spaaractie` believed the points balance the client sent, and the first exchange for an action created the card with the stamps without taking any points. Now the balance comes from the database, points are taken in every case with a conditional update (never below zero, no double spending), the stamps are added in the same transaction, and only the logged-in customer can do it.
2. **Stamp cards of any customer** were readable by id (`GET /customer_spaaractie/:id`), and the list took any column as a filter and sent every customer with password hash and tokens. Now a customer only gets their own cards (403 for others), filters are limited to real columns, the customer is sent without secrets.
3. **Counter functions open to customers.** The access rules treated `employeeupdate`/`employeechange`/`nostamps` as customer endpoints; the old routes had a separate employee check, which was easy to lose. Now explicit employee rules. They also answered "success" before the database had finished and could drive a card below zero; amounts are validated, the work is done in a transaction and a card cannot go below zero.
4. **Creating/changing an action** wrote every field of the body, took the image file extension from the text of the request (any text ended up in a file name, any content was written) and lost the link to the products on create (`products.spaaractie_id = ...` was set on the list, not on each product); an update without product list crashed after saving. Now columns are limited to the table's columns, images are checked and saved safely, products are linked, and a missing list leaves the products alone.
5. `POST /customer_spaaractie` (a copy of the customer sign-up that created a Customer from the body) and `GET /customer_spaaractie/reminder` (hardcoded to a test e-mail address and never reachable because `/:customerId` was registered first) are not carried over.

## Implementation decisions
- Kept: all answer shapes (`{ actie }`, `{ success, message }`, `{ error: "Teveel zegels ingevoerd." }`, HTTP 200 for failures of the counter functions), the note text of `nostamps`.
- An exchange without `amount_exchange` exchanges everything possible (as before); zero stamps answers `{ error: "Geen zegels om om te wisselen." }` (new text; before it changed nothing silently).

## Tests added
`ServerNest`: 43 suites, 430 tests (42 new): `common/images.spec` (saving, type/first-byte check, svg and path tricks rejected, size, column handling), `spaaracties.service.spec`, `customer-spaaracties.service.spec` (own cards only, secrets excluded, exchange with DB balance / conditional update / invalid amounts / roles, employee functions, note format), `test/spaaracties.e2e-spec` (routes incl. that `employeeupdate` is not read as a customer id, access rules).

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (430/430): clean.
- Parity on the Podman test database (`node parity/check.js --spec spaaractie --fixtures auth.sql,spaaractie.sql`): **9 requests: 7 identical, 2 intended differences, 0 unexpected** (another customer's cards: 403; the customer's list scoped to their own cards, without the customer record). The mutating endpoints are not in the parity run (they change shared data).
- **Live run of the mutating endpoints on the test database** (test rows removed afterwards): exchange with a forged balance refused, first exchange creates the card and takes the points, employee/anonymous refused, `employeeupdate` +3 stamps +6 points, `employeechange` −4 and refusal of −99, create action with a png (file saved, URL path stored, products linked, `deletedAt` in the body ignored), update replaces the products, svg 400, customer 403, unknown 404.

## Known limitations
- Images are written to the local disk (`public/`), like before; this does not scale to several servers.
- The employee counter functions have no audit trail beyond the log lines.

## Future work discovered
An audit table for stamp/point changes; the old `reminder` mail (Spaaractie reminder) could come back as a scheduled job if wanted.

## Summary
Stamp cards and savings actions work on the new server with the same answers, and customers can no longer create stamps or points for themselves or read other customers' cards.
