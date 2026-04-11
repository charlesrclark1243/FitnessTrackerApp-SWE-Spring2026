# Sprint 3

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

- As a user, I'd like to be able to track how many calories I take into my body, so I can monitor my eating habits.
- As a user, I'd like to be able to log my exercise and burned calories, so I can motivate myself to keep working out.
- As a user, I'd like to be able to set a calorie goal intake goal based on my preferrence for losing, gaining, or holding weight, so I can better achieve said goal.

## New Issues to Address

- Frontend:
  - Calorie goal UI integration (see `POST /api/caloriegoal`)
  - Calorie/food intake logging UI integration
  - Exercise/calorie burn logging UI integration (see `POST /api/exercise/add` and `GET /api/exercise/logs`)
  - Health profile backend integration (issue from sprint 2)
- Backend:
  - Calorie goal calculation endpoint
  - Calorie/food intake logging endpoints
  - Calorie burning/exercise logging endpoints
  - Update API docs
- General:
  - Record demo

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
| should display calorie tracking components | Test calorie tracker UI components are visible | calorie-tracking.cy.ts | PASS |
| should start with 0 consumed and burned | Test initial state shows zero calories | calorie-tracking.cy.ts | PASS |
| should add consumed calories (quick) | Test quick-add snack button adds 150 calories | calorie-tracking.cy.ts | PASS |
| should add burned calories (quick) | Test quick-add walk button burns 150 calories | calorie-tracking.cy.ts | PASS |
| should calculate net calories correctly | Test net calories = consumed - burned | calorie-tracking.cy.ts | PASS |
| should undo last calorie entry | Test undo removes most recent calorie entry | calorie-tracking.cy.ts | PASS |
| should update progress bar | Test progress bar updates | calorie-tracking.cy.ts | PASS |
| should show warning at goal | Test warning when goal reached | calorie-tracking.cy.ts | PASS |
| should edit daily calorie goal | Test user can change goal | calorie-tracking.cy.ts | PASS |
| should show entries with descriptions | Test entries display names | calorie-tracking.cy.ts | PASS |




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
| should be created | Test service instantiation | calorie.service.spec.ts | PASS |
| should start with 0 consumed and burned | Test initial state is zero | calorie.service.spec.ts | PASS |
| should have default goal of 2000 | Test default daily calorie goal | calorie.service.spec.ts | PASS |
| should add consumed calories correctly | Test adding food calories | calorie.service.spec.ts | PASS |
| should add burned calories correctly | Test adding exercise calories | calorie.service.spec.ts | PASS |
| should accumulate multiple entries | Test multiple calorie entries accumulate | calorie.service.spec.ts | PASS |
| should calculate net calories | Test net = consumed - burned | calorie.service.spec.ts | PASS |
| should remove last entry | Test removeLastEntry() removes most recent | calorie.service.spec.ts | PASS |
| should handle undo when empty | Test undo on empty entries list | calorie.service.spec.ts | PASS |
| should update daily goal | Test updateGoal() changes target | calorie.service.spec.ts | PASS |
| should calculate percentage | Test percentage = net/goal * 100 | calorie.service.spec.ts | PASS |
| should calculate percentage with burned | Test percentage accounts for exercise | calorie.service.spec.ts | PASS |
| should cap percentage at 100% | Test percentage max is 100% | calorie.service.spec.ts | PASS |
| should calculate remaining calories | Test remaining = goal - net | calorie.service.spec.ts | PASS |
| should calculate remaining with burned | Test remaining considers exercise | calorie.service.spec.ts | PASS |
| should reset daily data | Test resetDay() clears all entries | calorie.service.spec.ts | PASS |
| should emit on changes | Test Observable emits when calories added | calorie.service.spec.ts | PASS |
| should save to localStorage | Test data persists to localStorage | calorie.service.spec.ts | PASS |
| should add timestamps | Test each entry has accurate timestamp | calorie.service.spec.ts | PASS |
| should handle mixed entry types | Test both consumed and burned entries together | calorie.service.spec.ts | PASS |





## Unit Tests - Components

