# REV-053 — ServerNest images folder from `IMAGES_DIR`

| Field  | Value                              |
| ------ | ---------------------------------- |
| Date   | 2026-10-02                         |
| Branch | `feature/rev-053-images-dir`       |
| PR     | #52                                |
| Status | Merged                             |

Repo touched: root repo (`ServerNest/`).

## What this revision does
ServerNest takes the folder of its product, discount and savings-action images from the optional environment variable `IMAGES_DIR`. When it is not set, the folder is still `./public` next to where the server was started, so nothing changes by default.

## Why this revision exists
The images of the shop live in `Server/public`, but ServerNest only looked in `ServerNest/public`. For local development that needed a Windows junction (REV-052 follow-up), which is not in git and has to be recreated on every machine. In production the images should also be able to live outside the app folder.

## What changed
- `src/common/images.ts`: new `imageRoot()` (`IMAGES_DIR` resolved against the working directory, else `./public`); `saveImage` uses it as its default root.
- `src/main.ts`: serves `/api/back-images/` from `imageRoot()`.
- `src/product-admin/product-admin.service.ts`, `src/products/images.service.ts`: save and read below `imageRoot()`. Paths stored in the `Images` table stay `public/sales/uploads/<file>`; the leading `public/` is dropped when the file is looked up.
- `src/config/env.validation.ts`: `IMAGES_DIR` is an optional validated variable. This is required, not cosmetic: `ConfigModule` only copies validated variables into `process.env`, so an unvalidated `IMAGES_DIR` never reached `imageRoot()` (found by the smoke test).
- `.env.example`: documents `IMAGES_DIR`.

## Implementation decisions
One helper reading `process.env` instead of injecting `ConfigService` into four classes: the services take their root as a plain default argument today (and tests pass their own), so no constructor or test setup had to change.

## Architectural decisions
None beyond the above; the images folder is now configuration instead of a hard-coded path.

## Tests added
- `imageRoot`: default `./public`, and `IMAGES_DIR` resolved against the working directory.
- `ImagesService.base64` reads below `IMAGES_DIR` and no longer finds files in `./public`.
- `validateEnv`: reads `IMAGES_DIR`; empty means unset (and the existing full-object expectation).

## Tests executed
In `ServerNest`: `npm run typecheck`, `npm run lint`, `npm test` (59 suites, 569 tests), `npm run build`: all pass. CI on the PR.
Smoke test: with the junction removed and `IMAGES_DIR=../Server/public` in `.env`, the built server answered 200 for `/api/back-images/products/10010-base.jpg`.

## Known limitations
- The old `Server` is unchanged (it still serves `./public`).
- Not run against the parity harness; the change does not touch any response shape.

## Future work discovered
None.

## Summary
The images folder of ServerNest is configurable with `IMAGES_DIR`; the local junction is no longer needed.
