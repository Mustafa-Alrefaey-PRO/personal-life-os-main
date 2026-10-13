# Testing Guide

How to run Personal Life OS locally and check that it works. For structure and conventions see [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Run the application

```bash
# Database (SQL Server in Docker)
docker start sqlserver

# Settings: PersonalLifeOS.API/appsettings.Development.json (connection string + JWT key)

# Apply migrations
cd PersonalLifeOS.Infrastructure
dotnet ef database update --startup-project ../PersonalLifeOS.API

# Backend: http://localhost:5207 (Swagger UI at the root)
cd ../PersonalLifeOS.API && dotnet run

# Frontend: http://localhost:5173 (in a second terminal)
cd frontend && npm install && npm run dev
```

## 2. Automated checks

There are no unit tests yet. Before committing, these must pass:

```bash
dotnet build PersonalLifeOS.slnx      # 0 errors, 0 warnings
cd frontend && npm run lint && npm run build
```

## 3. Manual checklist

### Authentication
- [ ] Register a new account; you land on the dashboard
- [ ] Registering the same email again shows "An account with this email already exists"
- [ ] Wrong password shows "Invalid email or password"
- [ ] 5 wrong passwords in a row lock the account for 5 minutes ("Too many failed attempts")
- [ ] After login, pressing Back does not show the login form; visiting `/login` redirects to the dashboard
- [ ] Logout returns to the login page; Back does not reopen the dashboard
- [ ] Theme and language toggles work on the login and register pages
- [ ] Sign in works with the username and with the email; register asks for a username and refuses a taken one
- [ ] Account menu (top bar): My profile, Change password, Sign out. Profile → Edit profile saves name/username/email; Change password needs the current password, keeps you signed in, and the old password stops working
- [ ] Every save/upload/status button shows its spinner for at least ~0.6s

### Tasks, bills, journal, transactions
- [ ] "Add" opens the new page (`/tasks/new`…); saving returns to the list with a toast
- [ ] The eye icon opens the details page; the "i" icon shows a hover preview
- [ ] On a details page: edit and save; change status from the status dropdown (complete/reopen a task, pay/unpay a bill)
- [ ] Delete sits beside Cancel/Save, returns to the list at once with “Name” deleted and Undo (6s, paused on hover); Undo brings the row back; nothing is sent until the toast closes
- [ ] A failed delete brings the row back with a red toast that stays until ×; receipts still ask for confirmation
- [ ] Cancel after editing asks "Entered data will not be saved…"; Cancel with no edits leaves immediately
- [ ] Empty required fields show inline errors; negative or zero amounts are rejected
- [ ] A bill due today shows as Pending, not Overdue
- [ ] The filter tab opens the side panel in sync; Search applies, Clear resets; pagination follows the filtered list

### Receipts
- [ ] Upload a JPG/PNG/WEBP/GIF receipt (max 10 MB); the thumbnail and preview load
- [ ] Uploading a non-image file shows "Only JPG, PNG, WEBP and GIF images are allowed"
- [ ] "Change Image" on the details page keeps the receipt; deleting the receipt removes the image file from `PersonalLifeOS.API/App_Data/receipts`
- [ ] The header total matches the filtered list

### Dashboard
- [ ] Stats match the data on each page
- [ ] Upcoming bills lists only unpaid bills due today or later
- [ ] The progress ring shows completed (green) and overdue (red) as separate segments

### Look and feel
- [ ] Light mode: white page, blue brand, pale-blue table headers; dark mode: navy page and panels
- [ ] Brand palettes in Profile recolor the whole app
- [ ] No flash of the wrong theme on reload
- [ ] Arabic switches the layout to RTL, including the sidebar, alerts and toasts

## 4. Security checks (API)

With two accounts A and B:
- [ ] B requesting A's task/bill/receipt by id gets 404
- [ ] B requesting A's receipt image gets 404; without a token, 401
- [ ] `PUT /api/tasks/{id}` with a `statusCode` field does not change the status
- [ ] Server errors return a generic message, never exception details

## Troubleshooting

- **API exits with "ConnectionStrings:DefaultConnection is not set" or a JwtSettings error**: create `appsettings.Development.json` (step 1).
- **Cannot connect to SQL Server**: `docker ps` should list `sqlserver` on port 1433; start it with `docker start sqlserver`.
- **Frontend shows "Unable to connect to the server"**: the API isn't running on port 5207, or `VITE_API_URL` points elsewhere.
- **Logged out after an update**: the JWT key was rotated; sign in again.
