# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Life OS is a personal productivity platform with a .NET 10 REST API backend and a React + TypeScript frontend. It manages tasks, daily journals, receipts, bills and transactions for a signed-in user. English and Arabic (RTL) are both supported.

## Commands

### First-time setup

1. Start SQL Server (Docker container named `sqlserver`, port 1433): `docker start sqlserver`
2. `PersonalLifeOS.API/appsettings.Development.json` holds the connection string and JWT key (tracked in this private repo; `appsettings.Development.example.json` shows the shape for a fresh setup). The API refuses to start without them.
3. Apply migrations (below), then run the API and the frontend.

### Backend (.NET API)

```bash
# Build entire solution
dotnet build PersonalLifeOS.slnx

# Run the API (runs at http://localhost:5207, Swagger UI at root)
cd PersonalLifeOS.API && dotnet run

# Add a new EF Core migration
cd PersonalLifeOS.Infrastructure && dotnet ef migrations add <MigrationName> --startup-project ../PersonalLifeOS.API

# Apply migrations (not applied automatically on startup)
cd PersonalLifeOS.Infrastructure && dotnet ef database update --startup-project ../PersonalLifeOS.API
```

### Frontend (React + Vite)

```bash
cd frontend

npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:5173)
npm run build      # Type-check and build — must pass before committing
npm run lint       # ESLint — must pass before committing
```

The API origin defaults to `http://localhost:5207`; override with `VITE_API_URL` in `frontend/.env.local` (see `.env.example`).

## Architecture

### Solution Structure

```
PersonalLifeOS.Domain/          # Entities, enums, IUserOwnedEntity — no dependencies on other layers
PersonalLifeOS.Application/     # DTOs with validation attributes, ApiResponse<T>
PersonalLifeOS.Infrastructure/  # EF Core DbContext, repositories, services, file storage, Identity, JWT
PersonalLifeOS.API/             # ASP.NET Core Web API — thin controllers, global error handling
frontend/                       # React SPA
```

**Note:** Services live in `PersonalLifeOS.Infrastructure/Services/` rather than the Application layer. Repositories and services are concrete classes registered directly in `Program.cs`.

### Backend Key Conventions

- **User scoping:** Every entity implements `IUserOwnedEntity`. Repositories derive from `UserOwnedRepository<T>`, whose queries always filter by `UserId` and exclude soft-deleted rows, so `GetByIdAsync(id, userId)` returns null for another user's record (→ 404). Never query a `DbSet` without going through `Active(userId)`.
- **StatusCode pattern:** Entities use a string `StatusCode` instead of boolean flags. Always use the constants in `GeneralStatuses` (`PENDING`, `COMPLETED`, `PAID`, `ACTIVE`, `DELETED`, `CANCELLED`), never string literals. The frontend mirrors them in `frontend/src/types/status.ts`.
- **Status changes go through dedicated endpoints** (`/complete`, `/uncomplete`, `/pay`, `/unpay`). Update DTOs deliberately have no `StatusCode`, so clients can't set arbitrary values.
- **Soft deletes:** `SoftDeleteAsync` sets `StatusCode = DELETED`; deleting a receipt also deletes its image file.
- **Audit fields:** `CreatedBy/CreatedDate/UpdatedBy/UpdatedDate`, set by the repository in UTC.
- **Validation:** Use data annotations on DTOs (amounts use `[Range]` with `ValidationLimits`). Invalid models are answered automatically with an `ApiResponse` 400 — don't add manual `ModelState` checks.
- **Errors:** Don't catch exceptions in controllers. `ApiExceptionHandler` maps `KeyNotFoundException` → 404, `ValidationException` → 400, anything else → generic 500 (logged, message not exposed).
- **API response wrapper:** All JSON endpoints return `ApiResponse<T>`. Controllers derive from `BaseApiController` (adds `[Authorize]`, route, `CurrentUserId`, `Success(...)` helpers).
- **Receipt images are private:** stored via `IFileStorage` (`LocalFileStorage` under `PersonalLifeOS.API/App_Data/receipts` by default, or private Google Drive with `Storage:Provider = GoogleDrive`) and only served through `GET /api/receipts/{id}/image` to the owner. Allowed types/size are in `ImageFileRules`.
- **Auth:** JWT settings are bound to `JwtSettings`; tokens are created by `JwtTokenService`. Accounts lock for 5 minutes after 5 failed logins (login returns 423).

### API Endpoints

All except auth require a Bearer token.

