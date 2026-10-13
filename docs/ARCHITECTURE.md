# Architecture

How Personal Life OS is put together. For visual design see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); for running and testing see [TESTING-GUIDE.md](TESTING-GUIDE.md).

## 1. Solution layout

```
PersonalLifeOS.slnx
├── PersonalLifeOS.Domain/          Entities, GeneralStatuses, IUserOwnedEntity — no dependencies
├── PersonalLifeOS.Application/     DTOs with validation attributes, ApiResponse<T>, ValidationLimits
├── PersonalLifeOS.Infrastructure/  EF Core DbContext, repositories, services, Identity + JWT, file storage, migrations
├── PersonalLifeOS.API/             Controllers, ApiExceptionHandler, Program.cs (DI, auth, CORS)
└── frontend/                       React SPA
```

Dependencies point inward: `API → Infrastructure → Application → Domain`. Services live in Infrastructure; repositories and services are concrete classes registered in `Program.cs`.

## 2. Backend

### Data ownership and status
- Every entity implements `IUserOwnedEntity` (`UserId`). Repositories derive from `UserOwnedRepository<T>`, whose `Active(userId)` query filters by owner and hides soft-deleted rows. Asking for another user's record returns null, so the API answers **404**.
- Status is a string `StatusCode` using the constants in `GeneralStatuses` (`PENDING`, `COMPLETED`, `PAID`, `ACTIVE`, `DELETED`, `CANCELLED`). Update DTOs have no status: it only changes through `/complete`, `/uncomplete`, `/pay`, `/unpay`.
- Deletes are soft (`StatusCode = DELETED`). Deleting a receipt also deletes its image.
- Audit fields (`CreatedBy/Date`, `UpdatedBy/Date`) are set by the repository in UTC.

### Requests, validation and errors
- Controllers derive from `BaseApiController` (`[Authorize]`, route, `CurrentUserId`, `Success(...)`) and return `ApiResponse<T>`.
- DTOs use data annotations (amounts use `[Range]` with `ValidationLimits`). Invalid models are answered automatically with an `ApiResponse` 400.
- Controllers don't catch exceptions. `ApiExceptionHandler` maps `KeyNotFoundException` → 404, `ValidationException` → 400, anything else → logged generic 500.

### Authentication
- ASP.NET Identity with `ApplicationUser`; JWT Bearer tokens from `JwtTokenService` using `JwtSettings` (issuer, audience, 60-minute expiry).
- Users have a unique username (3–32 letters, digits, `.`, `_`, `-`; stored lowercase) and sign in with the username or the email. Register returns 409 if the username or email exists; login returns 401 for bad credentials and 423 after 5 failed attempts (5-minute lockout).
- Signed-in users edit their name, username and email (`PUT /api/auth/profile`) and change their password (`POST /api/auth/change-password`, current password required; wrong guesses count toward the lockout). Both return a fresh token. Accounts created before usernames got the part of their email before the "@" (migration `GiveUsersUserNames`).

### Receipt images
- Stored through `IFileStorage`: `LocalFileStorage` (default, `PersonalLifeOS.API/App_Data/receipts`, outside the web root) or private Google Drive (`Storage:Provider = GoogleDrive`).
- Served only to the owner via `GET /api/receipts/{id}/image`. Allowed types and size are in `ImageFileRules` (JPG, PNG, WEBP, GIF; 10 MB).

### API endpoints
All except auth require a Bearer token.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `PUT /api/auth/profile`, `POST /api/auth/change-password` |
| Dashboard | `GET /api/dashboard` |
| Tasks | `GET, POST /api/tasks` · `GET, PUT, DELETE /api/tasks/{id}` · `POST /api/tasks/{id}/complete`, `/uncomplete` |
| Bills | `GET, POST /api/bills` · `GET, PUT, DELETE /api/bills/{id}` · `POST /api/bills/{id}/pay`, `/unpay` |
| Journal | `GET, POST /api/journal` · `GET, PUT, DELETE /api/journal/{id}` |
| Transactions | `GET, POST /api/transactions` · `GET, PUT, DELETE /api/transactions/{id}` |
| Receipts | `GET, POST /api/receipts` (multipart, `imageFile`) · `GET, PUT, DELETE /api/receipts/{id}` · `GET, PUT /api/receipts/{id}/image` |

