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


| Name                                   | Description                                                   | File                 | Status |
|----------------------------------------|---------------------------------------------------------------|----------------------|--------|
| Login Flow Tests                       |                                                               |                      |        |
| should display login link              | Test that login link is visible when not logged in            | login.cy.ts          | PASS   |
| should navigate to login page          | Test navigation to login page and form elements               | login.cy.ts          | PASS   |
| should show error with invalid         | Test error message with invalid credentials                   | login.cy.ts          | PASS   |
| should successfully login and logout successfully | Test complete registration and login flow           | login.cy.ts          | PASS   |
|Water Intake Tests                      |                                                                |                     |         |
| should display water components        | Test water intake UI components visible                       | water-intake.cy.ts   | PASS   |
| should start with 0ml                  | Test initial state shows zero intake                          | water-intake.cy.ts   | PASS   |
| should add 250ml                       | Test quick-add 250ml button                                   | water-intake.cy.ts   | PASS   |
| should add multiple entries            | Test multiple water entry accumulation                        | water-intake.cy.ts   | PASS   |
| should add custom amount               | Test custom water amount input                                | water-intake.cy.ts   | PASS   |
| should undo last entry                 | Test undo removes last water entry                            | water-intake.cy.ts   | PASS   |
| should update progress bar             | Test progress bar updates correctly                           | water-intake.cy.ts   | PASS   |
| should show success message            | Test success message when goal reached                        | water-intake.cy.ts   | PASS   |
| Profile Page Tests                     |                                                               |                      |        |
| Renders profile page with stats & form | Test if profile page loads with stats and editable form       | profile.cy.ts        | PASS   |
| Shows profile stats correctly          | Test stats are displayed correctly from mocked user data      | profile.cy.ts        | PASS   |
| Allows editing and saving profile      | Test user can edit profile and save changes                   | profile.cy.ts        | PASS   |
| Shows BFP as N/A for unsupported sex   | Test BFP displays N/A when sex is unsupported                 | profile.cy.ts        | PASS   |
| Profile stats missing state            |                                                               |                      |        |
| Shows missing data message             | Test message appears when required profile data is incomplete | profile.cy.ts        | PASS   |
|Weight Log & Display Tests              |                                                               |                      |        |
| Logs a weight & display the history    | Test whether user can log a weight & its displays in history  | weight-log.cy.ts     | PASS   |
| Show the last 30 logs                  | Test last 30 weight logs are displayed when user clicks       | weight-log.cy.ts     | PASS   |



## Unit Tests - Services

| Name                         | Description                                      | File                      | Status |
|------------------------------|--------------------------------------------------|---------------------------|--------|
| AuthService Tests            |                                                  |                           |        |
| should be created            | Test service instantiation                       | auth.service.spec.ts      | PASS   |
| should return null user initially | Test currentUserValue returns null         | auth.service.spec.ts      | PASS   |
| should return null token     | Test getToken() returns null when logged out     | auth.service.spec.ts      | PASS   |
| should login successfully    | Test login with valid credentials                | auth.service.spec.ts      | PASS   |
| should save to localStorage  | Test user persistence after login                | auth.service.spec.ts      | PASS   |
| should register successfully | Test registration with valid data                | auth.service.spec.ts      | PASS   |
| WaterService Tests           |                                                  |                           |        |
| should be created            | Test service instantiation                       | water.service.spec.ts     | PASS   |
| should start with 0ml        | Test initial water intake is zero                | water.service.spec.ts     | PASS   |
| should have 2000ml goal      | Test default daily goal                          | water.service.spec.ts     | PASS   |
| should add water correctly   | Test adding water intake                         | water.service.spec.ts     | PASS   |
| should accumulate multiple   | Test multiple entries accumulate                 | water.service.spec.ts     | PASS   |
| should remove last entry     | Test removeLastEntry() function                  | water.service.spec.ts     | PASS   |
| should handle empty undo     | Test undo with no entries                        | water.service.spec.ts     | PASS   |
| should update goal           | Test updateGoal() changes target                 | water.service.spec.ts     | PASS   |
| should calculate percentage  | Test percentage calculation                      | water.service.spec.ts     | PASS   |
| should cap at 100%           | Test percentage max is 100%                      | water.service.spec.ts     | PASS   |
| should adjust with goal change | Test percentage updates with new goal         | water.service.spec.ts     | PASS   |
| should reset daily data      | Test resetDay() clears entries                   | water.service.spec.ts     | PASS   |
| should emit on changes       | Test Observable emits updates                    | water.service.spec.ts     | PASS   |
| should save to localStorage  | Test data persistence                            | water.service.spec.ts     | PASS   |
| should add timestamps        | Test timestamp on each entry                     | water.service.spec.ts     | PASS   |




