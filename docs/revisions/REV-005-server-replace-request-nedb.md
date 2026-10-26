# REV-005 — Server: replace request-promise and nedb, fix cheerio usage

| Field  | Value                                              |
| ------ | -------------------------------------------------- |
| Date   | 2026-09-30                                         |
| Branch | `feature/rev-005-server-replace-request-nedb`      |
| PR     | #4                                             |
| Status | Merged (squash)                                    |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folder `Server` |

## What this revision does
Removes the deprecated `request`, `request-promise` and unmaintained `nedb`, and repairs the coop.nl scraper routes that used an API cheerio no longer has.

## Why this revision exists
`request`/`request-promise` are deprecated with no successor version; `nedb` is unmaintained. The scrapers called `$(selector, html)` (cheerio 0.x), which does not work on cheerio 1.x.

## What changed
- New `routes/middleware/fetch_html.js`: `fetch` based replacement for `rp(url)`, resolves the body text, rejects on non-2xx (as request-promise did).
- `routes/product/scanner.js`, `routes/site/site.js`: use `fetch_html`; `const $ = cheerio.load(html)` inside each live `.then`, and `$(sel, html)` -> `$(sel)` (also applied inside the existing commented-out blocks so they stay consistent).
- `scanner.js`: the `var length` line moved above its first use (it was hoisted as `undefined`, so `[length -1]` threw and the route's empty `.catch` swallowed it); removed the unused `nedb` require.
- `site.js`: `nedb` -> `@seald-io/nedb` (maintained fork, same API and file format).
- `package.json`: removed `request`, `request-promise`, `nedb`; added `@seald-io/nedb`. No install scripts.
- `routes/discounts/get_images.js` no longer needs `request` (already removed in REV-004).

## Implementation decisions
- DOM nodes from cheerio 1.x still expose `.children[0].data` and `.attribs`, so the selector code was kept as is.
- Helper lives in `routes/middleware/` next to `express_compat.js` (only place in this folder structure holding shared helpers).

## Architectural decisions
None.

## Tests added
`tests/fetch_html.test.js`: resolves body on 200, rejects on 404 (local http server, no network).

## Tests executed
- `npm test`: 5/5 pass. `npm ls` clean, no unreviewed install scripts, scratch copy loads all route/model files.
- Scratch check (not committed): scanner route run with `fetch` and the DB stubbed, against a fixture HTML page shaped like a coop.nl product page: parsed title/categories/image/price and built the INSERT correctly. `@seald-io/nedb` opened the real `productlinks.db` and read 13,504 docs.
- Not run: real coop.nl (site markup may have changed since these selectors were written), real DB.

## Known limitations
- The selectors target an old coop.nl layout; the scraper may return nothing on the current site.
- Scanner/site SQL is built by string concatenation (`req.body.ean`, scraped values) — to be fixed in the security revision.

## Future work discovered
- Add scraper SQL to the security revision (REV-007): parameterise `scanner.js` and `site.js` queries.

## Summary
Deprecated HTTP client and database packages replaced; scrapers work again against a fixture.
