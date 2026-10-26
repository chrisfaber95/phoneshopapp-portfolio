# REV-029 — NestJS Mollie webhook (order payments)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-029-nest-mollie-webhook`        |
| PR     | #28                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Adds `POST /mollie/webhook` for order payments: when Mollie reports a payment as paid, a `pending` order becomes `ordered` (and the customer gets the confirmation mail) or a `scanned` order becomes `payed`.

## Why this revision exists
Second part of the order write side. REV-028 starts the payment; this follows it up.

## What changed
- `src/payments/`: `OrderPaymentsService` (webhook logic), `MollieWebhookController`, `PaymentsModule` now imports the mail module and the `Order` model.
- The webhook route stays public (Mollie sends no token); the rule already existed.

## Problems of the old webhook, fixed here
1. **Crash on unknown payments / orders.** `order.status` on a missing order threw inside a promise (unhandled), and `res.send(error)` could leak the Mollie error. Now: an unknown or malformed payment id answers 422 (so Mollie does not consider it handled), a paid payment without an order is only logged.
2. **Duplicate mails.** Mollie calls the webhook more than once; the old code read the status and then updated it, so two calls at the same moment could both send the mail. Now the change is a conditional update (`WHERE status = 'pending'`) and only the call that changed the row sends the mail.
3. **Confirmation mail went to `customer.customerEmail`**, a field that does not exist on a customer (the column is `email`), so an order of a logged-in customer without an address on the order was mailed to "undefined". Now it falls back to `customer.email`.
4. The old code loaded the product titles without the `variant`, so the mail showed the title only; the variant is loaded now (the template already printed it).
5. Sending the mail no longer delays the answer to Mollie, and a mail failure is logged without failing the webhook.
6. Only ids that look like Mollie payment ids (`tr_` + letters/digits) are looked up; what happened is always asked from Mollie itself (live first, then test mode, as before), never read from the request.

## Implementation decisions
- Kept: the answer is the payment status as text, orders are found by `paymentMethod` (first payment) or `paycode` (second payment), the status flow `pending → ordered`, `scanned → payed`.
- Not in this revision: the actie (spaaractie) webhook (`actiewebhook.js`), which belongs to the actie order revision.

## Tests added
`ServerNest`: 38 suites, 364 tests (13 new): `order-payments.service.spec` (first and second payment, repeated call sends one mail, customer account fallback, other statuses untouched, unpaid payment, no order, invalid ids never reach Mollie, unknown payment, failing mail), `test/mollie-webhook.e2e-spec` (form body, 422, public rule).

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (364/364): clean.
- **Live run on the Podman test database with a fake Mollie and a fake mail transport** (script outside the repo, rows removed afterwards): order created through `POST /order` (pending), webhook → `ordered` and one confirmation mail with the product in it, second webhook → still `ordered`, no second mail, malformed id → 422, order set to `scanned` with a second payment id → `payed`.
- No parity run (the old handler needs a real Mollie payment).
- Not run: a real Mollie test-mode payment end to end (pre-cutover smoke test).

## Known limitations
- Mollie must be able to reach the webhook URL (`MOLLIE_WEBHOOK`); the live and test keys are both tried, so both must be configured to follow up test payments.
- A webhook for an order that belongs to the actie flow is not handled here.

## Future work discovered
Verify the amount Mollie reports against the order's `picking_price`; a retention rule for `pending` orders that are never paid.

## Summary
Payments of orders are followed up on the new server: paid orders move on exactly once, with their confirmation mail, and malformed or unknown calls no longer crash or leak.
