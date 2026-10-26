# REV-040 — NestJS: compatibility with the admin app (Employees)

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-040-admin-app-compat`           |
| PR     | #39                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folder `ServerNest` (worked in a git worktree) |

## What this revision does
I read every API call of the admin app (`Employees/`, "winkeltool") against the new server and fixed what would have broken it:
1. **Orders are addressed by their numeric id.** The app sends `PUT /order/<order.id>` with the numeric id (the old Server ignored the URL and used the `uuid_id` in the body). The order reference now accepts a plain number as the numeric id (a UUID is never all digits). Without this fix every `Update`, `Product` and `Storepayment` of the app would have answered "Order not found".
2. **Order lines without an id** in an `Update` are left out instead of being a 400 (new lines are added with the `Product` request).
3. **Order filters in bracket form.** The list filter is accepted as JSON text (`0[]={...}`, what axios 0.x sends, as the app does today) and also as bracketed fields (`0[0][filterType]=and&...`, what axios 1.x sends), so upgrading axios in the app does not break the lists.
4. `PUT /product` also accepts `{ product: { id, ... } }` (the app sends both forms).
5. An empty `password` in `PUT /user` means "not changed" (the old Server would have stored the hash of an empty password).

## What I checked and found compatible
Statuses and order fields the app writes (`picked`, `scanned`, `rejected`, `afgehaald`, `pickingtime`, `finalPrice`, `winkelbon`, `scanning_user`, `pickup_user`, `pickedup_time`, `pickup_confirm`, `id_check`) are all in the field whitelist of `Update`; the `Product` request fields match; actie order updates use the UUID; the list filters only use `and` and `notLike`; user create/update/NFC fields are allowed; `Authorization` carries the raw token (accepted).

## Still open for the admin app
- **`POST/DELETE /v2/timeslot` and `DELETE /v2/business_hours`** (used by the store settings screens) are not on the new server: see REV-037. They need the access rules to make those paths employee-only for POST/DELETE, a change I was not permitted to make.
- The app calls routes that never existed in the old server either: `PUT user/update/<id>`, `PUT user/forget`, `POST user/register`, `DELETE /user/<id>`, `GET /order/product/<id>`. They fail today as well.
- Actie order **delivery** (REV-032) is refused until its price rule is decided.

## Tests
`ServerNest`: 59 suites, 565 tests (+7). Typecheck and lint clean.

## Summary
The admin app's order, product and user calls work against the new server; the remaining gaps are listed above.
