# REV-011 — Server: dedupe the auth modules

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-011-dedupe-auth-modules`        |
| PR     | #10                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
`config/authentication.js` and `config/customer_authentication.js` were identical except one line (`user.user_id` vs `user.customer_id`). The token signing now lives in one place.

## Why this revision exists
Follow-up noted in REV-009 (duplicated code). Also gives the login token its first tests.

## What changed
- New `config/token.js`: `signToken(user, userId, duration = '20h')` signs `{ user_id, email }` with `TOKEN_KEY`, stores it on `user.accessToken`, saves the user and returns the token.
- `config/authentication.js` and `config/customer_authentication.js` are now two-line wrappers that pass `user.user_id` / `user.customer_id`. Same export (`sign_token`), same path, so `routes/user/login.js` and `routes/customer/login.js` are unchanged.
- Removed from those files: the unused `Logger` import and the empty, unexported `hash_password`.
- `user.save()` is now awaited (it was fire and forget, so a failed save was an unhandled promise rejection).

## Implementation decisions
Kept both module paths and the `sign_token(user, duration)` signature to keep callers untouched.

## Architectural decisions
None.

## Tests added
`tests/token.test.js` (4 tests): user token claims and save, customer token uses `customer_id`, default 20h / custom lifetime, wrong key does not verify.

## Tests executed
`npm test`: 20/20 pass. All 201 files load against the real config. Not run: a real login against the database.

## Known limitations
The only behaviour change is that the token is returned after `save()` has finished (`await`).

## Future work discovered
`priceCalculations` and `mailing.js` still have no tests (next revision).

## Summary
One token signer instead of two copies, covered by tests.
