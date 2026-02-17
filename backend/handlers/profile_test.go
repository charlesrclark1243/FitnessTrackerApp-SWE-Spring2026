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

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func setupProfileTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
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

// creates a user and returns a valid token
func createTestUser(t *testing.T, db *gorm.DB, userID uint, username string) string {
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

func TestGetProfile_NotFound(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/profile", GetProfile)

	// request with valid token but no profile
	req := httptest.NewRequest("GET", "/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Profile not found" {
		t.Errorf("Expected 'Profile not found' error, got %s", response["error"])
	}
}

func TestGetProfile_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// create a profile
	dob := time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC)
	profile := models.HealthProfile{
		UserID:        1,
		DateOfBirth:   &dob,
		Sex:           "male",
		HeightCM:      180,
		WeightKG:      75,
		ActivityLevel: "moderate",
	}
	db.Create(&profile)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/profile", GetProfile)

	// create request
	req := httptest.NewRequest("GET", "/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.HealthProfile
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.UserID != 1 {
		t.Errorf("Expected user_id 1, got %d", response.UserID)
	}

	if response.HeightCM != 180 {
		t.Errorf("Expected height 180, got %f", response.HeightCM)
	}

	if response.WeightKG != 75 {
		t.Errorf("Expected weight 75, got %f", response.WeightKG)
	}
}

func TestGetProfile_Unauthorized(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	setupProfileTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/profile", GetProfile)

	// request without token
	req := httptest.NewRequest("GET", "/profile", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestUpdateProfile_Create(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.PUT("/profile", UpdateProfile)

	// request body
	body := map[string]interface{}{
		"date_of_birth": "1995-03-20T00:00:00Z",
		"sex":           "female",
		"height_cm":     165,
		"weight_kg":     60,
		"activity_level": "active",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.HealthProfile
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.UserID != 1 {
		t.Errorf("Expected user_id 1, got %d", response.UserID)
	}

	if response.HeightCM != 165 {
		t.Errorf("Expected height 165, got %f", response.HeightCM)
	}

	if response.WeightKG != 60 {
		t.Errorf("Expected weight 60, got %f", response.WeightKG)
	}

	if response.Sex != "female" {
		t.Errorf("Expected sex 'female', got %s", response.Sex)
	}
}

func TestUpdateProfile_Update(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// create initial profile
	dob := time.Date(1995, 3, 20, 0, 0, 0, 0, time.UTC)
	profile := models.HealthProfile{
		UserID:        1,
		DateOfBirth:   &dob,
		Sex:           "female",
		HeightCM:      165,
		WeightKG:      60,
		ActivityLevel: "moderate",
	}
	db.Create(&profile)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.PUT("/profile", UpdateProfile)

	// update profile
	body := map[string]interface{}{
		"date_of_birth": "1995-03-20T00:00:00Z",
		"sex":           "female",
		"height_cm":     165,
		"weight_kg":     58, // changed weight
		"activity_level": "very_active", // changed activity
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.HealthProfile
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.WeightKG != 58 {
		t.Errorf("Expected updated weight 58, got %f", response.WeightKG)
	}

	if response.ActivityLevel != "very_active" {
		t.Errorf("Expected updated activity 'very_active', got %s", response.ActivityLevel)
	}
}

func TestUpdateProfile_InvalidSex(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.PUT("/profile", UpdateProfile)

	// create request with invalid sex
	body := map[string]interface{}{
		"date_of_birth": "1995-03-20T00:00:00Z",
		"sex":           "alien", // invalid
		"height_cm":     165,
		"weight_kg":     60,
		"activity_level": "active",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Sex must be 'male' or 'female'" {
		t.Errorf("Expected sex validation error, got %s", response["error"])
	}
}

func TestUpdateProfile_NegativeHeight(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.PUT("/profile", UpdateProfile)

	// request with negative height
	body := map[string]interface{}{
		"date_of_birth": "1995-03-20T00:00:00Z",
		"sex":           "female",
		"height_cm":     -10, // invalid
		"weight_kg":     60,
		"activity_level": "active",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestUpdateProfile_InvalidActivityLevel(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.PUT("/profile", UpdateProfile)

	// request with invalid activity level
	body := map[string]interface{}{
		"date_of_birth": "1995-03-20T00:00:00Z",
		"sex":           "female",
		"height_cm":     165,
		"weight_kg":     60,
		"activity_level": "super_active", // invalid
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestGetStats_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	// create a profile
	dob := time.Date(1994, 5, 15, 0, 0, 0, 0, time.UTC)
	profile := models.HealthProfile{
		UserID:        1,
		DateOfBirth:   &dob,
		Sex:           "male",
		HeightCM:      175,
		WeightKG:      75,
		ActivityLevel: "moderate",
	}
	db.Create(&profile)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/stats", GetStats)

	// create request
	req := httptest.NewRequest("GET", "/stats", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.ProfileStats
	json.Unmarshal(w.Body.Bytes(), &response)

	// check that stats are calculated
	if response.Age == 0 {
		t.Error("Expected age to be calculated")
	}

	if response.BMI == 0 {
		t.Error("Expected BMI to be calculated")
	}

	if response.BFP == 0 {
		t.Error("Expected BFP to be calculated")
	}

	if response.BMR == 0 {
		t.Error("Expected BMR to be calculated")
	}

	if response.TDEE == 0 {
		t.Error("Expected TDEE to be calculated")
	}

	// verify BMI calculation (75 / 1.75^2 = 24.49)
	expectedBMI := 24.49
	if response.BMI < expectedBMI-0.1 || response.BMI > expectedBMI+0.1 {
		t.Errorf("Expected BMI around %.2f, got %.2f", expectedBMI, response.BMI)
	}
}

func TestGetStats_NoProfile(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupProfileTestDB(t)
	token := createTestUser(t, db, 1, "testuser")

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/stats", GetStats)

	// create request (no profile exists)
	req := httptest.NewRequest("GET", "/stats", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Profile not found. Please create a profile first." {
		t.Errorf("Expected profile not found error, got %s", response["error"])
	}
}

func TestGetStats_Unauthorized(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	setupProfileTestDB(t)

	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/stats", GetStats)

	// create request without token
	req := httptest.NewRequest("GET", "/stats", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}