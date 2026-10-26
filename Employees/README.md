# Employees (winkeltool / administratie)

The employee app of the shop: picking and scanning orders, the checkout scanner, pick-up and delivery screens, savings-action
orders, product and account management, store settings. It talks to the Server API (`/api/v1` and `/api/v2`) with the token of
the logged-in employee.

## Setup
```
npm install
cp .env.example .env               # production build
cp .env.example .env.development   # npm run serve
```
Fill in `VUE_APP_API` (the Server URL with a trailing slash). The `.env` files are never committed.

```
npm run serve    # development server with hot reload (https)
npm run build    # production build
npm run lint
```

## Status
Added to the repository in REV-041 as it was (Vue CLI 4.5 / Vue 3). Dependency upgrade: see the revision documents.
