package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"gorm.io/gorm/logger"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // ← Add this
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.HealthProfile{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

func TestRegister_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})

	// create request
	body := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["message"] != "User registered successfully" {
		t.Errorf("Expected success message")
	}

	user, ok := response["user"].(map[string]interface{})
	if !ok {
		t.Fatal("Expected user object in response")
	}

	if user["token"] == nil {
		t.Error("Expected token in response")
	}

	if user["username"] != "testuser" {
		t.Errorf("Expected username 'testuser', got %v", user["username"])
	}
}

func TestRegister_DuplicateUsername(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)

	// create existing user
	existingUser := models.User{
		Username:     "testuser",
		PasswordHash: "hash",
	}
	db.Create(&existingUser)

	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})

	// request with duplicate username
	body := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Errorf("Expected status 409, got %d", w.Code)
	}

	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Username already taken." {
		t.Errorf("Expected 'Username already taken.' error, got %s", response["error"])
	}
}

func TestRegister_ShortUsername(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})

	// request with short username
	body := map[string]string{
		"username": "user",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestRegister_ShortPassword(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})

	// request with short password
	body := map[string]string{
		"username": "testuser",
		"password": "pass",
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestLogin_Success(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)

	// create a user first
	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})
	router.POST("/login", func(c *gin.Context) {
		Login(c, db)
	})

	// register user
	regBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(regBody)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// login
	loginBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	jsonBody, _ = json.Marshal(loginBody)
	req = httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["token"] == nil {
		t.Error("Expected token in response")
	}

	if response["message"] != "Login successful" {
		t.Errorf("Expected success message")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	router := gin.New()
	router.POST("/register", func(c *gin.Context) {
		Register(c, db)
	})
	router.POST("/login", func(c *gin.Context) {
		Login(c, db)
	})

	// register user
	regBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(regBody)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// try login with wrong password
	loginBody := map[string]string{
		"username": "testuser",
		"password": "wrongpassword",
	}
	jsonBody, _ = json.Marshal(loginBody)
	req = httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestLogin_NonexistentUser(t *testing.T) {
	// setup
	gin.SetMode(gin.TestMode)
	db := setupTestDB(t)
	router := gin.New()
	router.POST("/login", func(c *gin.Context) {
		Login(c, db)
	})

	// try login with nonexistent user
	loginBody := map[string]string{
		"username": "nonexistent",
		"password": "password123",
	}
	jsonBody, _ := json.Marshal(loginBody)
	req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}