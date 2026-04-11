package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/gin-gonic/gin"
)

// Test 1: Log calorie intake successfully
func TestLogCalorieIntake_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories", LogCalorieIntake)

	body := map[string]interface{}{
		"calories":  450,
		"food_name": "salad",
		"meal_type": "lunch",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.CalorieIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Calories != 450 {
		t.Errorf("Expected calories 450, got %d", response.Calories)
	}

	if response.MealType != "lunch" {
		t.Errorf("Expected meal_type 'lunch', got %s", response.MealType)
	}
}

// Test 2: Validate calorie amount (negative/zero/too large)
func TestLogCalorieIntake_InvalidAmount(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories", LogCalorieIntake)

	// Test negative calories
	body := map[string]interface{}{
		"calories": -100,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative calories, got %d", w.Code)
	}
}

// Test 3: Validate meal type
func TestLogCalorieIntake_InvalidMealType(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories", LogCalorieIntake)

	body := map[string]interface{}{
		"calories":  300,
		"meal_type": "midnight_feast", // Invalid
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid meal type, got %d", w.Code)
	}
}

// Test 4: Get calorie logs
func TestGetCalorieIntakeLogs_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create some logs
	log1 := models.CalorieIntake{UserID: 1, Calories: 300, MealType: "breakfast", LoggedAt: time.Now()}
	log2 := models.CalorieIntake{UserID: 1, Calories: 500, MealType: "lunch", LoggedAt: time.Now()}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/calories", GetCalorieIntakeLogs)

	req := httptest.NewRequest("GET", "/calories", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.CalorieIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 2 {
		t.Errorf("Expected 2 logs, got %d", len(response))
	}
}

// Test 5: Get logs with date filter
func TestGetCalorieIntakeLogs_FilterByDate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs on different days
	today := time.Now()
	yesterday := today.Add(-24 * time.Hour)

	logToday := models.CalorieIntake{UserID: 1, Calories: 300, LoggedAt: today}
	logYesterday := models.CalorieIntake{UserID: 1, Calories: 500, LoggedAt: yesterday}
	db.Create(&logToday)
	db.Create(&logYesterday)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/calories", GetCalorieIntakeLogs)

	// Request only today's logs
	todayStr := today.Format("2006-01-02")
	req := httptest.NewRequest("GET", "/calories?date="+todayStr, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.CalorieIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 1 {
		t.Errorf("Expected 1 log for today, got %d", len(response))
	}
}

// Test 6: Get daily summary
func TestGetDailyCalorieSummary_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs for today
	today := time.Now()
	log1 := models.CalorieIntake{UserID: 1, Calories: 300, MealType: "breakfast", LoggedAt: today}
	log2 := models.CalorieIntake{UserID: 1, Calories: 500, MealType: "lunch", LoggedAt: today}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/calories/summary", GetDailyCalorieSummary)

	req := httptest.NewRequest("GET", "/calories/summary", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.CalorieIntakeSummary
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.TotalCals != 800 {
		t.Errorf("Expected total 800 calories, got %d", response.TotalCals)
	}

	if response.EntryCount != 2 {
		t.Errorf("Expected 2 entries, got %d", response.EntryCount)
	}

	// Check meal breakdown
	if response.ByMealType["breakfast"] != 300 {
		t.Errorf("Expected 300 breakfast calories, got %d", response.ByMealType["breakfast"])
	}

	if response.ByMealType["lunch"] != 500 {
		t.Errorf("Expected 500 lunch calories, got %d", response.ByMealType["lunch"])
	}
}

// Test 7: Get recent logs
func TestGetRecentCalorieLogs_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create multiple logs
	for i := 0; i < 5; i++ {
		log := models.CalorieIntake{
			UserID:   1,
			Calories: 100 * (i + 1),
			LoggedAt: time.Now().Add(time.Duration(-i) * time.Hour),
		}
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/calories/recent", GetRecentCalorieLogs)

	req := httptest.NewRequest("GET", "/calories/recent?limit=3", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.CalorieIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 3 {
		t.Errorf("Expected 3 recent logs, got %d", len(response))
	}
}

// Test 8: Delete calorie log
func TestDeleteCalorieLog_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create a log
	log := models.CalorieIntake{UserID: 1, Calories: 300, LoggedAt: time.Now()}
	db.Create(&log)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/calories/:id", DeleteCalorieLog)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/calories/%d", log.ID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify deletion
	var deletedLog models.CalorieIntake
	err := db.First(&deletedLog, log.ID).Error
	if err == nil {
		t.Error("Expected log to be deleted")
	}
}

// Test 9: Delete - not found
func TestDeleteCalorieLog_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/calories/:id", DeleteCalorieLog)

	req := httptest.NewRequest("DELETE", "/calories/999", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

// Test 10: Unauthorized access
func TestCalorieIntake_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	setupProfileTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories", LogCalorieIntake)

	body := map[string]interface{}{
		"calories": 300,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories", bytes.NewBuffer(jsonBody))
	// No Authorization header
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}
