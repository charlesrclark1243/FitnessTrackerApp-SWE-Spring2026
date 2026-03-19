package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"

	"github.com/gin-gonic/gin"
)

type AddWeightLogRequest struct {
	Weight   float64    `json:"weight" binding:"required,gt=0"`
	Unit     string     `json:"unit"` // "metric" (kg) or "imperial" (lbs), optional
	LoggedAt *time.Time `json:"logged_at"`
}

type ModifyLastWeightRequest struct {
	Weight   float64    `json:"weight" binding:"required,gt=0"`
	Unit     string     `json:"unit"` // "metric" (kg) or "imperial" (lbs), optional
	LoggedAt *time.Time `json:"logged_at"`
}

func AddWeightLog(c *gin.Context) {
	userID := c.GetUint("userID")

	var req AddWeightLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})

		return
	}

	// Get user's preferred units from health profile
	var profile models.HealthProfile
	preferredUnits := "metric" // default
	if err := database.GetDB().Where("user_id = ?", userID).First(&profile).Error; err == nil {
		preferredUnits = profile.PreferredUnits
	}

	// If unit is not specified in request, use user's preferred units
	unit := req.Unit
	if unit == "" {
		unit = preferredUnits
	}

	// Convert to kg for storage (canonical format)
	weightKG := utils.ConvertWeightToKg(req.Weight, unit)

	// Server is the source of truth for log time.
	// Any client-supplied logged_at is intentionally ignored.
	loggedAt := time.Now()

	weightLog := models.WeightLog{
		UserID:   userID,
		WeightKG: weightKG,
		LoggedAt: loggedAt,
	}

	if err := database.GetDB().Create(&weightLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to add weight log: " + err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Weight log added successfully",
		"log":     weightLog,
	})
}

func GetWeightLogs(c *gin.Context) {
	userID := c.GetUint("userID")

	// Get user's preferred units from health profile
	var profile models.HealthProfile
	preferredUnits := "metric" // default
	if err := database.GetDB().Where("user_id = ?", userID).First(&profile).Error; err == nil {
		preferredUnits = profile.PreferredUnits
	}

	var weightLogs []models.WeightLog
	result := database.GetDB().Where(
		"user_id = ?", userID,
	).Order(
		"logged_at DESC",
	).Limit(30).Find(&weightLogs)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch weight logs: " + result.Error.Error(),
		})

		return
	}

	// Convert weights to user's preferred units for display
	type WeightLogResponse struct {
		ID       uint      `json:"id"`
		UserID   uint      `json:"user_id"`
		Weight   float64   `json:"weight"`
		Unit     string    `json:"unit"`
		LoggedAt time.Time `json:"logged_at"`
	}

	response := make([]WeightLogResponse, len(weightLogs))
	for i, log := range weightLogs {
		response[i] = WeightLogResponse{
			ID:       log.ID,
			UserID:   log.UserID,
			Weight:   utils.ConvertWeightFromKg(log.WeightKG, preferredUnits),
			Unit:     preferredUnits,
			LoggedAt: log.LoggedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"entries": response,
	})
}

func ModifyLastWeight(c *gin.Context) {
	userID := c.GetUint("userID")

	// Get user's preferred units from health profile
	var profile models.HealthProfile
	preferredUnits := "metric" // default
	if err := database.GetDB().Where("user_id = ?", userID).First(&profile).Error; err == nil {
		preferredUnits = profile.PreferredUnits
	}

	var weightLogs []models.WeightLog
	result := database.GetDB().Where(
		"user_id = ?", userID,
	).Order(
		"logged_at DESC",
	).Limit(1).Find(&weightLogs)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch weight logs: " + result.Error.Error(),
		})

		return
	}

	if len(weightLogs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No weight logs found to modify",
		})

		return
	}

	lastLog := weightLogs[0]
	var req ModifyLastWeightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})

		return
	}

	// If unit is not specified in request, use user's preferred units
	unit := req.Unit
	if unit == "" {
		unit = preferredUnits
	}

	// Convert to kg for storage (canonical format)
	lastLog.WeightKG = utils.ConvertWeightToKg(req.Weight, unit)
	if req.LoggedAt != nil {
		lastLog.LoggedAt = *req.LoggedAt
	}

	if err := database.GetDB().Save(&lastLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to modify weight log: " + err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Weight log modified successfully to " + fmt.Sprintf("%.2f", utils.ConvertWeightFromKg(lastLog.WeightKG, preferredUnits)) + " " + preferredUnits,
		"log":     lastLog,
	})
}
