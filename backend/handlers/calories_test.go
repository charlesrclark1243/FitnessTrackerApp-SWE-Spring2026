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

func setupCaloriesTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.HealthProfile{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = db
	return db
}

func createCaloriesTestUser(t *testing.T, db *gorm.DB, userID uint, username string) string {
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

func createHealthProfile(t *testing.T, db *gorm.DB, userID uint) {
	dob := time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC)
	profile := models.HealthProfile{
		UserID:        userID,
		DateOfBirth:   &dob,
		Sex:           "M",
		HeightCM:      180,
		WeightKG:      80,
		ActivityLevel: "moderate",
	}
	db.Create(&profile)
}

func TestCalculateCalorieGoal_Success_Lose(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request to lose weight
	body := map[string]string{
		"target_direction": "lose",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["adjusted_calories"] == nil {
		t.Error("Expected adjusted_calories in response")
	}

	adjustedCalories := response["adjusted_calories"].(float64)
	if adjustedCalories <= 0 {
		t.Errorf("Expected positive adjusted_calories, got %v", adjustedCalories)
	}
}

func TestCalculateCalorieGoal_Success_Hold(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request to hold weight
	body := map[string]string{
		"target_direction": "hold",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	adjustedCalories := response["adjusted_calories"].(float64)
	if adjustedCalories <= 0 {
		t.Errorf("Expected positive adjusted_calories, got %v", adjustedCalories)
	}
}

func TestCalculateCalorieGoal_Success_Gain(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request to gain weight
	body := map[string]string{
		"target_direction": "gain",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	adjustedCalories := response["adjusted_calories"].(float64)
	if adjustedCalories <= 0 {
		t.Errorf("Expected positive adjusted_calories, got %v", adjustedCalories)
	}
}

func TestCalculateCalorieGoal_Unauthorized(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request without token
	body := map[string]string{
		"target_direction": "lose",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
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

func TestCalculateCalorieGoal_MissingTargetDirection(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request without target_direction
	body := map[string]string{}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestCalculateCalorieGoal_InvalidTargetDirection(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request with invalid target_direction
	body := map[string]string{
		"target_direction": "invalid",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	expectedError := "target_direction must be 'lose', 'hold', or 'gain'"
	if response["error"] != expectedError {
		t.Errorf("Expected '%s' error, got %s", expectedError, response["error"])
	}
}

func TestCalculateCalorieGoal_ProfileNotFound(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	// Don't create a health profile

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	// request with valid token but no profile
	body := map[string]string{
		"target_direction": "lose",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Failed to retrieve health profile" {
		t.Errorf("Expected 'Failed to retrieve health profile' error, got %s", response["error"])
	}
}

func TestCalculateCalorieGoal_VerifyCalorieAdjustments(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupCaloriesTestDB(t)
	token := createCaloriesTestUser(t, db, 1, "testuser")
	createHealthProfile(t, db, 1)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.POST("/calories/goal", CalculateCalorieGoal)

	testCases := []struct {
		name        string
		direction   string
		shouldLower bool
	}{
		{"Lose weight", "lose", true},
		{"Hold weight", "hold", false},
		{"Gain weight", "gain", false},
	}

	// Get baseline TDEE
	body := map[string]string{
		"target_direction": "hold",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)
	var baselineResponse map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &baselineResponse)
	baselineCalories := baselineResponse["adjusted_calories"].(float64)

	for _, tc := range testCases {
		if tc.direction == "hold" {
			continue // Skip hold since it's our baseline
		}

		body := map[string]string{
			"target_direction": tc.direction,
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/calories/goal", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		adjustedCalories := response["adjusted_calories"].(float64)

		if tc.shouldLower && adjustedCalories >= baselineCalories {
			t.Errorf("Test %s: Expected adjusted_calories to be lower than baseline", tc.name)
		} else if !tc.shouldLower && tc.direction == "gain" && adjustedCalories <= baselineCalories {
			t.Errorf("Test %s: Expected adjusted_calories to be higher than baseline", tc.name)
		}
	}
}
