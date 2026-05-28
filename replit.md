# NexusPortal

A full-stack Angular 18 enterprise SPA with role-based access control, async API simulation, and admin user management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, serves `/api`)
- `pnpm --filter @workspace/angular-app run dev` — run the Angular SPA (port 24842)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- **Frontend**: Angular 18, standalone components, Angular Material, RxJS, Angular Router
- **Backend**: Node.js / TypeScript, Express 5, pino logging
- **Storage**: In-memory (Map-based) user and session store for demo purposes
- **Build**: Angular CLI (esbuild-based application builder)
- **Workspace**: pnpm workspaces, Node.js 24, TypeScript

## Where things live

- `artifacts/angular-app/src/app/` — Angular app root
  - `core/services/` — AuthService, RecordsService, UserService
  - `core/interceptors/` — HTTP auth interceptor (injects Bearer token)
  - `core/guards/` — auth.guard.ts, admin.guard.ts
  - `core/models/` — user.model.ts, record.model.ts
  - `pages/login/` — Login page component
  - `pages/dashboard/` — Dashboard with records table + async delay slider
  - `pages/admin/` — Admin user management (CRUD)
- `artifacts/api-server/src/routes/` — Express route files
  - `auth.ts` — login / logout / me + in-memory user store
  - `records.ts` — user records with optional `?delay=N` parameter
  - `users.ts` — admin-only CRUD for user management

## Demo Credentials

| Role | User ID | Password |
|------|---------|----------|
| Admin | `admin` | `admin123` |
| General User | `alice` | `user123` |
| General User | `bob` | `user123` |
| General User | `carol` | `user123` |

## Product

- **Login page**: User ID + password + role selector (General User / Admin). Backend validates role match against stored user role.
- **Dashboard**: Shows logged-in user's profile, stats, and a records table. General Users see only their own records; Admins see all records. Includes an async delay slider (0–5000ms) to demonstrate observable async processing with a shimmer loading skeleton.
- **Admin panel**: Full CRUD user management table with create/edit dialog and delete confirmation. Only accessible to Admin role (route guard enforced).
- **Auth**: Token-based session via HTTP Authorization header, persisted in localStorage. Auto-logout on 401.

## Architecture decisions

- Angular 18 standalone components — no NgModules, clean tree-shaking and lazy loading
- Angular signals for reactive state (no NgRx boilerplate for this scale)
- Functional HTTP interceptor to inject Bearer tokens on every request
- Functional route guards (`authGuard`, `adminGuard`) for protected pages
- In-memory user/session store in backend (no DB needed for demo, easily swappable for Postgres/DynamoDB)
- Records API supports `?delay=N` query parameter to simulate async API latency
- TypeScript strict mode across both frontend and backend

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Angular CLI startup will prompt for analytics consent — always set `NG_CLI_ANALYTICS=false` in the dev script
- `allowedHosts` in angular.json must be an array (e.g. `["all"]`), not a string
- The Angular 18 `application` builder (Vite-based) ignores `allowedHosts` entirely — use the `browser` builder (`@angular-devkit/build-angular:browser`) with `dev-server` instead, which properly respects `"allowedHosts": ["all"]`
- Run `pnpm install` from the `artifacts/angular-app` directory if Angular packages are missing

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
