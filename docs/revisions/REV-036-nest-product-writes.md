# REV-036 — NestJS product maintenance (admin)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-036-nest-product-writes`        |
| PR     | #35                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folder `ServerNest` (worked in a git worktree) |

## What this revision does
Adds `PUT /product`, `POST /product/post`, `DELETE /product/delete/:id`, `POST /product/scanner` and `POST /product/update_images` (employees only: the access rules' default).

## Dependency
`sharp` ^0.35.5 (image scaling; same version as the old Server). Mature, prebuilt binaries via optional packages, no install scripts (`npm approve-scripts --allow-scripts-pending` found nothing to review). Needs about 100 MB in `node_modules`.

## Problems of the old endpoints, fixed here
1. `PUT /product` wrote any key of the body. Now the columns of the Product table except id and EAN, scalar values only.
2. `POST /product/post` never answered (it returned a variable that did not exist) and set the "previous price" to the new price (the column does not exist). Now: create or refresh by EAN in one transaction (product, information, additional information only when there is none yet), answer `{ id, ean, created }`.
3. `DELETE /product/delete/:id` ran an unrelated query against a database that does not exist and crashed. Now it deletes a product that no (actie) order refers to and answers `{ err }` for one that is in use. Products have no soft delete in this schema, so a delete is permanent.
4. `POST /product/update_images` sent two answers, wrote a PNG into a `.jpg` file and used the `id` from the client to find the record. Now: type and first bytes checked (5 MB), scaled into a white 1000x1000 square, saved as a real jpeg named by the digits-only EAN, the information record of that EAN gets the URL, one answer.
5. `POST /product/scanner` updates stock and shelf place of a known product (as before). **Not carried over:** the scraper that fetched unknown EANs from coop.nl and inserted them with columns the Product table no longer has (it could not work with the current schema); new products are created with `POST /product/post`. Say so if the scraper should come back (it would need `cheerio` and a fragile dependency on the website's HTML).

## Tests
`ServerNest`: 54 suites, 528 tests (+22): `product-admin.service.spec` (whitelist, create/refresh, delete rules, scanner, image processing with the real sharp: result is a 1000x1000 jpeg, bad inputs write nothing), access rules test. Typecheck and lint clean.
**Live run on the Podman test database** (rows and files removed afterwards): customer 403, create then refresh by EAN without duplicate rows, PUT ignores `ean`/unknown keys, scanner, image saved as 1000x1000 jpeg with the URL on the information record, path-trick EAN 400, delete. The live run also showed that deleting a product removes it for real: the product I used as a test row (28903, unused in orders) was deleted from the test database and restored from the original dump (12304 products again).

## Summary
Product maintenance works on the new server; the endpoints that crashed or lied now do what they were meant to do.
