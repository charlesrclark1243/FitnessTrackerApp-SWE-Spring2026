package utils

import (
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

func setupHeartHealthUtilsTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	if err := db.AutoMigrate(&models.HeartRate{}, &models.BloodPressure{}); err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	database.DB = db
	return db
}

func TestComputeMedianHeartRate(t *testing.T) {
	tests := []struct {
		name       string
		heartRates []uint
		expected   uint
	}{
		{name: "empty", heartRates: []uint{}, expected: 0},
		{name: "odd count", heartRates: []uint{100, 60, 80}, expected: 80},
		{name: "even count", heartRates: []uint{90, 60, 80, 70}, expected: 75},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := computeMedianHeartRate(tt.heartRates); got != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, got)
			}
		})
	}
}

func TestCalculateMedianHeartRate(t *testing.T) {
	db := setupHeartHealthUtilsTestDB(t)
	now := time.Now().UTC()

	db.Create(&models.HeartRate{UserID: 1, Rate: 70, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 1, Rate: 90, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 1, Rate: 80, LoggedAt: now})
	db.Create(&models.HeartRate{UserID: 2, Rate: 200, LoggedAt: now})

	median, err := CalculateMedianHeartRate(1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if median != 80 {
		t.Errorf("Expected median 80, got %d", median)
	}
}

func TestComputeMedianBloodPressure_OddCount(t *testing.T) {
	readings := []models.BloodPressure{
		{Systolic: 120, Diastolic: 80},
		{Systolic: 110, Diastolic: 70},
		{Systolic: 130, Diastolic: 85},
	}

	s, d := computeMedianBloodPressure(readings)
	if s != 120 || d != 80 {
		t.Errorf("Expected median pair 120/80, got %d/%d", s, d)
	}
}

func TestComputeMedianBloodPressure_EvenCountChoosesNearestPair(t *testing.T) {
	readings := []models.BloodPressure{
		{Systolic: 140, Diastolic: 90},
		{Systolic: 120, Diastolic: 80},
	}

	s, d := computeMedianBloodPressure(readings)
	if s != 120 || d != 80 {
		t.Errorf("Expected median pair 120/80, got %d/%d", s, d)
	}
}

func TestComputeMedianBloodPressure_Empty(t *testing.T) {
	s, d := computeMedianBloodPressure(nil)
	if s != 0 || d != 0 {
		t.Errorf("Expected 0/0 for empty readings, got %d/%d", s, d)
	}
}

func TestCalculateMedianBloodPressure(t *testing.T) {
	db := setupHeartHealthUtilsTestDB(t)
	now := time.Now().UTC()

	db.Create(&models.BloodPressure{UserID: 1, Systolic: 120, Diastolic: 80, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 1, Systolic: 110, Diastolic: 70, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 1, Systolic: 130, Diastolic: 85, LoggedAt: now})
	db.Create(&models.BloodPressure{UserID: 2, Systolic: 190, Diastolic: 120, LoggedAt: now})

	s, d, err := CalculateMedianBloodPressure(1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if s != 120 || d != 80 {
		t.Errorf("Expected median pair 120/80, got %d/%d", s, d)
	}
}
