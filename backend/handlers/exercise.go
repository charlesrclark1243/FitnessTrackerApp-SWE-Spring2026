package handlers

import (
	"github.com/gin-gonic/gin"

	"net/http"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

func LogExercise(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Type           string    `json:"type" binding:"required"`     // non-empty
		Duration       int       `json:"duration" binding:"required"` // in minutes
		CaloriesBurned int       `json:"calories_burned" binding:"required"`
		LoggedAt       time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validation
	if req.Duration <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Duration must be positive"})
		return
	}

	if req.CaloriesBurned < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Calories burned cannot be negative"})
		return
	}

	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now()
	}

	if req.LoggedAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot log future exercise"})
		return
	}

	exerciseLog := models.ExerciseLog{
		UserID:         userID,
		Type:           req.Type,
		Duration:       req.Duration,
		CaloriesBurned: req.CaloriesBurned,
		LoggedAt:       req.LoggedAt,
	}

	if err := database.DB.Create(&exerciseLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log exercise"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise logged successfully"})
}

func GetExerciseLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var exerciseLogs []models.ExerciseLog
	if err := database.DB.Where("user_id = ?", userID).Order("logged_at desc").Limit(30).Find(&exerciseLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve exercise logs"})
		return
	}

	response := make([]gin.H, len(exerciseLogs))
	for i, log := range exerciseLogs {
		response[i] = gin.H{
			"id":              log.ID,
			"type":            log.Type,
			"duration":        log.Duration,
			"calories_burned": log.CaloriesBurned,
			"logged_at":       log.LoggedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{"exercise_logs": response})
}