| Name                              | Description                                   | File                          | Status |
|-----------------------------------|-----------------------------------------------|-------------------------------|--------|
| LoginComponent Tests              |                                               |                               |        |
| should create component           | Test component instantiation                  | login.spec.ts       | PASS   |
| should have login form            | Test form exists                              | login.spec.ts       | PASS   |
| should have username field        | Test username control exists                  | login.spec.ts       | PASS   |
| should have password field        | Test password control exists                  | login.spec.ts       | PASS   |
| should mark empty invalid         | Test empty form validation                    | login.spec.ts       | PASS   |
| should mark filled valid          | Test filled form validation                   | login.spec.ts       | PASS   |
| RegisterComponent Tests           |                                               |                               |        |
| should create component           | Test component instantiation                  | register.spec.ts    | PASS   |
| should have registration form     | Test form exists                              | register.spec.ts    | PASS   |
| should have username field        | Test username control exists                  | register.spec.ts    | PASS   |
| should have password field        | Test password control exists                  | register.spec.ts    | PASS   |
| should have confirm field         | Test confirmPassword exists                   | register.spec.ts    | PASS   |
| should have height field          | Test height control exists                    | register.spec.ts    | PASS   |
| should have weight field          | Test weight control exists                    | register.spec.ts    | PASS   |
| should have dateOfBirth field     | Test dateOfBirth exists                       | register.spec.ts    | PASS   |
| should have sex field             | Test sex control exists                       | register.spec.ts    | PASS   |
| should mark empty invalid         | Test empty form validation                    | register.spec.ts    | PASS   |
| should validate password match    | Test password mismatch validation             | register.spec.ts    | PASS   |
| NavigationComponent Tests         |                                               |                               |        |
| should create component           | Test component instantiation                  | navigation.spec.ts  | PASS   |
| should have isAuthenticated       | Test isAuthenticated$ exists                  | navigation.spec.ts  | PASS   |
| should have username              | Test username$ exists                         | navigation.spec.ts  | PASS   |
| should have logout method         | Test logout() exists                          | navigation.spec.ts  | PASS   |
| WeightLogComponent Tests          |                                               |           
| should create                     | Test component instantiation                  | weight-log.spec.ts  | PASS   |
| should load recent weights on init| Test recent weights are loaded on component initialization | weight-log.spec.ts | PASS |
| should populate logs when loadRecentWeights succeeds | Test logs populate correctly on successful load| weight-log.spec.ts | PASS |
| should show error when loadRecentWeights fails   | Test error message is shown when loading logs fails| weight-log.spec.ts | PASS |
| should toggle logs and load them first time only | Test logs toggle and load only on first expansion| weight-log.spec.ts | PASS |
| should not refresh logs when logs are hidden | Test logs do not refresh if hidden after submit      | weight-log.spec.ts | PASS |
| should refresh logs after successful submit  | Test logs refresh if visible after submit            | weight-log.spec.ts | PASS |
| should not submit if form is invalid         | Test form submission is blocked when invalid         | weight-log.spec.ts | PASS |
| should submit kg weight directly             | Test kg value is submitted without conversion        | weight-log.spec.ts | PASS |
| should convert lbs to kg before submit       | Test lbs input is converted to kg before submission  | weight-log.spec.ts | PASS |
| should show error message when submit fails  | Test error message appears on submission failure     | weight-log.spec.ts | PASS |
| should display weight in kg when unit is kg  | Test weight is displayed correctly in kg             | weight-log.spec.ts | PASS |
| should display weight in lbs when unit is lbs| Test weight is displayed correctly in lbs            | weight-log.spec.ts | PASS |
| should create the component | Test component instantiation | calorie-input.spec.ts | PASS |
| should have quick consumed amounts | Test quick-add food buttons exist | calorie-input.spec.ts | PASS |
| should have quick burned amounts | Test quick-add exercise buttons exist | calorie-input.spec.ts | PASS |
| should start with custom inputs hidden | Test custom forms hidden initially | calorie-input.spec.ts | PASS |
| should add quick consumed calories | Test quick food button calls service | calorie-input.spec.ts | PASS |
| should add quick burned calories | Test quick exercise button calls service | calorie-input.spec.ts | PASS |
| should toggle custom consumed | Test custom food form toggles correctly | calorie-input.spec.ts | PASS |
| should toggle custom burned | Test custom exercise form toggles correctly | calorie-input.spec.ts | PASS |
| should add custom consumed calories | Test custom food entry calls service | calorie-input.spec.ts | PASS |
| should add custom burned calories | Test custom exercise entry calls service | calorie-input.spec.ts | PASS |
| should not add invalid amount | Test invalid amount not submitted | calorie-input.spec.ts | PASS |
| should call undo on service | Test undo button calls service method | calorie-input.spec.ts | PASS |
| should create the component | Test component instantiation | calorie-display.spec.ts | PASS |
| should subscribe to updates | Test subscribes to calorie intake Observable | calorie-display.spec.ts | PASS |
| should start with 0 net calories | Test initial net calories is zero | calorie-display.spec.ts | PASS |
| should format numbers with commas | Test number formatting (1234 → 1,234) | calorie-display.spec.ts | PASS |
| should toggle goal editing | Test goal edit mode toggle | calorie-display.spec.ts | PASS |
| should save new goal | Test saving new goal calls service | calorie-display.spec.ts | PASS |
| should cancel goal editing | Test cancel button exits edit mode | calorie-display.spec.ts | PASS |
| should get correct color for low % | Test progress bar color for < 50% | calorie-display.spec.ts | PASS |
| should get correct color for mid % | Test progress bar color for 50–99% | calorie-display.spec.ts | PASS |
| should get correct color for 100% | Test progress bar color for ≥ 100% | calorie-display.spec.ts | PASS |
| should display motivational message | Test appropriate message based on progress | calorie-display.spec.ts | PASS |







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
| TestLogWaterIntake_Success | Tests submission of water log | `backend/handlers/water_intake_test.go` | PASS |
| TestLogWaterIntake_InvalidAmount | Tests the validation of water amount (non zero, not negative, not too large) | `backend/handlers/water_intake_test.go` | PASS |
| TestGetWaterIntakeLogs_Success | Tests that logs can be accessed | `backend/handlers/water_intake_test.go` | PASS |
| TestGetWaterIntakeLogs_FilterByDate | Tests that logs can be sorted by date |  `backend/handlers/water_intake_test.go` | PASS |
| TestGetDailySummary_Success | Tests that daily summary | `backend/handlers/water_intake_test.go` | PASS |
| TestDeleteWaterLog_Success | Tests that water log can be deleted | `backend/handlers/water_intake_test.go` | PASS |
| TestDeleteWaterLog_NotFound | Tests response for deleting a non existent log | `backend/handlers/water_intake_test.go` | PASS |
| TestWaterIntake_Unauthorized | Tests logging without authorization | `backend/handlers/water_intake_test.go` | PASS |
| TestCalculateCalorieGoal_Success_Lose | Tests what should be a successful "lose" case calorie goal calculation | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_Success_Hold | Tests what should be a successful "hold" case calorie goal calculation | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_Success_Gain | Tests what should be a successful "gain" case calorie goal calculation | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_Unauthorized | Tests what happens when trying to calculate calorie goal when unauthorized | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_MissingTargetDirection | Tests what happens when passing an incomplete POST body. | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_InvalidTargetDirection | Tests what happens when passing an invalid POST body. | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_ProfileNotFound | Tests what happens when the user's health profile doesn't exist. | `backend/handlers/calories_test.go` | PASS |
| TestCalculateCalorieGoal_VerifyCalorieAdjustments | Verifies the correctness of TDEE-based calorie adjustments. | `backend/handlers/calories_test.go` | PASS |
| TestLogExercise_Success | Tests what should be a successful exercise log adding case. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_SuccessWithoutLoggedAt | Tests what happens when adding an exercise log when not logged in. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_Unauthorized | Tests what happens when the user isn't authorized and adds an exercise log. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_MissingRequiredFields | Tests what happens when trying to add an exercise log with an incomplete POST body. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_InvalidDuration | Tests what happens when adding an exercise log with an invalid duration. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_InvalidCalories | Tests what happens when adding an exercise log with an invalid number of calories. | `backend/handlers/exercise_test.go` | PASS |
| TestLogExercise_FutureLoggedAt | Tests what happens when adding an exercise log with the logging time set to a future time. | `backend/handlers/exercise_test.go` | PASS |
| TestGetExerciseLogs_Success | Tests what should be a successful exercise log retrieval case. | `backend/handlers/exercise_test.go` | PASS |
| TestGetExerciseLogs_Empty | Tests what happens when there are no exercise logs associated with the user and they try to retrieve their exercise logs. | `backend/handlers/exercise_test.go` | PASS |
| TestGetExerciseLogs_Unauthorized | Tests what happens when an unauthorized user tries to retrieve their exercise logs. | `backend/handlers/exercise_test.go` | PASS |
| TestGetExerciseLogs_MultipleUsers | Stress tests exercise log retrieval to ensure different users are kept separate. | `backend/handlers/exercise_test.go` | PASS |
| TestGetExerciseLogs_LimitTo30 | Tests to make sure that the retrieved logs are limited to the last 30. | `backend/handlers/exercise_test.go` | PASS |
|  TestLogCalorieIntake_Success | Tests a successful logging of calorie intake. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestLogCalorieIntake_InvalidAmount | Tests the validation of calorie amounts, making sure not negative, zero, or too large. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestLogCalorieIntake_InvalidMealType | Tests validation of meal types. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestGetCalorieIntakeLogs_Success | Tests retrieval of calorie logs. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestGetCalorieIntakeLogs_FilterByDate | Tests calorie log filtering by date. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestGetDailyCalorieSummary_Success | Tests daily summary feature. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestGetRecentCalorieLogs_Success | Tests retrieval of recent calorie logs. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestDeleteCalorieLog_Success | Tests deletion of calorie logs.  | `backend/handlers/calorie_intake_test.go` | PASS |
| TestDeleteCalorieLog_NotFound | Tests attempted deletion of nonexistent log. | `backend/handlers/calorie_intake_test.go` | PASS |
| TestCalorieIntake_Unauthorized | Tests unauthorized attempt to log calorie intake. | `backend/handlers/calorie_intake_test.go` | PASS |

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

