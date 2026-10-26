# REV-023 — NestJS product read side (products, search, discounts, product information)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-09-30                                   |
| Branch | `feature/rev-023-nest-product-read`          |
| PR     | #22                                       |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo (remote `chrisfaber95/phoneshopapp`), folders `ServerNest` and `parity` |

## What this revision does
The endpoints the shop front reads: product list, single product (with nutrition facts), product search, discounts, discount types, discount images and the product-information list.

## Why this revision exists
Next in the rewrite plan; this is the core of what customers browse, and the heaviest read path (the full product list is 26 MB).

## What changed
- `src/products/`: `ProductsService` (list with optional favorites, single, information list), `ProductSearchService`, `DiscountsService`, `ImagesService`, three controllers (`/api/v1/product`, `/api/v1/discounts`, `/api/v1/info`), `ProductsModule`, shared includes (`product-includes.ts`).
- Endpoints: `GET /product` (filter by any column; `customer_id` adds that customer's favorite mark), `GET /product/:ean` (answers the JSON value `null` for an unknown EAN, like the old server), `GET /product/search?search=&department_id=`, `GET /discounts?date=&customer_id=` (valid on a date, products in stock), `GET /discounts/types`, `GET /discounts/get_images` and `/get_images/:imgId`, `GET /info`.
- Search keeps the old ranking (product match 3x, product-information match 2.2x, at most 50; an EAN-8 matches exactly or by prefix, `code_128...` exactly; exactly one hit is followed by similar products by category and title) but with **bound parameters**; the old code built the text into the SQL.
- `src/common/paging.ts`: optional `?limit=&offset=` on `GET /product` (new, backward compatible: without them the whole list is answered as before).
- `parity/fixtures/products.sql` (a favorite for the test customer), `parity/specs/products.json` (24 requests).
- `test/helpers/init-models.ts` (models on an in-memory Sequelize for unit tests).

## Implementation decisions
- The discount image routes of the old server never answered (a database callback that was never called). They now answer what they were meant to: the list of image records, and one image file as base64 text with content type `image/jpeg` (the old route's intent). The file must be below `./public` (the path comes from the database), else 404. The table `Images` is empty in the test database, so only the list and the 404 were exercised live.
- Product information of a single product and of discounts is loaded without its additional information; the product list includes it (found by the parity run).
- Invalid filter columns / values answer 400 (the old server never answered).

## Architectural decisions
Related data is declared once (`product-includes.ts`) and composed per endpoint, mirroring the old associations and aliases, so the JSON shape is unchanged.

## Tests added
`ServerNest`: 20 suites, 184 tests in total (46 new): `paging.spec`, `products.service.spec`, `discounts.service.spec`, `product-search.service.spec` (bound parameters, EAN-8, code 128, department, no text, several hits, single hit + similar, single hit without information), `images.service.spec` (list, base64, path traversal, missing file), `test/products.e2e-spec` (route order `search` vs `:ean`, `null` body, discounts, images, bad image id).

## Tests executed
- `npm run typecheck`, `npm run lint`, `npm test` (184/184): clean.
- Parity on the Podman test database (`node parity/check.js --spec auth,reference-data,products --fixtures auth.sql,products.sql`): auth 12/12, reference-data 18/18, **products 24/24 identical** (full list of 12,304 products (26 MB), by department, by column, with customer favorites, single product with nutrition tree / with discount / plain / unknown EAN, search by text / brand / EAN-8 with similar products / department / no match / code 128 / a text with quote and `OR 1=1` / no text, discounts with and without date and customer, discount types, product information list). The first run had 2 differences (discounts loaded product information with its additional information); fixed.
- Not run: paging and the image file against the live database (unit tested; no image rows exist in the test database).

## Known limitations
- `GET /product` still answers the whole catalogue unless `limit`/`offset` are used; the Klant client does not use them yet (see `docs/FUTURE_HARDENING.md`).
- Discount image upload (`POST /discounts/images`) and all product writes come in the next revision.

## Future work discovered
Switch the Klant client to paged product requests; add caching headers for product images.

## Summary
The shop front's read endpoints run on the new server with identical answers, and search no longer builds SQL from user text.