## Unit Tests - Components

| Name                              | Description                                   | File                          | Status |
|-----------------------------------|-----------------------------------------------|-------------------------------|--------|
| LoginComponent Tests              |                                               |                               |        |
| should create component           | Test component instantiation                  | login.component.spec.ts       | PASS   |
| should have login form            | Test form exists                              | login.component.spec.ts       | PASS   |
| should have username field        | Test username control exists                  | login.component.spec.ts       | PASS   |
| should have password field        | Test password control exists                  | login.component.spec.ts       | PASS   |
| should mark empty invalid         | Test empty form validation                    | login.component.spec.ts       | PASS   |
| should mark filled valid          | Test filled form validation                   | login.component.spec.ts       | PASS   |
| RegisterComponent Tests           |                                               |                               |        |
| should create component           | Test component instantiation                  | register.component.spec.ts    | PASS   |
| should have registration form     | Test form exists                              | register.component.spec.ts    | PASS   |
| should have username field        | Test username control exists                  | register.component.spec.ts    | PASS   |
| should have password field        | Test password control exists                  | register.component.spec.ts    | PASS   |
| should have confirm field         | Test confirmPassword exists                   | register.component.spec.ts    | PASS   |
| should have height field          | Test height control exists                    | register.component.spec.ts    | PASS   |
| should have weight field          | Test weight control exists                    | register.component.spec.ts    | PASS   |
| should have dateOfBirth field     | Test dateOfBirth exists                       | register.component.spec.ts    | PASS   |
| should have sex field             | Test sex control exists                       | register.component.spec.ts    | PASS   |
| should mark empty invalid         | Test empty form validation                    | register.component.spec.ts    | PASS   |
| should validate password match    | Test password mismatch validation             | register.component.spec.ts    | PASS   |
| NavigationComponent Tests         |                                               |                               |        |
| should create component           | Test component instantiation                  | navigation.component.spec.ts  | PASS   |
| should have isAuthenticated       | Test isAuthenticated$ exists                  | navigation.component.spec.ts  | PASS   |
| should have username              | Test username$ exists                         | navigation.component.spec.ts  | PASS   |
| should have logout method         | Test logout() exists                          | navigation.component.spec.ts  | PASS   |
| WeightLogComponent Tests          |                                               |           
| should create                     | Test component instantiation                  | weight-log.component.spec.ts  | PASS   |
| should load recent weights on init| Test recent weights are loaded on component initialization | weight-log.component.spec.ts | PASS |
| should populate logs when loadRecentWeights succeeds | Test logs populate correctly on successful load| weight-log.component.spec.ts | PASS |
| should show error when loadRecentWeights fails   | Test error message is shown when loading logs fails| weight-log.component.spec.ts | PASS |
| should toggle logs and load them first time only | Test logs toggle and load only on first expansion| weight-log.component.spec.ts | PASS |
| should not refresh logs when logs are hidden | Test logs do not refresh if hidden after submit      | weight-log.component.spec.ts | PASS |
| should refresh logs after successful submit  | Test logs refresh if visible after submit            | weight-log.component.spec.ts | PASS |
| should not submit if form is invalid         | Test form submission is blocked when invalid         | weight-log.component.spec.ts | PASS |
| should submit kg weight directly             | Test kg value is submitted without conversion        | weight-log.component.spec.ts | PASS |
| should convert lbs to kg before submit       | Test lbs input is converted to kg before submission  | weight-log.component.spec.ts | PASS |
| should show error message when submit fails  | Test error message appears on submission failure     | weight-log.component.spec.ts | PASS |
| should display weight in kg when unit is kg  | Test weight is displayed correctly in kg             | weight-log.component.spec.ts | PASS |
| should display weight in lbs when unit is lbs| Test weight is displayed correctly in lbs            | weight-log.component.spec.ts | PASS |






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
