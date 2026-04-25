package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupHeartHealthHandlerTestDB(t *testing.T) *gorm.DB {
	db := setupProfileTestDB(t)

	if err := db.AutoMigrate(&models.HeartRate{}, &models.BloodPressure{}); err != nil {
		t.Fatalf("Failed to migrate heart health test tables: %v", err)
	}

	database.DB = db
	return db
}

func setupHeartHealthRouter() *gin.Engine {
	router := gin.New()
	router.Use(middleware.AuthMiddleware())
	router.GET("/heart/summary", GetHeartHealthSummary)
	router.POST("/heart/rate", LogHeartRate)
	router.POST("/heart/blood-pressure", LogBloodPressure)
	router.DELETE("/heart/:type/:id", DeleteHeartHealthEntry)
	return router
}

func TestGetHeartHealthSummary_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "heart_user")
	createTestUser(t, db, 2, "other_user")

	now := time.Now().UTC()
	db.Create(&models.HeartRate{UserID: 1, Rate: 60, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 1, Rate: 80, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 1, Rate: 100, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 2, Rate: 200, LoggedAt: now})

	db.Create(&models.BloodPressure{UserID: 1, Systolic: 120, Diastolic: 80, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 1, Systolic: 110, Diastolic: 70, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 1, Systolic: 130, Diastolic: 85, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 2, Systolic: 180, Diastolic: 120, LoggedAt: now})

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("GET", "/heart/summary", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]float64
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response["median_heart_rate"] != 80 {
		t.Errorf("Expected median_heart_rate 80, got %v", response["median_heart_rate"])
	}

	if response["median_systolic"] != 120 {
		t.Errorf("Expected median_systolic 120, got %v", response["median_systolic"])
	}

	if response["median_diastolic"] != 80 {
		t.Errorf("Expected median_diastolic 80, got %v", response["median_diastolic"])
	}
}

func TestGetHeartHealthSummary_EmptyData(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "empty_heart_user")

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("GET", "/heart/summary", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]float64
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response["median_heart_rate"] != 0 || response["median_systolic"] != 0 || response["median_diastolic"] != 0 {
		t.Errorf("Expected zero medians for empty data, got %+v", response)
	}
}

func TestGetHeartHealthSummary_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	setupHeartHealthHandlerTestDB(t)

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("GET", "/heart/summary", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestLogHeartRate_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "rate_user")

	router := setupHeartHealthRouter()

	body := map[string]interface{}{
		"rate":      72,
		"logged_at": time.Now().UTC().Format(time.RFC3339),
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/rate", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.HeartRate
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.UserID != 1 || response.Rate != 72 {
		t.Errorf("Expected user_id=1 and rate=72, got user_id=%d rate=%d", response.UserID, response.Rate)
	}
}

func TestLogHeartRate_DefaultLoggedAtWhenMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "rate_default_time_user")

	router := setupHeartHealthRouter()

	start := time.Now().UTC().Add(-1 * time.Second)
	body := map[string]interface{}{
		"rate": 70,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/rate", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)
	end := time.Now().UTC().Add(1 * time.Second)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.HeartRate
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.LoggedAt.IsZero() {
		t.Fatal("Expected logged_at to be auto-populated, got zero time")
	}

	if response.LoggedAt.Before(start) || response.LoggedAt.After(end) {
		t.Errorf("Expected logged_at to be around current server time, got %v", response.LoggedAt)
	}
}

func TestLogHeartRate_InvalidRate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "invalid_rate_user")

	router := setupHeartHealthRouter()

	body := map[string]interface{}{
		"rate":      0,
		"logged_at": time.Now().UTC().Format(time.RFC3339),
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/rate", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestLogBloodPressure_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "bp_user")

	router := setupHeartHealthRouter()

	body := map[string]interface{}{
		"systolic":  120,
		"diastolic": 80,
		"logged_at": time.Now().UTC().Format(time.RFC3339),
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/blood-pressure", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.BloodPressure
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.UserID != 1 || response.Systolic != 120 || response.Diastolic != 80 {
		t.Errorf("Unexpected blood pressure response: %+v", response)
	}
}

func TestLogBloodPressure_DefaultLoggedAtWhenMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "bp_default_time_user")

	router := setupHeartHealthRouter()

	start := time.Now().UTC().Add(-1 * time.Second)
	body := map[string]interface{}{
		"systolic":  118,
		"diastolic": 76,
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/blood-pressure", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)
	end := time.Now().UTC().Add(1 * time.Second)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.BloodPressure
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.LoggedAt.IsZero() {
		t.Fatal("Expected logged_at to be auto-populated, got zero time")
	}

	if response.LoggedAt.Before(start) || response.LoggedAt.After(end) {
		t.Errorf("Expected logged_at to be around current server time, got %v", response.LoggedAt)
	}
}

func TestLogBloodPressure_InvalidValues(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "invalid_bp_user")

	router := setupHeartHealthRouter()

	body := map[string]interface{}{
		"systolic":  0,
		"diastolic": 80,
		"logged_at": time.Now().UTC().Format(time.RFC3339),
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/heart/blood-pressure", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestDeleteHeartHealthEntry_HeartRateSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "delete_hr_user")

	heartRate := models.HeartRate{UserID: 1, Rate: 88, LoggedAt: time.Now().UTC()}
	db.Create(&heartRate)

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("DELETE", fmt.Sprintf("/heart/heart_rate/%d", heartRate.ID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var deleted models.HeartRate
	if err := db.First(&deleted, heartRate.ID).Error; err == nil {
		t.Error("Expected heart rate entry to be deleted")
	}
}

func TestDeleteHeartHealthEntry_BloodPressureSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "delete_bp_user")

	bloodPressure := models.BloodPressure{UserID: 1, Systolic: 125, Diastolic: 82, LoggedAt: time.Now().UTC()}
	db.Create(&bloodPressure)

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("DELETE", fmt.Sprintf("/heart/blood_pressure/%d", bloodPressure.ID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var deleted models.BloodPressure
	if err := db.First(&deleted, bloodPressure.ID).Error; err == nil {
		t.Error("Expected blood pressure entry to be deleted")
	}
}

func TestDeleteHeartHealthEntry_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "delete_invalid_id_user")

	router := setupHeartHealthRouter()

	tests := []struct {
		name      string
		entryType string
		entryID   string
	}{
		{name: "missing heart rate id", entryType: "heart_rate", entryID: "99999"},
		{name: "missing blood pressure id", entryType: "blood_pressure", entryID: "99999"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("DELETE", fmt.Sprintf("/heart/%s/%s", tt.entryType, tt.entryID), nil)
			req.Header.Set("Authorization", "Bearer "+token)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != http.StatusNotFound {
				t.Fatalf("Expected status 404, got %d. Body: %s", w.Code, w.Body.String())
			}

			var response map[string]string
			if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
				t.Fatalf("Failed to parse response: %v", err)
			}

			if response["error"] != "Entry not found" {
				t.Errorf("Expected 'Entry not found', got %q", response["error"])
			}
		})
	}
}

func TestDeleteHeartHealthEntry_InvalidType(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := setupHeartHealthHandlerTestDB(t)
	token := createTestUser(t, db, 1, "delete_invalid_user")

	router := setupHeartHealthRouter()
	req := httptest.NewRequest("DELETE", "/heart/not_a_type/123", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400, got %d. Body: %s", w.Code, w.Body.String())
	}
}
