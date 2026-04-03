package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func setupExerciseTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.ExerciseLog{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = db
	return db
}

func createExerciseTestUser(t *testing.T, db *gorm.DB, userID uint, username string) string {
	user := models.User{
		ID:           userID,
		Username:     username,
		PasswordHash: "hash",
	}
	db.Create(&user)

	token, err := utils.GenerateToken(userID, username)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	return token
}

func TestLogExercise_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// create request
	loggedAt := time.Now().Add(-1 * time.Hour)
	body := map[string]interface{}{
		"type":             "Running",
		"duration":         30,
		"calories_burned":  300,
		"logged_at":        loggedAt,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["message"] != "Exercise logged successfully" {
		t.Errorf("Expected success message, got %s", response["message"])
	}

	// Verify exercise is in database
	var exerciseLog models.ExerciseLog
	result := db.Where("user_id = ?", 1).First(&exerciseLog)
	if result.Error != nil {
		t.Errorf("Failed to retrieve exercise log: %v", result.Error)
	}

	if exerciseLog.Type != "Running" {
		t.Errorf("Expected type 'Running', got %s", exerciseLog.Type)
	}
	if exerciseLog.Duration != 30 {
		t.Errorf("Expected duration 30, got %d", exerciseLog.Duration)
	}
	if exerciseLog.CaloriesBurned != 300 {
		t.Errorf("Expected calories_burned 300, got %d", exerciseLog.CaloriesBurned)
	}
}

func TestLogExercise_SuccessWithoutLoggedAt(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// create request without logged_at (should use current time)
	body := map[string]interface{}{
		"type":             "Cycling",
		"duration":         45,
		"calories_burned":  450,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var exerciseLog models.ExerciseLog
	db.Where("user_id = ?", 1).First(&exerciseLog)
	if exerciseLog.Type != "Cycling" {
		t.Errorf("Expected type 'Cycling', got %s", exerciseLog.Type)
	}
	if exerciseLog.LoggedAt.IsZero() {
		t.Error("Expected logged_at to be set to current time")
	}
}

func TestLogExercise_Unauthorized(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	setupExerciseTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// request without token
	body := map[string]interface{}{
		"type":             "Running",
		"duration":         30,
		"calories_burned":  300,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Missing authorization header" {
		t.Errorf("Expected 'Missing authorization header' error, got %s", response["error"])
	}
}

func TestLogExercise_MissingRequiredFields(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	testCases := []struct {
		name string
		body map[string]interface{}
	}{
		{
			"missing type",
			map[string]interface{}{
				"duration":         30,
				"calories_burned":  300,
			},
		},
		{
			"missing duration",
			map[string]interface{}{
				"type":             "Running",
				"calories_burned":  300,
			},
		},
		{
			"missing calories_burned",
			map[string]interface{}{
				"type":     "Running",
				"duration": 30,
			},
		},
	}

	for _, tc := range testCases {
		jsonBody, _ := json.Marshal(tc.body)
		req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Test %s: Expected status 400, got %d", tc.name, w.Code)
		}
	}
}

func TestLogExercise_InvalidDuration(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// request with negative duration
	body := map[string]interface{}{
		"type":             "Running",
		"duration":         -10,
		"calories_burned":  300,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Duration must be positive" {
		t.Errorf("Expected 'Duration must be positive' error, got %s", response["error"])
	}
}

func TestLogExercise_InvalidCalories(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// request with negative calories
	body := map[string]interface{}{
		"type":             "Running",
		"duration":         30,
		"calories_burned":  -100,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Calories burned cannot be negative" {
		t.Errorf("Expected 'Calories burned cannot be negative' error, got %s", response["error"])
	}
}

