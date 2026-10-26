# REV-014 — Server: escape HTML in the mail templates

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-014-escape-mail-html`           |
| PR     | #13                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Escapes customer and database text in the e-mail templates in `config/mailing.js` so it can no longer inject HTML into a mail.

## Why this revision exists
Found in REV-012: values such as the feedback text, customer names and product titles were inserted as raw HTML (HTML injection in mails sent from the shop's address).

## What changed
- `config/mailing.js`: new `escapeHtml` helper (uses `he`, already a dependency) applied to 29 interpolations: product title / variant / variant label (all four order templates), actie customer name, e-mail and address, pickup time, the feedback text, and the reset code / order id inside the links.
- Feedback mail: removed the stray `">` that was printed after the feedback text.
- `undefined` values now render as empty text instead of the word "undefined".

## Implementation decisions
Only text values are escaped. Numbers and prices (`finalPrice`, stamp amounts), the template partials (`templates.*`) and `process.env.BASE_URL` are trusted and left as they are.

## Architectural decisions
None.

## Tests added
In `tests/mailing.test.js` (the REV-012 `todo` is now a regular test): feedback text escaped and no stray characters; product name/variant escaped in the ordered and picked mails; normal characters (`Ben & Jerry's`) stay readable; reset code and order id escaped inside the links.

## Tests executed
`npm test`: 50 tests, 50 pass, 0 fail, 0 todo. All 202 files load with the real config. Not run: sending real mail.

## Known limitations
Product titles that legitimately contained HTML (e.g. `<b>`) will now show the tags as text. Mail templates for orders of the spaaractie (`actieReminderTemplate`) only contain numbers from the database and were left alone.

## Future work discovered
`setMailOptions` still assigns an undeclared global `qrcode`.

## Summary
Mail text from customers and the database is escaped; all five issues from REV-012 are now fixed and covered by tests.