### `GET api/profile`

Allows a user to access their profile.
```
{
  	"date_of_birth": "DATE",             # required
	"sex": "SEX",						 # required
	"height_cm": HEIGHT,                 # required
  	"weight_kg": WEIGHT,                 # required
  	"activity_level": "ACTIVITY LEVEL"   # required
}
```

### `PUT api/profile`

Allows a user to update their profile data.
```
{
  	"date_of_birth": "DATE",         # required
    "sex": "SEX",                    # required
    "height_cm": HEIGHT,             # required
  	"weight_kg": WEIGHT,             # required
  	"activity_level": "sedentary" | "light" | "moderate" | "active" | "very_active",  # required
	"weight_goal": "lose" | "hold" | "gain"         # optional, defaults to "hold"
}
```
### `GET api/profile/stats`

Allows a user to access their profile statistics.
```
{
  	"date_of_birth": "DATE",
	  "sex": "SEX",
	  "height_cm": HEIGHT,
  	"weight_kg": WEIGHT,
  	"activity_level": "ACTIVITY LEVEL"
}
```

### `POST api/water`

Allows a user to log their water intake.
```
{
  	"amount_ml": AMOUNT
	"unit": "ml" | "oz"
	"logged_at": TIME
}
```

### `GET api/water`

Allows a user to view their water intake log.
```
# NO BODY NECESSARY
# OPTIONAL QUERY PARAMETERS:
?date=YYYY-MM-DD
```

