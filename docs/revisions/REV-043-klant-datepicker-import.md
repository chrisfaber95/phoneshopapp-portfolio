# REV-043 — Klant: fix the datepicker import broken by REV-002

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Date   | 2026-10-01                                   |
| Branch | `feature/rev-043-klant-datepicker-import`    |
| PR     | #42                                          |
| Status | Merged (squash)                              |
| Repo   | ShopApp git repo, folder `Klant` |

## What this revision does
Found while upgrading the Employees app (REV-042): `@vuepic/vue-datepicker` 14, which REV-002 installed in `Klant`, has no default export (its exports are `VueDatePicker`, `TZDate`, `WeekStart`). `Klant/src/views/Order.vue` (the checkout page: pickup date) and `Register.vue` (the birth date) imported the default, so the component was `undefined` after the upgrade. Both now use `import { VueDatePicker as Datepicker }`.

## Tests executed
`npm run build` of Klant: the warning "export 'default' was not found in '@vuepic/vue-datepicker'" is gone (build complete). Not verified in a browser. The build still warns about `import Vue from 'vue'` in five files (Vue 2 leftover; `Vue` is not used there, so it does no harm).

## Summary
The checkout and registration date pickers import the component the way version 14 exports it.
