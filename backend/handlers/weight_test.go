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

func setupWeightTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.HealthProfile{}, &models.WeightLog{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = db
	return db
}

func createWeightTestUser(t *testing.T, db *gorm.DB, userID uint, username string, preferredUnits string) string {
	user := models.User{
		ID:           userID,
		Username:     username,
		PasswordHash: "hash",
	}
	db.Create(&user)

	// Create health profile with preferred units
	profile := models.HealthProfile{
		UserID:         userID,
		PreferredUnits: preferredUnits,
	}
	db.Create(&profile)

	token, err := utils.GenerateToken(userID, username)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	return token
}

func TestAddWeightLog_Success_Metric(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request with metric weight
	body := map[string]interface{}{
		"weight": 70.5,
		"unit":   "metric",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["message"] != "Weight log added successfully" {
		t.Errorf("Expected success message")
	}

	// Verify weight was stored correctly in kg
	var weightLog models.WeightLog
	db.First(&weightLog)
	if weightLog.WeightKG != 70.5 {
		t.Errorf("Expected weight 70.5 kg, got %v", weightLog.WeightKG)
	}
}

func TestAddWeightLog_Success_Imperial(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "imperial")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request with imperial weight (220.46 lbs = 100 kg)
	body := map[string]interface{}{
		"weight": 220.462262185,
		"unit":   "imperial",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify weight was converted to kg correctly
	var weightLog models.WeightLog
	db.First(&weightLog)
	expectedKG := 100.0
	if weightLog.WeightKG < expectedKG-0.01 || weightLog.WeightKG > expectedKG+0.01 {
		t.Errorf("Expected weight ~100 kg, got %v", weightLog.WeightKG)
	}
}

func TestAddWeightLog_DefaultsToPreferredUnits(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "imperial")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request without specifying unit (should use user's preferred units)
	body := map[string]interface{}{
		"weight": 220.462262185,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify weight was treated as lbs and converted to kg
	var weightLog models.WeightLog
	db.First(&weightLog)
	expectedKG := 100.0
	if weightLog.WeightKG < expectedKG-0.01 || weightLog.WeightKG > expectedKG+0.01 {
		t.Errorf("Expected weight ~100 kg (converted from lbs), got %v", weightLog.WeightKG)
	}
}

func TestAddWeightLog_InvalidWeight(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request with invalid weight (negative)
	body := map[string]interface{}{
		"weight": -10,
		"unit":   "metric",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestAddWeightLog_MissingWeight(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request without weight
	body := map[string]interface{}{
		"unit": "metric",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestAddWeightLog_CustomLoggedAt(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/weight", AddWeightLog)

	// Create request with custom logged_at timestamp
	customTime := time.Date(2026, 1, 15, 12, 0, 0, 0, time.UTC)
	body := map[string]interface{}{
		"weight":    75.0,
		"unit":      "metric",
		"logged_at": customTime.Format(time.RFC3339),
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/weight", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Verify custom timestamp was used
	var weightLog models.WeightLog
	db.First(&weightLog)
	if !weightLog.LoggedAt.Equal(customTime) {
		t.Errorf("Expected logged_at %v, got %v", customTime, weightLog.LoggedAt)
	}
}

func TestGetWeightLogs_Success_Metric(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	// Add some weight logs
	logs := []models.WeightLog{
		{UserID: 1, WeightKG: 70.0, LoggedAt: time.Now().Add(-48 * time.Hour)},
		{UserID: 1, WeightKG: 71.5, LoggedAt: time.Now().Add(-24 * time.Hour)},
		{UserID: 1, WeightKG: 72.0, LoggedAt: time.Now()},
	}
	for _, log := range logs {
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/weight-logs", GetWeightLogs)

	req := httptest.NewRequest("GET", "/weight-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string][]map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	entries := response["entries"]
	if len(entries) != 3 {
		t.Errorf("Expected 3 entries, got %d", len(entries))
	}

	// Verify weights are returned in metric (same as stored)
	if entries[0]["weight"] != 72.0 {
		t.Errorf("Expected weight 72.0, got %v", entries[0]["weight"])
	}

	// Verify unit is included
	if entries[0]["unit"] != "metric" {
		t.Errorf("Expected unit 'metric', got %v", entries[0]["unit"])
	}
}

func TestGetWeightLogs_Success_Imperial(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "imperial")

	// Add weight logs (stored in kg)
	logs := []models.WeightLog{
		{UserID: 1, WeightKG: 100.0, LoggedAt: time.Now()},
	}
	for _, log := range logs {
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/weight-logs", GetWeightLogs)

	req := httptest.NewRequest("GET", "/weight-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string][]map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	entries := response["entries"]
	if len(entries) != 1 {
		t.Errorf("Expected 1 entry, got %d", len(entries))
	}

	// Verify weight was converted to lbs (100 kg = ~220.46 lbs)
	expectedLbs := 220.462262185
	actualWeight := entries[0]["weight"].(float64)
	if actualWeight < expectedLbs-0.01 || actualWeight > expectedLbs+0.01 {
		t.Errorf("Expected weight ~220.46 lbs, got %v", actualWeight)
	}

	// Verify unit is imperial
	if entries[0]["unit"] != "imperial" {
		t.Errorf("Expected unit 'imperial', got %v", entries[0]["unit"])
	}
}

func TestGetWeightLogs_Empty(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/weight-logs", GetWeightLogs)

	req := httptest.NewRequest("GET", "/weight-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string][]map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	entries := response["entries"]
	if len(entries) != 0 {
		t.Errorf("Expected 0 entries, got %d", len(entries))
	}
}

func TestGetWeightLogs_UserIsolation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token1 := createWeightTestUser(t, db, 1, "user1", "metric")
	createWeightTestUser(t, db, 2, "user2", "metric")

	// Add weight logs for both users
	logs := []models.WeightLog{
		{UserID: 1, WeightKG: 70.0, LoggedAt: time.Now()},
		{UserID: 2, WeightKG: 80.0, LoggedAt: time.Now()},
	}
	for _, log := range logs {
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/weight-logs", GetWeightLogs)

	// Request as user 1
	req := httptest.NewRequest("GET", "/weight-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token1)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string][]map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	entries := response["entries"]
	if len(entries) != 1 {
		t.Errorf("Expected 1 entry for user 1, got %d", len(entries))
	}

	// Verify only user 1's data is returned
	if entries[0]["weight"] != 70.0 {
		t.Errorf("Expected weight 70.0, got %v", entries[0]["weight"])
	}
}

func TestGetWeightLogs_OrderedDescending(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupWeightTestDB(t)
	token := createWeightTestUser(t, db, 1, "testuser", "metric")

	// Add weight logs in non-chronological order
	logs := []models.WeightLog{
		{UserID: 1, WeightKG: 70.0, LoggedAt: time.Now().Add(-48 * time.Hour)},
		{UserID: 1, WeightKG: 72.0, LoggedAt: time.Now()},
		{UserID: 1, WeightKG: 71.0, LoggedAt: time.Now().Add(-24 * time.Hour)},
	}
	for _, log := range logs {
		db.Create(&log)
	}

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/weight-logs", GetWeightLogs)

	req := httptest.NewRequest("GET", "/weight-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string][]map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	entries := response["entries"]

	// Verify entries are ordered by logged_at DESC (most recent first)
	if entries[0]["weight"] != 72.0 {
		t.Errorf("Expected most recent weight (72.0) first, got %v", entries[0]["weight"])
	}
	if entries[1]["weight"] != 71.0 {
		t.Errorf("Expected second most recent weight (71.0), got %v", entries[1]["weight"])
	}
	if entries[2]["weight"] != 70.0 {
		t.Errorf("Expected oldest weight (70.0) last, got %v", entries[2]["weight"])
	}
}