### `GET api/water/summary`

Allows a user to view their water intake summary.
```
# NO BODY NECESSARY
# OPTIONAL QUERY PARAMETERS:
?date=YYYY-MM-DD
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

### `DELETE api/water/:id`

Deletes a specific water intake log.
```
# NO BODY NECESSARY
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

### `POST api/caloriegoal`

Given a user-defined preference to gain, lose, or hold weight, calculates a target calorie intake based on TDEE.
```
{
    "target_direction": DIRECTION # required, must be either "gain", "lose", or "hold"
}
```

### `POST api/exercise/add`

Allows the user to add a new exercise log record to the database.
```
{
    "type": EXERCISE_NAME,  # required, string
    "duration": MINUTES,    # required, positive integer
    "calories_burned": INT, # required, non-negative integer
    "logged_at": TIME       # optional (automatically calculated)
}
```

### `GET api/exercise/logs`

Allows the user to retrieve their last 30 exercise log records.
```
# NO BODY NECESSARY
```

### `POST api/calories`

Allows user to log calorie intake with optional meal information.
```
{
	"calories": INT,                                          # required, pos integer, max 10000
	"food_name": STRING,									  # optional, max 200 characters
	"meal_type": "breakfast" | "lunch" | "dinner" | "snack",  # optional
	"logged_at": TIME										  # optional
}
```

### `GET api/calories`

Retrieves all calorie intake logs for the user.
```
# NO BODY NECESSARY
# OPTIONAL QUERY PARAMETERS:
?date=YYYY-MM-DD    # Filter logs by specific date
```

### `GET api/calories/recent`

Retrieves the most recent calorie intake logs for the user.
```
# NO BODY NECESSARY
# OPTIONAL QUERY PARAMETERS:
?limit=INT    # Number of logs to retrieve (1-100, defaults to 30)
```

### `GET api/calories/summary`

Retrieves daily calorie intake summary with goal tracking.
```
# NO BODY NECESSARY
# OPTIONAL QUERY PARAMETERS:
?date=YYYY-MM-DD    # Gets summary for specific date (defaults to today)
```

### `DELETE api/calories/:id`

Deletes a specific calorie intake log.
```
NO BODY NECESSARY
```
## Demo

TODO (April 13, 2026 @ 3 pm)
