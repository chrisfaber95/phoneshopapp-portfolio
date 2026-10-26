# REV-041 — Add the Employees app to the repository

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-041-add-employees-app`          |
| PR     | #40                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Employees` |

## What this revision does
The employee app (`Employees/`, package `winkeltool`, a Vue 3 app on Vue CLI 4.5) existed only as an untracked folder. It is added unchanged (235 files) so that it is versioned and can be upgraded in the next revisions.

## What was left out on purpose
- `.env` and `.env.development` (real values; the repository's `.gitignore` already ignores `.env` and `.env.*`). `Employees/.env.example` lists the variable names.
- `node_modules`.
Checked before adding: no private keys or credentials in the sources (the word "password" appears in the login forms and the NFC test screen only), the largest files are `package-lock.json` (1.1 MB) and a help GIF (1.8 MB).

## Tests
None (no code changed).

## Summary
The employee app is now part of the repository, without its local environment files.
