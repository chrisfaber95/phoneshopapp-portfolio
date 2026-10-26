# REV-010 — Untrack .env files (Server and Klant)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-010-untrack-env-files`          |
| PR     | #9                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `Server` and `Klant` |

## What this revision does
Stops tracking `Server/.env`, `Klant/.env` and `Klant/.env.development`, ignores env files from now on, and adds `Klant/.env.example` (next to the `Server/.env.example` from REV-009).

## Why this revision exists
`Server/.env` held real values (database, Mollie live key, mail password, `TOKEN_KEY`) and was committed since the first commit; `Klant/.env*` were tracked too.

## What changed
- `git rm --cached` on the three files. The files stay on disk.
- Root `.gitignore` and `Server/.gitignore`: `.env`, `.env.*`, `!.env.example`.
- New `Klant/.env.example` with the variable names the client reads (`VUE_APP_API`, `VUE_APP_PUBLIC_API_KEY`, `VUE_APP_BAGEAN`, `VUE_APP_BAGAMOUNT`), no values, with a note that `VUE_APP_*` values end up in the browser bundle.

## Implementation decisions
- Env values were not read or printed; only variable names were listed to write the example file.
- Klant's `.env` files are usually committed in Vue CLI projects when they hold no secrets, but `VUE_APP_PUBLIC_API_KEY` and the API URL are environment specific, so they were untracked as requested.

## Architectural decisions
None.

## Tests added
None (repository configuration only).

## Tests executed
- `git check-ignore`: `Server/.env`, `Klant/.env`, `Klant/.env.development` ignored; both `.env.example` files are not.
- `git status`: the three files show as deleted in the index and remain present in the working tree.

## Known limitations
- **Deployments that update with `git pull` will delete their `.env` when they pull this change** (git removes files that a commit deletes). Before pulling on any server or build machine: copy `Server/.env` (and `Klant/.env*` if the client is built there) to a safe place, pull, put it back. Clone/build machines need their own `.env`, created from `.env.example`.
- The old values remain in git history and on GitHub. They should be treated as exposed: **rotate** the database password, the Mollie live and test API keys, the mail password and `TOKEN_KEY` (rotating `TOKEN_KEY` logs everyone out). Purging the history (filter-repo) is optional and would rewrite every commit.

## Future work discovered
- CI for Klant builds will need the `VUE_APP_*` variables provided as environment variables or secrets.

## Summary
Env files are no longer versioned, the required variables are documented in two `.env.example` files, and the exposed credentials are listed for rotation.