- `POST /api/auth/register` (409 if the email exists), `POST /api/auth/login` (401 bad credentials, 423 locked)
- `GET /api/dashboard`
- `GET|POST /api/tasks`, `GET|PUT|DELETE /api/tasks/{id}`, `POST /api/tasks/{id}/complete|uncomplete`
- `GET|POST /api/bills`, `GET|PUT|DELETE /api/bills/{id}`, `POST /api/bills/{id}/pay|unpay`
- `GET|POST /api/journal`, `GET|PUT|DELETE /api/journal/{id}`
- `GET|POST /api/transactions`, `GET|PUT|DELETE /api/transactions/{id}`
- `GET|POST /api/receipts` (POST is multipart with `imageFile`), `GET|PUT|DELETE /api/receipts/{id}`, `GET|PUT /api/receipts/{id}/image`

### Frontend Key Conventions

- **State management:** Zustand stores in `src/stores/` — `authStore` (user/JWT), `themeStore` (dark mode, applied before first render), `sidebarStore`, `ramadanStore` (auto-on during Ramadan via the Islamic calendar).
- **API client:** Axios instance in `src/services/api.ts`. The JWT is injected from `localStorage`; a 401 outside the auth pages clears it and redirects to `/login`. Use `getApiErrorMessage` / `getErrorStatus` to read failures.
- **Data fetching:** TanStack Query; mutations invalidate their list and `['dashboard']`, and show a toast on success and on error.
- **Routing:** React Router v7. Pages are lazy-loaded. Each section has a list page plus `/section/new` and `/section/:id` (details, editable) form pages (`*FormPage.tsx`); records are never edited in popups. `ProtectedRoute` guards signed-in pages; `GuestRoute` sends signed-in users away from `/login` and `/register`. Auth navigation uses `replace` so Back never returns to the login form.
- **Design system:** follows an enterprise reference design — Cairo font, primary `#1d75af` (hover `#0f3a57`), dark blue `#165783` for titles, labels, input outlines and table text, pale-blue `#f2faff` table headers with centered cells and `#e9f4fb` row/menu hover, orange `#fd7a41` for section titles, light sidebar with flush 18px items, 12px buttons, 8px inputs, 16px cards, 52px controls and table rows, 0.15s transitions (full size table in `docs/DESIGN-SYSTEM.md`). Colors are Tailwind theme tokens defined in `src/index.css` (`bg-page/surface/band/hover`, `border-line`, `text-heading/body/muted`, `bg-primary`, `bg-primary-dark`, `text-title`, `border-input-line`, `text-accent`, `bg-sidebar…`, `success|warning|danger|info` with `-soft`/`-line` variants); light/dark/Ramadan only swap the `--c-*` variables. Use these classes — no inline `style`, no hex colors, no `var(--…)` in components (Recharts is the one exception, it needs `var(--c-*)` attributes).
- **Shared UI (`components/ui`):** `PageHeader` (breadcrumb + title + actions; `parent` for sub-pages), `Card` (gray header band + orange title), `StatBox`, `DataTable`/`Th`/`Tr`/`Td`, `Button`, `IconButton`, `Badge`, `SegmentedControl`, `FormField`, `FormSection`/`FormPageActions`/`DetailBar`/`StatusMenu`/`RecordNotFound` (form pages; delete lives on details pages only), `PreviewTip` (row hover preview), `ConfirmDialog` (on `Modal`: Escape, focus trap), `Alert` (used by `FormError`), `ToastProvider`/`useToast` (wide banner under the breadcrumb), `EmptyState`, `Toggle`, `Icon` (all icons), `SearchInput`, `DateRangeFilter`, `Pagination` + `usePagination`, `ReceiptImage`, `AuthLayout`/`AuthField`. Build pages from these instead of new markup. Base styles for `input`/`textarea`/`select`/`label` live in `@layer base`, so raw form elements already look right.
- **Floating UI:** `AppSelect` menus and the date picker render in `<body>` (portal) so modals and `overflow-hidden` cards never clip them.
- **Dates:** API dates are date-only strings. Use `todayKey()`, `toDateKey()` and `isInDateRange()` from `utils/formatDate.ts` — never `new Date().toISOString()` for "today" (that's UTC). Money goes through `formatMoney()`; category lists and labels come from `utils/categoryLabel.ts`.
- **i18n:** Every user-visible string goes through `t()`, with the key added to both `src/i18n/en.json` and `ar.json`.
- **Auth persistence:** JWT in `localStorage` under `"token"`, user under `"user"`; expired tokens are discarded on load.

### Database

- SQL Server in Docker for development (`localhost,1433`, database `PersonalLifeOSDb`)
- EF Core with `ApplicationDbContext` extending `IdentityDbContext<ApplicationUser>`
- Migrations live in `PersonalLifeOS.Infrastructure/Migrations/`
- `MonthlyPayments` table exists for a planned feature but has no API yet

### Configuration and secrets

- `appsettings.json` (committed) holds only non-secret defaults: JWT issuer/audience/expiry, storage provider, CORS origins.
- Secrets (connection string, `JwtSettings:SecretKey` ≥ 32 chars, Google Drive credentials) go in `appsettings.Development.json` (tracked in this private repo; production settings stay untracked) or `dotnet user-secrets`.
