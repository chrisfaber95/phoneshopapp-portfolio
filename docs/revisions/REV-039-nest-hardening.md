# REV-039 — NestJS hardening: rate limits, security headers, CORS, proxy

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-039-nest-hardening`             |
| PR     | #38                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folders `ServerNest` and `parity` (worked in a git worktree) |

## What this revision does
Adds the protections the old server never had, in the form of settings that keep today's behaviour unless set:
- **Rate limits** (`@nestjs/throttler`): 300 requests a minute per client address for every route; 10 a minute (`@Strict()`) for employee and customer login, customer sign-up, password reset, guest checkout (`POST /order`, `POST /actie_order`), job applications and the feedback form. Health check and the Mollie webhook are exempt. `RATE_LIMIT=off` switches them off.
- **Security headers** (`helmet`), with the images still embeddable by the shop front on another origin.
- **`CORS_ORIGINS`**: a comma separated list restricts the browser origins; unset keeps "every origin" like the old server.
- **`TRUST_PROXY`**: behind a reverse proxy, the real client address comes from `X-Forwarded-For` (number of proxies). Without it every visitor would share the proxy's address and one limit.
- The parity harness switches the limits off (`parity/safe-env.js`): it sends many logins from one address.

## Dependencies
`@nestjs/throttler` ^6.7 (official Nest package) and `helmet` ^8.3 (the standard Express security-header package). Neither has install scripts (`npm approve-scripts --allow-scripts-pending` found nothing).

## Tests
`ServerNest`: 59 suites, 559 tests (+4): `test/rate-limit.e2e-spec.ts` (the 11th login request in a minute answers 429 with a `Retry-After` header, other routes stay available, SkipThrottle, switch-off), env settings. **Live run of the built server**: security headers present, no `X-Powered-By`, CORS allowed only for the configured origin, 12 logins from one address answer 200 ×10 then 429, another address is still answered.

## Notes for the cutover
Set `TRUST_PROXY` to the number of proxies in front of the server, and `CORS_ORIGINS` to the shop front and admin app origins, before going live. The Klant and admin apps should handle HTTP 429 (they show their generic error).

## Summary
The server is protected against login guessing and order/applicant spam, and no longer advertises itself; nothing changes for the clients until the settings are used.
