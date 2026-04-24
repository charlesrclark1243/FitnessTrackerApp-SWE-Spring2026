package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

// Test 1: Log steps successfully
func TestLogSteps_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/steps", LogSteps)

	body := map[string]interface{}{
		"steps":       5000,
		"distance_km": 3.5,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/steps", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.StepLog
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Steps != 5000 {
		t.Errorf("Expected steps 5000, got %d", response.Steps)
	}

	if response.Distance != 3.5 {
		t.Errorf("Expected distance 3.5, got %f", response.Distance)
	}
}

// Test 2: Validate step count (negative/zero/too large)
func TestLogSteps_InvalidAmount(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/steps", LogSteps)

	// Test negative steps
	body := map[string]interface{}{
		"steps": -100,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/steps", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative steps, got %d", w.Code)
	}
}

// Test 3: Validate distance
func TestLogSteps_NegativeDistance(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/steps", LogSteps)

	body := map[string]interface{}{
		"steps":       5000,
		"distance_km": -2.0,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/steps", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative distance, got %d", w.Code)
	}
}

// Test 4: Get step logs
func TestGetStepLogs_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create some logs
	log1 := models.StepLog{UserID: 1, Steps: 3000, Distance: 2.1, LoggedAt: time.Now()}
	log2 := models.StepLog{UserID: 1, Steps: 5000, Distance: 3.5, LoggedAt: time.Now()}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/steps", GetStepLogs)

	req := httptest.NewRequest("GET", "/steps", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.StepLog
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 2 {
		t.Errorf("Expected 2 logs, got %d", len(response))
	}
}

// Test 5: Get logs with date filter
func TestGetStepLogs_FilterByDate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs on different days
	today := time.Now()
	yesterday := today.Add(-24 * time.Hour)

	logToday := models.StepLog{UserID: 1, Steps: 3000, LoggedAt: today}
	logYesterday := models.StepLog{UserID: 1, Steps: 5000, LoggedAt: yesterday}
	db.Create(&logToday)
	db.Create(&logYesterday)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/steps", GetStepLogs)

	// Request only today's logs
	todayStr := today.Format("2006-01-02")
	req := httptest.NewRequest("GET", "/steps?date="+todayStr, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.StepLog
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 1 {
		t.Errorf("Expected 1 log for today, got %d", len(response))
	}
}

// Test 6: Get daily summary
func TestGetDailyStepSummary_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs for today
	today := time.Now()
	log1 := models.StepLog{UserID: 1, Steps: 3000, Distance: 2.1, LoggedAt: today}
	log2 := models.StepLog{UserID: 1, Steps: 5000, Distance: 3.5, LoggedAt: today}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/steps/summary", GetDailyStepSummary)

	req := httptest.NewRequest("GET", "/steps/summary", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.StepSummary
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.TotalSteps != 8000 {
		t.Errorf("Expected total 8000 steps, got %d", response.TotalSteps)
	}

	if response.TotalKM != 5.6 {
		t.Errorf("Expected total 5.6 km, got %f", response.TotalKM)
	}
	if response.EntryCount != 2 {
		t.Errorf("Expected 2 entries, got %d", response.EntryCount)
	}

	if response.GoalSteps != 10000 {
		t.Errorf("Expected goal 10000 steps, got %d", response.GoalSteps)
	}

	expectedPercentage := 80.0
	if response.Percentage != expectedPercentage {
		t.Errorf("Expected percentage %.2f, got %.2f", expectedPercentage, response.Percentage)
	}
}

// Test 7: Get recent logs
func TestGetRecentStepLogs_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create multiple logs
	for i := 0; i < 5; i++ {
		log := models.StepLog{
			UserID:   1,
			Steps:    1000 * (i + 1),
			Distance: float64(i + 1),
			LoggedAt: time.Now().Add(time.Duration(-i) * time.Hour),
		}
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/steps/recent", GetRecentStepLogs)

	req := httptest.NewRequest("GET", "/steps/recent?limit=3", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.StepLog
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 3 {
		t.Errorf("Expected 3 recent logs, got %d", len(response))
	}
}

// Test 8: Delete step log
func TestDeleteStepLog_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create a log
	log := models.StepLog{UserID: 1, Steps: 5000, LoggedAt: time.Now()}
	db.Create(&log)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/steps/:id", DeleteStepLog)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/steps/%d", log.ID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify deletion
	var deletedLog models.StepLog
	err := db.First(&deletedLog, log.ID).Error
	if err == nil {
		t.Error("Expected log to be deleted")
	}
}

// Test 9: Delete - not found
func TestDeleteStepLog_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/steps/:id", DeleteStepLog)

	req := httptest.NewRequest("DELETE", "/steps/999", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

// Test 10: Unauthorized access
func TestStepLog_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	setupProfileTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/steps", LogSteps)

	body := map[string]interface{}{
		"steps": 5000,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/steps", bytes.NewBuffer(jsonBody))
	// No Authorization header
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}