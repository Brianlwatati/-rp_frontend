# IAS Console

A Next.js 15 + Tailwind CSS frontend for `erp_backend`, built around JWT
auth issued by a centralized identity service (IAS). Fully responsive
(mobile drawer sidebar) with dark/light theme support.

## What's here

- **Split-screen login** (`/login`) — visually distinct from the rest of
  the app. Its branding rail is pinned to the dark palette on purpose,
  regardless of the app's theme.
- **Sidebar app shell**, grouped as Operations (Dashboard, Inventory,
  Sales, Purchasing, Contacts), Finance & HR, and Access (Roles,
  Branches) — matching `erp_backend`'s actual modules, see below.
- **Printable receipts** — `src/components/receipts/ReceiptDocument.tsx`
  is one shared, print-friendly document reused for sales order
  confirmations, invoices, and purchase orders. It always renders in the
  light palette (`data-theme="light"` scoped to just that subtree) so it
  looks right on paper regardless of the app's current theme, and hides
  all app chrome (`.no-print`) when you hit Print.
- **Route protection** via `middleware.ts`, reading the `ias_token` cookie.
- **Two backend clients** (`src/lib/api.ts`): `authApi` for the centralized
  auth service and `erpApi`/`api` for `erp_backend`. Both attach
  `Authorization: Bearer <accessToken>`, auto-unwrap the
  `{ success, message, data }` envelope, and `describeApiError()` turns a
  422's zod `errors.fieldErrors` into a readable message instead of just
  showing the generic "Invalid input".

## Routes ↔ backend modules

| Frontend route | Backend module | Notes |
|---|---|---|
| `/inventory/products` (+ `new`, `[id]/edit`) | `inventory` | SKU is immutable after creation; status/archive via `PATCH` or `POST /:id/archive` |
| `/inventory/warehouses` (+ `new`) | `inventory` | **List + create only** — no update endpoint |
| `/inventory/stock` (+ `movements`, `transfers`, `count`) | `inventory` | Levels, valuation, low-stock; movement creation calls `POST /stock/adjust` (`RECEIVE`/`SALE`/`ADJUSTMENT` only) |
| `/sales` (+ `new`, `[id]`) | `sales` | List + a document/receipt detail page with Confirm → Ship → **Create invoice** actions |
| `/purchasing` (+ `new`, `[id]`) | `purchasing` | List + a document/receipt detail page with Approve → Receive actions |
| `/contacts` (+ `new`, `[id]/edit`) | `contacts` | No `GET /contacts/:id` — edit page fetches the list and filters client-side |
| `/finance/invoices` (+ `new`, `[id]`) | `finance` | The customer-facing **receipt**: `[id]` renders it via `ReceiptDocument`. "New" generates one from a confirmed/shipped sales order (`POST /invoices/from-order/:orderId`) |
| `/finance/receivables` | `finance` | Open/partially-paid invoices with outstanding balance |
| `/finance/payments/new` | `finance` | Records a payment with allocations across one or more invoices — **form only**, the backend has no `GET` for payments, so there's no history list |
| `/hr/employees` (+ `new`) | `hr` | |
| `/hr/attendance` | `hr` | Inline clock-in/out form (upserts by employee + date) above the ledger |
| `/hr/leave` (+ `new`) | `hr` | Requests with inline Approve |
| `/hr/payroll` | `hr` | Calculates a run for every active employee and shows the gross/deductions/net result — **form only**, no run-history endpoint exists |
| `/roles` (+ `new`, `[id]/edit`) | `roles`, `permissions` | Code is immutable after creation; edit page includes a permission matrix (`GET /permissions` catalog × `GET/PUT /roles/:id/permissions`), grouped by module with a select-all-in-module checkbox |
| `/branches` (+ `new`) | `branches` | **List + create only** — no update endpoint |
| `/dashboard` | `reporting`, `sales` | Single call to `GET /reporting/dashboard` for the summary cards |

**Not wired up** (backend modules that exist but have no frontend yet):
`workflow`, `audit-log`, `provisioning`, `permissions` (catalog only — see
below), `role-assignments`, `approval-limits`, `approval-delegations`.
There's also no standalone "Users" page — `erp_backend` doesn't own a user
list (that's IAS's job).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point the two API URLs at your backends
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`.

## Backend contract

### Auth service (`NEXT_PUBLIC_AUTH_API_URL`, default `http://localhost:5000/api/v1`)

**`POST /auth/login`** — body `{ email, password }` → `{ success, message, data: { user, tokens } }`, where `tokens` is `{ accessToken, refreshToken, expiresIn }`.

**`GET /auth/me`** — returns the current user under `data`, used to restore sessions on reload.

### erp_backend (`NEXT_PUBLIC_API_URL`, default `http://localhost:4100/api/v1`)

Every module is scoped to the company on the JWT (`req.auth.companyId`) —
there's no tenant switching to build; a signed-in user only ever sees their
own company's data. Numeric fields (prices, quantities) come back as
strings from Postgres but are sent as numbers on create/update — see the
comments in `src/lib/types.ts` for which is which. Also worth knowing:
`inventory`/`roles`/`branches`/`contacts` return camelCase JSON, while
`sales`/`purchasing`/`finance`/`hr` return snake_case (`SELECT *` on the
base tables) with a handful of camelCase joined-in name fields
(`customerName`, `supplierName`, etc.) — the types in `src/lib/types.ts`
reflect this split rather than normalizing it away.

Fallback sample data is baked into each page so the UI stays presentable
before your backend is running — swap it out once real data is flowing.

## Notes

- The access token is kept in `localStorage` and mirrored into a cookie so
  `middleware.ts` can gate routes at the edge.
- Automatic token refresh isn't wired up yet — `getRefreshToken()` in
  `src/lib/api.ts` exposes the stored refresh token if you want to add a
  401-triggered refresh flow.
- Tailwind tokens (colors, fonts) live in `tailwind.config.ts`, sourced from
  CSS variables in `globals.css` so the dark/light themes can swap them at
  runtime via a `data-theme` attribute.
