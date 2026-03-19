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

| Test Description | File | Pass/Fail |
| ---------------- | ---- | --------- |


## Backend Unit Test List

| Test Description | File | Pass/Fail |
| ---------------- | ---- | --------- |

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
    "logged_at": DATETIME  # optional, usually handled automatically
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
    "logged_at": DATETIME    # optional, usually handled automatically
}
```