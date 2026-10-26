# REV-052 — Klant loads images from the configured API host

| Field  | Value                                |
| ------ | ------------------------------------ |
| Date   | 2026-10-02                           |
| Branch | `feature/rev-052-klant-image-host`   |
| PR     | #51                                  |
| Status | Merged                              |

Repo touched: root repo (`Klant/src`).

## What this revision does
Product, receipt, cart and savings-campaign (spaaractie) images in Klant are loaded from the host in `VUE_APP_API` instead of a hard-coded `https://www.cooplubbers.nl`.

## Why this revision exists
With `npm run serve` against a local ServerNest, the shelf showed broken images because 21 components built image URLs for the live shop. A development client could only show images the live shop happened to have.

## What changed
- `Klant/src/main.js`: global property `$imageHost` = `VUE_APP_API` without its trailing slash.
- 21 components: `https://www.cooplubbers.nl` in image `src` bindings replaced by `${$imageHost}`.
- `actieshopPage/ShoppingCart.vue` built its URL as `cooplubbers.nl${...}` (no scheme, so it resolved relative to the page); it now uses `$imageHost` as well.

## Implementation decisions
A global property was chosen over a per-component import because the templates mix Options and Composition API components and the change is a one-token replacement. Production is unchanged: `.env` sets `VUE_APP_API=https://www.cooplubbers.nl/`, so `$imageHost` is the same host as before.

The cookie `domain: 'cooplubbers.nl'` entries and the contact e-mail address are not image URLs and were left alone.

## Architectural decisions
None. The API host stays configured in one place (`VUE_APP_API`).

## Tests added
None. Klant has no unit-test setup; the change is a URL prefix in templates. Not covered by Cypress.

## Tests executed
- `npm run lint` (Klant): clean.
- `npm run build` (Klant): passes.
- Manual: local ServerNest returns 200 for `/api/back-images/products/<ean>-base.jpg`.
CI on the PR.

## Known limitations
- The local ServerNest serves images from `ServerNest/public`, which does not exist in the repo. For local development it is a Windows junction to `Server/public` (not committed, listed in `.git/info/exclude`).
- Products whose `imgurl` is missing in the local database still show no image.

## Future work discovered
- ServerNest could take the image folder from an environment variable instead of always using `process.cwd()/public`.

## Summary
Images follow `VUE_APP_API`, so a development client shows the images of the server it talks to.
