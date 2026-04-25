package handlers

import (
	"net/http"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
	"github.com/gin-gonic/gin"
)

func GetHeartHealthSummary(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	medianHeartRate, err := utils.CalculateMedianHeartRate(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve heart health summary"})
		return
	}

	systolic, diastolic, err := utils.CalculateMedianBloodPressure(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve heart health summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"median_heart_rate": medianHeartRate,
		"median_systolic":   systolic,
		"median_diastolic":  diastolic,
	})
}

func LogHeartRate(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Rate     uint      `json:"rate" binding:"required"`
		LoggedAt time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Rate <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Heart rate must be greater than 0"})
		return
	}

	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now().UTC()
	}

	heartRate := models.HeartRate{
		UserID:   userID,
		Rate:     req.Rate,
		LoggedAt: req.LoggedAt,
	}

	if err := database.DB.Create(&heartRate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log heart rate"})
		return
	}

	c.JSON(http.StatusOK, heartRate)
}

func LogBloodPressure(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Systolic  uint      `json:"systolic" binding:"required"`
		Diastolic uint      `json:"diastolic" binding:"required"`
		LoggedAt  time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Systolic <= 0 || req.Diastolic <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blood pressure values must be greater than 0"})
		return
	}

	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now().UTC()
	}

	bloodPressure := models.BloodPressure{
		UserID:    userID,
		Systolic:  req.Systolic,
		Diastolic: req.Diastolic,
		LoggedAt:  req.LoggedAt,
	}

	if err := database.DB.Create(&bloodPressure).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log blood pressure"})
		return
	}

	c.JSON(http.StatusOK, bloodPressure)
}

func DeleteHeartHealthEntry(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	entryType := c.Param("type")
	entryID := c.Param("id")

	var rowsAffected int64
	switch entryType {
	case "heart_rate":
		result := database.DB.Where("id = ? AND user_id = ?", entryID, userID).Delete(&models.HeartRate{})
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete entry"})
			return
		}
		rowsAffected = result.RowsAffected
	case "blood_pressure":
		result := database.DB.Where("id = ? AND user_id = ?", entryID, userID).Delete(&models.BloodPressure{})
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete entry"})
			return
		}
		rowsAffected = result.RowsAffected
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry type"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
}
