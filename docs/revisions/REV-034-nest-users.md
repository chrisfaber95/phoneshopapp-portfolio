# REV-034 — NestJS employees (users)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-034-nest-users`                 |
| PR     | #33                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` (worked in a git worktree because another session used the main working tree) |

## What this revision does
Adds the employee management endpoints: `GET /user`, `GET /user/single/:id`, `GET /user/employ/:id`, `POST /user`, `PUT /user` (login was added in REV-019/020).

## Problems of the old endpoints, fixed here
1. `GET /user` sent every employee's password hash and stored access token (`include: all`) and accepted any column (also the hash) as a filter. Secrets are never sent or filterable.
2. `POST /user` and `PUT /user` wrote every field of the body (including `accessToken`, ids and timestamps) and took any password (empty, one character). Now a field whitelist, a password of at least 8 characters, an e-mail address that is lower-cased (the login looks it up that way), an existing role; the answer has no secrets. The old create crashed on a short name (it logged an undefined variable).
3. `GET /user/employ/:id` read a database view (`employersView`) that is not in the schema dump; it answers the employee with their role instead (`{ user: [record] }`).
4. Not carried over: `POST /user/register` (called a stored procedure that does not exist and never answered).

## Tests
`ServerNest`: +13 tests (`users.service.spec`). Parity on the Podman test database (`--spec users --fixtures auth.sql`): 5/5 identical. Typecheck, lint and the full suite pass.

## Known limitations
Any employee can create or change any other employee, including their role: there are no role-based rights yet (see `docs/FUTURE_HARDENING.md`).

## Summary
Employee management works on the new server without leaking or accepting unvalidated credentials.
