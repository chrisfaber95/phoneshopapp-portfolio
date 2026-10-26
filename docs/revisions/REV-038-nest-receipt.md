# REV-038 — NestJS receipt PDF

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-038-nest-receipt`               |
| PR     | #37                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folder `ServerNest` (worked in a git worktree) |

## What this revision does
Adds `GET /order/receipt/:orderRef` (`?first=1` for the invoice of the first payment): the receipt/invoice as a PDF, with the shop details from the store database (REV-037).

## Dependencies
`pdfmake` ^0.3.11 and `bwip-js` ^4.11.4: the versions the old Server uses (REV-006), mature libraries, no install scripts to review (`npm approve-scripts --allow-scripts-pending` found nothing). pdfmake ships no types; `src/types/pdfmake.d.ts` declares only what is used.

## What changed
- `src/receipts/receipt-document.ts`: the document builder and the row/total calculations, ported 1:1 from `Server/routes/order/receipt_document.js` and the totals function of `receipt.js` (now a pure function).
- `ReceiptService` (loads the order, the shop, the barcode and the logo, renders), controller, module.
- `RECEIPT_SHOP_ID` setting: the old server had the id of the shop hardcoded in the code. Default: the first shop of the store database. Without a store database (`SHOPS_DB_NAME=off`) the receipt has no shop details.

## Differences from the old route (on purpose)
1. The order may be given as UUID or as the encrypted reference of the mail links; an unknown order is a 404 (the old route sent the error object).
2. Only the shop's id, name, information and address are read from the store database, never the access data of its main database.
3. The logo is fetched with a 5 second timeout, only from http(s) and up to 2 MB (the address comes from the database).
4. A stored price that is equal to the discounted price (a decimal from the database against a number) no longer counts as a discount of 0.00 shown as a discount line: both are compared as numbers (the old loose comparison compared text with a number).

## Tests
`ServerNest`: 58 suites, 555 tests (+15): the ported receipt tests, totals/VAT/deposit tests, `receipt.service.spec` (renders real PDFs from mocked data: UUID, encrypted reference, first payment, 404s, shop configured/first/missing/failing, no database credentials read), and `test/receipt-parity.spec.ts`, which builds the rows, lines and complete document definition for 200 generated orders with the old and the new code and compares them (identical).
**Live run** on the Podman test database with the rebuilt `shops` database: a real order with 45 lines renders a 42 KB PDF, the first-payment invoice 22 KB, an unknown order 404. (I could not view the PDF in this environment because no PDF renderer is installed; its content is covered by the document-parity test.)

## Summary
Receipts and invoices can be downloaded from the new server, with the same layout as before and no hardcoded shop.