func TestLogExercise_FutureLoggedAt(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/exercise/log", LogExercise)

	// request with future time
	futureTime := time.Now().Add(1 * time.Hour)
	body := map[string]interface{}{
		"type":             "Running",
		"duration":         30,
		"calories_burned":  300,
		"logged_at":        futureTime,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/exercise/log", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Cannot log future exercise" {
		t.Errorf("Expected 'Cannot log future exercise' error, got %s", response["error"])
	}
}

func TestGetExerciseLogs_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	// create multiple exercise logs
	now := time.Now()
	exercises := []models.ExerciseLog{
		{
			UserID:         1,
			Type:           "Running",
			Duration:       30,
			CaloriesBurned: 300,
			LoggedAt:       now.Add(-2 * time.Hour),
		},
		{
			UserID:         1,
			Type:           "Cycling",
			Duration:       45,
			CaloriesBurned: 450,
			LoggedAt:       now.Add(-1 * time.Hour),
		},
		{
			UserID:         1,
			Type:           "Swimming",
			Duration:       60,
			CaloriesBurned: 600,
			LoggedAt:       now,
		},
	}

	for _, exercise := range exercises {
		db.Create(&exercise)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/exercise/logs", GetExerciseLogs)

	req := httptest.NewRequest("GET", "/exercise/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	logs := response["exercise_logs"].([]interface{})
	if len(logs) != 3 {
		t.Errorf("Expected 3 logs, got %d", len(logs))
	}

	// Verify order is descending by logged_at (most recent first)
	firstLog := logs[0].(map[string]interface{})
	if firstLog["type"] != "Swimming" {
		t.Errorf("Expected first log to be Swimming, got %s", firstLog["type"])
	}
}

func TestGetExerciseLogs_Empty(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/exercise/logs", GetExerciseLogs)

	req := httptest.NewRequest("GET", "/exercise/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	logs := response["exercise_logs"].([]interface{})
	if len(logs) != 0 {
		t.Errorf("Expected 0 logs, got %d", len(logs))
	}
}

func TestGetExerciseLogs_Unauthorized(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	setupExerciseTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/exercise/logs", GetExerciseLogs)

	// request without token
	req := httptest.NewRequest("GET", "/exercise/logs", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Missing authorization header" {
		t.Errorf("Expected 'Missing authorization header' error, got %s", response["error"])
	}
}

func TestGetExerciseLogs_MultipleUsers(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token1 := createExerciseTestUser(t, db, 1, "user1")
	token2 := createExerciseTestUser(t, db, 2, "user2")

	// create exercise logs for both users
	exercises := []models.ExerciseLog{
		{
			UserID:         1,
			Type:           "Running",
			Duration:       30,
			CaloriesBurned: 300,
			LoggedAt:       time.Now(),
		},
		{
			UserID:         1,
			Type:           "Cycling",
			Duration:       45,
			CaloriesBurned: 450,
			LoggedAt:       time.Now(),
		},
		{
			UserID:         2,
			Type:           "Swimming",
			Duration:       60,
			CaloriesBurned: 600,
			LoggedAt:       time.Now(),
		},
	}

	for _, exercise := range exercises {
		db.Create(&exercise)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/exercise/logs", GetExerciseLogs)

	// Get logs for user 1
	req := httptest.NewRequest("GET", "/exercise/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token1)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	logs := response["exercise_logs"].([]interface{})
	if len(logs) != 2 {
		t.Errorf("Expected user 1 to have 2 logs, got %d", len(logs))
	}

	// Get logs for user 2
	req = httptest.NewRequest("GET", "/exercise/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token2)
	w = httptest.NewRecorder()

	router.ServeHTTP(w, req)

	json.Unmarshal(w.Body.Bytes(), &response)

	logs = response["exercise_logs"].([]interface{})
	if len(logs) != 1 {
		t.Errorf("Expected user 2 to have 1 log, got %d", len(logs))
	}
}

func TestGetExerciseLogs_LimitTo30(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupExerciseTestDB(t)
	token := createExerciseTestUser(t, db, 1, "testuser")

	// create 40 exercise logs
	now := time.Now()
	for i := 0; i < 40; i++ {
		exercise := models.ExerciseLog{
			UserID:         1,
			Type:           "Running",
			Duration:       30,
			CaloriesBurned: 300,
			LoggedAt:       now.Add(-time.Duration(i) * time.Hour),
		}
		db.Create(&exercise)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/exercise/logs", GetExerciseLogs)

	req := httptest.NewRequest("GET", "/exercise/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	logs := response["exercise_logs"].([]interface{})
	if len(logs) != 30 {
		t.Errorf("Expected exactly 30 logs, got %d", len(logs))
	}
}