### Database
SQL Server (Docker, `localhost,1433`, database `PersonalLifeOSDb`), EF Core with `ApplicationDbContext : IdentityDbContext<ApplicationUser>`. Migrations are in `PersonalLifeOS.Infrastructure/Migrations` and are applied manually.

| Table | Key columns | Index |
|---|---|---|
| Tasks | Title, Description, DueDate, Category, Priority, StatusCode | (UserId, StatusCode), DueDate |
| Bills | Name, Amount, DueDate, ReminderDaysBefore, StatusCode | (UserId, DueDate, StatusCode) |
| DailyJournals | Date, Notes | (UserId, Date) |
| Transactions | Amount, Type (Income/Expense), Category, Date, Notes | (UserId, Date, Type) |
| Receipts | Title, ImagePath, Amount, Date, Category | (UserId, Date) |
| MonthlyPayments | Title, Amount, Month, Year — planned feature, no API yet | (UserId, Year, Month) |

All tables also have `UserId`, `StatusCode` and the audit fields; Identity adds the `AspNet*` tables.

### Configuration
- `appsettings.json`: non-secret defaults (JWT issuer/audience/expiry, storage provider, CORS origins `http://localhost:5173`, `http://localhost:3000`).
- `appsettings.Development.json`: connection string and `JwtSettings:SecretKey` (≥ 32 characters). The API refuses to start without them. Production settings are never committed.

## 3. Frontend

```
frontend/src
├── pages/            List pages (TasksPage…), form pages (TaskFormPage…), Dashboard, Profile, EditProfile, ChangePassword, Login, Register
├── components/
│   ├── layout/       MainLayout (sidebar, top bar), AuthLayout, ProtectedRoute, GuestRoute
│   ├── ui/           Shared components — see DESIGN-SYSTEM.md
│   └── dashboard/    TodayFocus
├── hooks/            useFilters, usePagination, useRecordId, useDirty
├── services/         Axios client (api.ts) and one service per API area
├── stores/           Zustand: authStore, themeStore, brandStore, sidebarStore, ramadanStore
├── types/            API types; status.ts mirrors GeneralStatuses
├── utils/            formatDate, formatMoney (EGP), categoryLabel, validation
├── i18n/             en.json, ar.json
└── config/site.ts    Owner name for the footer credit
```

### Routing
React Router v7, pages lazy-loaded. `ProtectedRoute` guards signed-in pages; `GuestRoute` keeps signed-in users away from `/login` and `/register`. Auth navigation uses `replace` so Back never returns to the login form.

| Route | Page |
|---|---|
| `/dashboard` | Dashboard |
| `/tasks`, `/bills`, `/transactions`, `/receipts`, `/journal` | List with filter panel, pagination, row preview |
| `/<section>/new` | Create form |
| `/<section>/:id` | Details form: editable, status dropdown, delete, unsaved-changes prompt |
| `/profile` | Preferences: dark mode, Ramadan theme, language, brand palette |

### Data and state
- **Server state:** TanStack Query. Mutations invalidate their list and `['dashboard']` and show a toast. Details pages read the record from the cached list query.
- **API client:** `services/api.ts` injects the JWT from `localStorage`. A 401 outside the auth pages signs out and redirects to `/login`. Write requests take at least 0.6s so loading states are visible. `getApiErrorMessage` / `getErrorStatus` read failures.
- **Filtering and pagination** are client-side (`useFilters` keeps a draft and an applied set; `usePagination` pages the filtered list).
- **Dates** are date-only strings from the API. Use `todayKey()`, `toDateKey()`, `isInDateRange()`, never `new Date().toISOString()` for "today".
- **i18n:** every visible string goes through `t()` with keys in both `en.json` and `ar.json`. Arabic sets `dir="rtl"`; layouts use logical CSS properties.

### Auth persistence
JWT in `localStorage` under `token`, user under `user`; expired tokens are discarded on load.
