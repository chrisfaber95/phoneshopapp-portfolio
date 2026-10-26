# REV-024 — NestJS mail module (templates and sending)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-024-nest-mail`                  |
| PR     | #23                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `ServerNest` |

## What this revision does
Ports the e-mail layer of the old Server (`config/mailing.js` and `config/mailTemplates/*`) to TypeScript: the HTML templates and the option builders and sending. No endpoints yet; password reset, feedback and orders use it in the next revisions.

## Why this revision exists
Password reset, feedback, order confirmations and the spaaractie reminders all send mail. The templates are ~650 lines of HTML that have to stay identical, so they were ported mechanically and verified against the old code.

## What changed
- `src/mail/templates/*.ts`: the five layout partials (`header`, `top`, `mailName`, `divider`, `footer`), extracted verbatim from the old files by a one-off script.
- `src/mail/mail-bodies.ts`: the nine template functions (`pickedTemplate`, `orderedTemplate`, `actiePickedTemplate`, `orderedActieTemplate`, `orderedDonarTemplate`, `accountCreatedTemplate`, `accountForgetTemplate`, `feedbackTemplate`, `actieReminderTemplate`), with the escaping of customer text from REV-014, typed parameters (`mail.types.ts`: `OrderMailInfo`, `ActieOrderMailInfo`, `ReminderMailInfo`) and the old code's undeclared globals (`html`, `producten`) declared.
- `src/mail/mail.service.ts`: `MailService` with the option builders (`orderWithQr` with the QR attachment, `order`, `passwordReset`, `feedback`, `actieReminder`: same senders, subjects, texts and attachments as before) and `send` (logs a failure without the mail body, answers true/false). The transport is injected (`MAIL_TRANSPORT`), so tests never send mail.
- `src/mail/mail.module.ts`: nodemailer SMTP transport from configuration.
- `env.validation.ts`: `MAIL_HOST` (default `smtp.hostnet.nl`, the old server's host), `MAIL_PORT` (default 587), optional `MAIL_USER`, `MAIL_PASS`.
- New dependencies (same libraries as the old server): `nodemailer`, `qrcode`, `he`, plus `@types/*`. No install scripts.

## Implementation decisions
- The HTML is not reformatted or "improved": the golden test compares it character by character with the old output.
- **One deliberate fix:** the old `orderedTemplate` built its closing HTML (`</td></tr></tbody></table></div>` and the shop footer) as a template literal statement that was never appended to `html` (a forgotten `html +=`), so order confirmation mails ended without closing tags and without the footer. The port appends it. The test asserts the new mail equals the old one plus exactly that tail.
- `process.env.BASE_URL` is still read inside the templates (as before). Passing the base URL in is noted in the backlog.
- Old `Logger` calls became Nest's logger; `setMailOptions`'s undeclared global `qrcode` is a local.

## Architectural decisions
Mail is a module of its own with an injectable transport; callers build the HTML with the body functions and hand the options to `MailService.send`.

## Tests added
`ServerNest`: 22 suites, 202 tests in total (18 new): `mail.service.spec` (builders, QR attachment is a PNG with the cid the HTML uses, reminder images, send success and failure), `test/mail-parity.spec` (all nine templates rendered with the old and the new code for sample orders containing hostile text: identical; `orderedTemplate` identical plus the restored tail), `env.validation.spec` (mail settings).

## Tests executed
`npm run typecheck`, `npm run lint`, `npm test` (202/202), `npm run build`. Not run: sending through a real SMTP server (by design).

## Known limitations
Mail is still sent inline by the callers (no queue or retry); see `docs/FUTURE_HARDENING.md`.

## Future work discovered
Send mail through a queue with retries; pass `BASE_URL` into the templates instead of reading the environment; the order confirmation now contains the footer (intended design, never seen by customers before).

## Summary
The e-mail layer is on the new server, proven identical to the old one except for one restored footer.
