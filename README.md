# IAS Console

A Next.js 15 + Tailwind CSS frontend for an ERP-style backend, built around
JWT auth issued by a centralized identity service. Fully responsive (mobile
drawer sidebar down to phone widths) with dark/light theme support.

## What's here

- **Split-screen login** (`/login`) — visually distinct from the rest of the
  app, built around an "issued access badge" motif. Its branding rail is
  pinned to the dark palette on purpose, regardless of the app's theme.
  Calls the auth service's login endpoint and stores the returned tokens.
- **Sidebar app shell** (`(app)` route group) — every main route (Dashboard,
  Inventory, Orders, Customers, Users, Roles, Tenants, Settings) lives behind
  a persistent left sidebar. On mobile it collapses into a hamburger-triggered
  slide-in drawer with a backdrop.
- **Route protection** via `middleware.ts`, which reads the `ias_token`
  cookie and redirects unauthenticated visitors to `/login`.
- **Two backend clients** (`src/lib/api.ts`): `authApi` for the centralized
  auth service and `erpApi` (aliased as `api`) for everything else. Both
  attach `Authorization: Bearer <accessToken>` and auto-unwrap the
  `{ success, message, data }` envelope.
- **Dark/light theme**, toggleable from the topbar or the login screen,
  persisted in `localStorage` with no flash on load.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point the two API URLs at your backends
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`.

## Backend contract

### Auth service (`NEXT_PUBLIC_AUTH_API_URL`, default `http://localhost:5000/api/v1`)

**`POST /auth/login`** — body `{ email, password }`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "2",
      "email": "sarahbakery@gmail.com",
      "firstName": "Sarah",
      "lastName": "Bakery",
      "roleId": "3",
      "roleName": "HR Admin",
      "roleCode": "HR_ADMIN",
      "roleScope": "PRODUCT",
      "roleScopeKey": "PRODUCT:HR",
      "companyId": "2",
      "company": { "id": 2, "name": "Sarah Bakery Limited", "code": "SBL", "...": "..." },
      "isActive": true
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}
```

The client stores `tokens.accessToken` (used for every subsequent request)
and `tokens.refreshToken` (kept in `localStorage`, not yet wired up to an
automatic refresh flow — see Notes below).

**`GET /auth/me`** — returns the current user, used to restore sessions on
reload. The client accepts either the user object directly under `data`, or
`data: { user: {...} }`.

### ERP backend (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/users` | `GET` | list users |
| `/api/roles` | `GET` | list roles |
| `/api/tenants` | `GET` | list tenants |
| `/api/inventory` | `GET` | list inventory items |
| `/api/orders` | `GET` | list orders |
| `/api/customers` | `GET` | list customers |

Each resource page falls back to sample data if the request fails, so the UI
stays presentable while you build out the backend routes — swap the fallback
arrays out once your endpoints are live. Shared types for every entity live
in `src/lib/types.ts`.

## Notes

- The access token is kept in `localStorage` for the API clients and
  mirrored into a cookie so `middleware.ts` can gate routes at the edge.
- Automatic token refresh isn't wired up yet — `getRefreshToken()` in
  `src/lib/api.ts` exposes the stored refresh token if you want to add a
  401-triggered refresh flow.
- Tailwind tokens (colors, fonts) live in `tailwind.config.ts`, sourced from
  CSS variables in `globals.css` so the dark/light themes can swap them at
  runtime via a `data-theme` attribute.
