package handlers

import (
	"net/http"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"

	"github.com/gin-gonic/gin"
)

type AddWeightLogRequest struct {
	WeightKG float64    `json:"weight_kg" binding:"required,gt=0"`
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

	loggedAt := time.Now()
	if req.LoggedAt != nil {
		loggedAt = *req.LoggedAt
	}

	weightLog := models.WeightLog{
		UserID:   userID,
		WeightKG: req.WeightKG,
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

	c.JSON(http.StatusOK, gin.H{
		"entries": weightLogs,
	})
}
