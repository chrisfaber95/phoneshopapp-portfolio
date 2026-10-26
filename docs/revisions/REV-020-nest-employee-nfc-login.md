# REV-020 — Employee NFC card login

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-020-nest-employee-nfc-login`    |
| PR     | #19                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
Adds login with an NFC card for employees to `POST /api/v1/user/login`, which REV-019 had left out pending a decision.

## Why this revision exists
The owner confirmed that NFC is an employee feature. In the old server it never worked (it searched non-existent attributes `nfcToken`/`nfcSerial`, then compared a missing password and crashed the request).

## What changed
- `ServerNest/src/auth/user-auth.service.ts`: body `{ tag, serial }` without e-mail logs an employee in when `User.nfc_token = tag` **and** `User.nfc_serial = serial` (both must match exactly). No password. The answer is the same `{ user }` as the password login (role included, no password), the token is issued and saved the same way. Customers are unchanged: they have no NFC columns, so the customer endpoint answers "Verkeerde gegevens ingevoerd" for a card.
- Rules: tag and serial must be non-empty text (numbers, objects such as `{ "$ne": "x" }`, blank strings never reach the database); a tag without serial gives "Alle velden moeten zijn ingevuld." like the old check; an e-mail without a password never falls back to the card; card logins are logged with the employee id (never the tag).
- `parity/fixtures/auth.sql`: the test employee now has a card (`PARITYNFC01` / `PARITYSER01`).
- Tests: the "not offered" test became an NFC block.

## Implementation decisions
- The card is a password-less credential, so a card that is lost must be deactivated by clearing `nfc_token`/`nfc_serial`; there is no rate limiting yet (planned with the hardening step of the rewrite).
- The old check `!(tag, serial)` (which only looks at `serial`) is kept so the same requests get the same "incomplete" answer.

## Architectural decisions
None.

## Tests added
`user-auth.service.spec.ts`: card login success (both fields in the query, no password in the answer, token saved), unknown card, tag without serial / empty tag / blank serial / non-text tag / non-text serial (no database access), e-mail without password does not use the card, e-mail + password ignores the card. 115 tests in total.

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test`: clean, 115/115.
- Live on the Podman test database (new server only, because the old one crashes on cards): right tag and serial: employee with role, no password in the answer; wrong serial, wrong tag, operator object as tag: "Verkeerde gegevens ingevoerd"; tag only: "Alle velden moeten zijn ingevuld."; the employee card on the customer endpoint: "Verkeerde gegevens ingevoerd". A token from a card login is accepted by the old server (`/userroles` 200).
- Parity of the 12 password login cases re-run with the changed fixture: 12 same, 0 different. Test accounts removed afterwards (0 left).
- Not run: a physical NFC reader.

## Known limitations
No rate limiting on logins. The tag/serial are stored in plain text in the existing columns (as before).

## Future work discovered
Rate limiting and lockout for logins; a way for the admin app to register or revoke cards.

## Summary
Employees can log in with their NFC card on the new server; the old server's broken card login is replaced by a working, strict one.
