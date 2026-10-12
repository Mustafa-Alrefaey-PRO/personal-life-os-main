# Testing Guide

How to run Personal Life OS locally and check that it works. For architecture and conventions see [CLAUDE.md](../CLAUDE.md).

## 1. Run the application

```bash
# Database (SQL Server in Docker)
docker start sqlserver

# One-time: create PersonalLifeOS.API/appsettings.Development.json
# from appsettings.Development.example.json (connection string + JWT key)

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

### Tasks, bills, journal, transactions
- [ ] Create, edit and delete an item on each page; a toast confirms each action
- [ ] Complete/uncomplete a task and pay/unpay a bill
- [ ] A bill due today shows as Pending, not Overdue
- [ ] Negative or zero amounts are rejected
- [ ] Search, date range and status filters narrow the list; pagination follows the filtered list

### Receipts
- [ ] Upload a JPG/PNG/WEBP/GIF receipt (max 10 MB); the thumbnail and preview load
- [ ] Uploading a non-image file shows "Only JPG, PNG, WEBP and GIF images are allowed"
- [ ] Replacing the image keeps the receipt; deleting the receipt removes the image file from `PersonalLifeOS.API/App_Data/receipts`
- [ ] The header total matches the filtered list

### Dashboard
- [ ] Stats match the data on each page
- [ ] Upcoming bills lists only unpaid bills due today or later
- [ ] The progress ring shows completed (green) and overdue (red) as separate segments

### Look and feel
- [ ] Light mode: white page, white cards with gray outlines; dark mode: charcoal page and panels
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
