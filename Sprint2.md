# Sprint 2

## Table of Contents
1. [Authors](#authors)
2. [New Users Stories](#new-user-stories)
3. [New Issues to Address](#new-issues-to-address)
4. [Frontend Unit Test List](#frontend-unit-test-list)
5. [Backend Unit Test List](#backend-unit-test-list)
6. [API Documentation](#api-documentation)
7. [Demo](#demo)

## Authors
- Suhashi N. De Silva (Frontend)
- Ahmed Rageeb Ahsan (Frontend)
- Helen Radomski (Backend)
- Charlie Clark (Backend)\

## New User Stories

- As a user, I'd like to be able to easily log my current weight in my preferred units of measure, so I can hold myself accountable for my actions and self-constraint.
- As a user, I'd like to be able to view my most recently logged weights, again in my preferred units of measure, so I can understand my short-term progress and trends.
- As a user, I'd like an app that correctly connects the backend servers to the frontend client, so I know the app actually works as advertised.

## New Issues to Address

- Frontend:
  - Water logging UI components
  - Weight tracking UI components
  - Cypress unit testing
- Backend:
  - Water logging API endpoints
  - Weight logging API endpoints
  - Unit testing
- General:
  - Integrate frontend and backend

## Frontend Unit Test List

## End-to-End Tests (Cypress)


| Name                                   | Description                                                   | File         | Status |
|----------------------------------------|---------------------------------------------------------------|--------------|--------|
| Login Flow Tests                       |                                                               |              |        |
| should display login link              | Test that login link is visible when not logged in            | login.cy.ts  | PASS   |
| should navigate to login page          | Test navigation to login page and form elements               | login.cy.ts  | PASS   |
| should show error with invalid         | Test error message with invalid credentials                   | login.cy.ts  | PASS   |
| should successfully login and logout successfully | Test complete registration and login flow           | login.cy.ts  | PASS   |



## Backend Unit Test List

| Name | Description | File | Pass/Fail |
| ---- | ----------- | ---- | --------- |
| TestRegister_Success | Test registration using valid inputs | `backend/handlers/auth_test.go` | PASS |
| TestRegister_DuplicateUsername | Test registration using a username that's already in use | `backend/handlers/auth_test.go` | PASS |
| TestRegister_ShortUsername | Test registration using a username that's too short to pass length validation | `backend/handlers/auth_test.go` | PASS |
| TestRegister_ShortPassword | Test registration using a password that's too short to pass length validation | `backend/handlers/auth_test.go` | PASS |
| TestLogin_Success | Test login using valid inputs | `backend/handlers/auth_test.go` | PASS |
| TestLogin_WrongPassword | Test login using an incorrect password | `backend/handlers/auth_test.go` | PASS |
| TestLogin_NonexistentUser | Test login for a user that doesn't exist | `backend/handlers/auth_test.go` | PASS |
| TestAddWeightLog_Success_Metric | Test weight log addition using valid inputs (metric system) | `backend/handlers/weight_test.go` | PASS |
| TestAddWeightLog_Success_Imperial | Test weight log addition using valid inputs (imperial system) | `backend/handlers/weight_test.go` | PASS |
| TestAddWeightLog_DefaultsToPreferredUnits| Test weight log addition using valid inputs (default system) | `backend/handlers/weight_test.go` | PASS |
| TestAddWeightLog_InvalidWeight | Test weight log addition using an invalid weight input | `backend/handlers/weight_test.go` | PASS |
| TestAddWeightLog_MissingWeight | Test weight log addition without including a weight input in the JSON body | `backend/handlers/weight_test.go` | PASS |
| TestTestAddWeightLog_CustomLoggedAt | Test weight log addition when a custom logged-at input is included (should be ignored) | `backend/handlers/weight_test.go` | PASS |
| TestModifyLastWeight_Success | Test last weight log modification using valid inputs | `backend/handlers/weight_test.go` | PASS |
| TestModifyLastWeight_NoLogs | Test last weight log modification when the weight log record is empty | `backend/handlers/weight_test.go` | PASS |
| TestModifyLastWeight_UserIsolation | Test last weight log modification under auth isolation | `backend/handlers/weight_test.go` | PASS | 
| TestModifyLastWeight_DefaultsToPreferredUnits | Test weight log modification using valid inputs (defult system) | `backend/handlers/weight_test.go` | PASS |
| TestGetWeightLogs_Success_Metric | Test recent weight log retrieval using valid inputs (metric system) | `backend/handlers/weight_test.go` | PASS |
| TestGetWeightLogs_Success_Imperial | Test recent weight log retrieval using valid inputs (imperial system) | `backend/handlers/weight_test.go` | PASS |
| TestGetWeightLogs_Empty | Test recent weight log retrieval when the weight logs record is empty | `backend/handlers/weight_test.go` | PASS |
| TestGetWeightLogs_UserIsolation | Test recent weight log retrieval under auth isolation | `backend/handlers/weight_test.go` | PASS |
| TestGetWeightLogs_OrderDescending | Test recent weight log retrieval to ensure descending order (newest first) | `backend/handlers/weight_test.go` | PASS |
| TestLbsToKg | Tests accurate conversion from pounds (lbs) to kilograms (kg) | `backend/utils/units_test.go` | PASS |
| TestKgToLvs | Tests accurate conversion from kilograms (kg) to pounds (lbs) | `backend/utils/units_test.go` | PASS |
| TestConvertWeightToKg | Tests accurate weight conversion to kilograms (kg) regardless of starting unit | `backend/utils/units_test.go` | PASS |
| TestConvertWeightFromKg | Tests accurate weight conversion from kilograms (kg) regardless of ending unit | `backend/utils/units_test.go` | PASS |

## API Documentation

### `POST api/auth/register`

Allows a new user to register an account in the application database.
```
{
    "username": "USERNAME", # required
    "password": "PASSWORD"  # required
}
```

### `POST api/auth/login`

Allows an existing user to sign into their account and access protected endpoints.
```
{
    "username": "USERNAME", # required
    "password": "PASSWORD"  # required
}
```

### `PUT api/weight/add`

Allows a user to add a datapoint to their weight log.
```
{
    "weight":    WEIGHT,   # required
    "unit":      UNIT,     # optional, "metric" (default) or "imperial"
    "logged_at": DATETIME  # optional, handled automatically
}
```

### `GET api/weight/list`

Allows a user to get a list of the last 30 datapoints in their weight log (useful for visualization downstream).
```
# NO BODY NECESSARY
```

### `POST api/weight/modify`

Allows a user to modify the most recent datapoint in their weight log (useful for measuring multiple times in a day).
```
{
    "weight":    NEW_WEIGHT, # required
    "unit":      UNIT,       # optional, "metric" (default) or "imperial"
    "logged_at": DATETIME    # optional, handled automatically
}
```

## Demo

ADD LINK HERE
