# Personal Life OS

A personal productivity app for tasks, bills, transactions, receipts and a daily journal, with a dashboard that pulls them together. English and Arabic (right-to-left), light and dark themes.

**Stack:** .NET 10 Web API (Clean Architecture, EF Core, SQL Server, ASP.NET Identity + JWT) · React 19 + TypeScript + Vite · Tailwind CSS v4 · TanStack Query · Zustand · React Router v7 · i18next

## Features

- **Tasks** with priority, category and due date; complete / reopen
- **Bills** with due dates and reminders; pay / unpay; overdue highlighting
- **Transactions** (income and expense) with categories
- **Receipts** with private image upload and preview
- **Journal**: one entry per day
- **Dashboard**: totals, task progress, upcoming bills, income vs. expense chart, today's focus
- Every list has a slide-in filter panel, pagination and a hover preview; records open on their own **new** and **details** pages (status dropdown, delete, unsaved-changes prompt)
- Accounts lock for 5 minutes after 5 failed logins; every record is visible only to its owner

## Quick start

```bash
docker start sqlserver                                   # SQL Server on localhost:1433

cd PersonalLifeOS.Infrastructure
dotnet ef database update --startup-project ../PersonalLifeOS.API

cd ../PersonalLifeOS.API && dotnet run                   # API on http://localhost:5207 (Swagger at /)
cd frontend && npm install && npm run dev                # App on http://localhost:5173 (second terminal)
```

Settings live in `PersonalLifeOS.API/appsettings.Development.json` (connection string and JWT key).

## Documentation

| Document | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Solution layers, backend conventions, API endpoints, database, frontend structure |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Colors, sizes, components, page patterns, behaviors — how to build new UI |
| [docs/TESTING-GUIDE.md](docs/TESTING-GUIDE.md) | Running locally, required checks, manual test checklist, troubleshooting |
| [CLAUDE.md](CLAUDE.md) | Condensed conventions for AI-assisted development |
