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

// Test 1: Log water intake successfully
func TestLogWaterIntake_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/water", LogWaterIntake)

	body := map[string]interface{}{
		"amount_ml": 250,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/water", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.WaterIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.AmountML != 250 {
		t.Errorf("Expected amount 250, got %d", response.AmountML)
	}
}

// Test 2: Validate amount (negative/zero/too large)
func TestLogWaterIntake_InvalidAmount(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/water", LogWaterIntake)

	// Test negative amount
	body := map[string]interface{}{
		"amount_ml": -100,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/water", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for negative amount, got %d", w.Code)
	}
}

// Test 3: Get water logs
func TestGetWaterIntakeLogs_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create some logs
	log1 := models.WaterIntake{UserID: 1, AmountML: 250, LoggedAt: time.Now()}
	log2 := models.WaterIntake{UserID: 1, AmountML: 500, LoggedAt: time.Now()}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/water", GetWaterIntakeLogs)

	req := httptest.NewRequest("GET", "/water", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.WaterIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 2 {
		t.Errorf("Expected 2 logs, got %d", len(response))
	}
}

// Test 4: Get logs with date filter
func TestGetWaterIntakeLogs_FilterByDate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs on different days
	today := time.Now()
	yesterday := today.Add(-24 * time.Hour)

	logToday := models.WaterIntake{UserID: 1, AmountML: 250, LoggedAt: today}
	logYesterday := models.WaterIntake{UserID: 1, AmountML: 500, LoggedAt: yesterday}
	db.Create(&logToday)
	db.Create(&logYesterday)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/water", GetWaterIntakeLogs)

	// Request only today's logs
	todayStr := today.Format("2006-01-02")
	req := httptest.NewRequest("GET", "/water?date="+todayStr, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []models.WaterIntake
	json.Unmarshal(w.Body.Bytes(), &response)

	if len(response) != 1 {
		t.Errorf("Expected 1 log for today, got %d", len(response))
	}
}

// Test 5: Get daily summary
func TestGetDailySummary_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create logs for today
	today := time.Now()
	log1 := models.WaterIntake{UserID: 1, AmountML: 250, LoggedAt: today}
	log2 := models.WaterIntake{UserID: 1, AmountML: 500, LoggedAt: today}
	db.Create(&log1)
	db.Create(&log2)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/water/summary", GetDailySummary)

	req := httptest.NewRequest("GET", "/water/summary", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response models.WaterIntakeSummary
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.TotalML != 750 {
		t.Errorf("Expected total 750ml, got %d", response.TotalML)
	}

	if response.EntryCount != 2 {
		t.Errorf("Expected 2 entries, got %d", response.EntryCount)
	}
}

// Test 6: Delete water log
func TestDeleteWaterLog_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// Create a log
	log := models.WaterIntake{UserID: 1, AmountML: 250, LoggedAt: time.Now()}
	db.Create(&log)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/water/:id", DeleteWaterLog)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/water/%d", log.ID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Verify deletion
	var deletedLog models.WaterIntake
	err := db.First(&deletedLog, log.ID).Error
	if err == nil {
		t.Error("Expected log to be deleted")
	}
}

// Test 7: Delete - not found
func TestDeleteWaterLog_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.DELETE("/water/:id", DeleteWaterLog)

	req := httptest.NewRequest("DELETE", "/water/999", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

// Test 8: Unauthorized access
func TestWaterIntake_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	setupProfileTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/water", LogWaterIntake)

	body := map[string]interface{}{
		"amount_ml": 250,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/water", bytes.NewBuffer(jsonBody))
	// No Authorization header
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}