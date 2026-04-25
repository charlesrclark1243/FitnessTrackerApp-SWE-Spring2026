# Fitness Tracker App

CEN5035 Software Engineering Group Project (Spring 2026)

## Overview

Fitness Tracker is a full-stack app for logging and monitoring day-to-day wellness data:

- Profile and health stats
- Water intake
- Calorie intake and goals
- Exercise logs
- Step tracking
- Weight tracking
- Heart health logging

## Team

- Suhashi N. De Silva (Frontend)
- Ahmed Ahsan (Frontend)
- Helen Radomski (Backend)
- Charlie Clark (Backend)

## Tech Stack

- Frontend: Angular 20 (TypeScript, Angular Material)
- Backend: Go (Gin + GORM)
- Database: SQLite
- Tests:
  - Backend: Go unit tests
  - Frontend: Angular/Karma unit tests and Cypress E2E tests

## Repository Layout

```text
.
├── backend/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── main.go
├── forntend/
│   └── FitnessTrackerApp-SWE-Spring2026-forntend/
├── start-servers.sh
└── Sprint4.md
```

Note: the folder name is intentionally spelled `forntend` in this repository.

## Prerequisites

- Go installed and available in PATH
- Node.js + npm installed and available in PATH

## Quick Start (recommended)

From the project root:

```bash
chmod +x start-servers.sh
./start-servers.sh
```

This script starts:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:4200`

It also writes logs to:

- `backend.log`
- `frontend.log`

## Manual Run

### 1) Backend

```bash
cd backend
go mod download
go run main.go
```

Backend base URL: `http://localhost:8080`

### 2) Frontend

```bash
cd forntend/FitnessTrackerApp-SWE-Spring2026-forntend
npm install
npm start
```

Frontend URL: `http://localhost:4200`

## Authentication

Most API routes require JWT auth.

1. Register or login using:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
2. Send token in Authorization header:

```http
Authorization: Bearer <token>
```

## API Summary

All routes are under `/api`.

### Public

- `POST /auth/register`
- `POST /auth/login`

### Protected

#### Profile

- `GET /profile`
- `PUT /profile`
- `GET /profile/stats`

#### Water

- `POST /water`
- `GET /water`
- `GET /water/summary`
- `DELETE /water/:id`

#### Weight

- `PUT /weight/add`
- `GET /weight/logs`
- `POST /weight/modify`

#### Calories

- `POST /caloriegoal`
- `POST /calories`
- `GET /calories`
- `GET /calories/summary`
- `DELETE /calories/:id`

#### Exercise

- `POST /exercise/add`
- `GET /exercise/logs`

#### Steps

- `POST /steps`
- `GET /steps`
- `GET /steps/recent`
- `GET /steps/summary`
- `DELETE /steps/:id`

#### Heart Health

- `POST /heart/rate`
- `POST /heart/blood-pressure`
- `GET /heart/summary`
- `DELETE /heart/:type/:id` where `type` is `heart_rate` or `blood_pressure`

Heart health logging notes:

- `logged_at` is optional for both heart logging endpoints.
- If omitted, the server auto-fills current UTC time.

## Testing

### Backend

Run all backend tests:

```bash
cd backend
go test ./...
```

Run heart-health-related handler tests only:

```bash
cd backend
go test ./handlers -run 'HeartHealth|LogHeartRate|LogBloodPressure|DeleteHeartHealthEntry'
```

### Frontend

Unit tests:

```bash
cd forntend/FitnessTrackerApp-SWE-Spring2026-forntend
npm test
```

E2E tests (Cypress):

```bash
cd forntend/FitnessTrackerApp-SWE-Spring2026-forntend
npx cypress open
```

## Troubleshooting

- 404 on heart endpoint:
  - Use `/api/heart/...` (not `/api/health/...`).
- Unauthorized on protected endpoints:
  - Ensure `Authorization: Bearer <token>` is present.
- Frontend fails to start:
  - Ensure dependencies are installed with `npm install`.
- Backend fails to start:
  - Check `backend.log` (or terminal output) and confirm Go is installed.

## Additional Project Notes

Detailed sprint-specific documentation and test inventories are in `Sprint4.md`.
