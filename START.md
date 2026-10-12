# Starting Personal Life OS

Use Windows PowerShell for the commands below.

## Prerequisites

- .NET 10 SDK
- Node.js and npm
- Docker Desktop
- A configured `PersonalLifeOS.API\appsettings.Development.json` containing the SQL Server connection string and JWT secret

## 1. Start SQL Server and apply migrations

Run these commands once, or whenever the database schema changes:

```powershell
docker start sqlserver

Set-Location .\PersonalLifeOS.Infrastructure
dotnet ef database update --startup-project ..\PersonalLifeOS.API
Set-Location ..
```

If the `sqlserver` container does not exist yet, create it first according to the SQL Server setup documented in the project configuration.

## 2. Start the backend

Open a new PowerShell terminal at the repository root:

```powershell
Set-Location .\PersonalLifeOS.API
dotnet run
```

The API runs at <http://localhost:5207>. Swagger is available at <http://localhost:5207/>.

Keep this terminal running.

## 3. Start the frontend

Open another PowerShell terminal at the repository root:

```powershell
Set-Location .\frontend
npm install       # Run this the first time, or after package.json changes
npm run dev
```

The frontend runs at <http://localhost:5173>.

Keep the backend terminal running while using the frontend.

## Quick command summary

| Component | Directory | Command | URL |
|---|---|---|---|
| Backend | `PersonalLifeOS.API` | `dotnet run` | <http://localhost:5207> |
| Frontend | `frontend` | `npm run dev` | <http://localhost:5173> |
