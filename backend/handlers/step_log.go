package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

// LogSteps - POST /api/steps
func LogSteps(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Steps    int       `json:"steps" binding:"required"`
		Distance float64   `json:"distance_km"`
		LoggedAt time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validation
	if req.Steps <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Steps must be positive"})
		return
	}

	if req.Steps > 100000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Steps too large (max 100,000)"})
		return
	}

	if req.Distance < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Distance cannot be negative"})
		return
	}

	// Default to current time if not provided
	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now()
	}

	// Prevent future dates
	if req.LoggedAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot log future steps"})
		return
	}

	stepLog := models.StepLog{
		UserID:   userID,
		Steps:    req.Steps,
		Distance: req.Distance,
		LoggedAt: req.LoggedAt,
	}

	if err := database.DB.Create(&stepLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log steps"})
		return
	}

	c.JSON(http.StatusCreated, stepLog)
}

// GetStepLogs - GET /api/steps?date=YYYY-MM-DD
func GetStepLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	dateStr := c.Query("date")

	var logs []models.StepLog
	query := database.DB.Where("user_id = ?", userID)

	if dateStr != "" {
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}

		startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
		endOfDay := startOfDay.Add(24 * time.Hour)

		query = query.Where("logged_at >= ? AND logged_at < ?", startOfDay, endOfDay)
	}

	query = query.Order("logged_at DESC")

	if err := query.Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch step logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetRecentStepLogs - GET /api/steps/recent?limit=30
func GetRecentStepLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	limit := 30
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
			limit = parsedLimit
			if limit > 100 {
				limit = 100
			}
		}
	}

	var logs []models.StepLog
	err := database.DB.Where("user_id = ?", userID).
		Order("logged_at DESC").
		Limit(limit).
		Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent step logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetDailyStepSummary - GET /api/steps/summary?date=YYYY-MM-DD
func GetDailyStepSummary(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	dateStr := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var logs []models.StepLog
	err = database.DB.Where("user_id = ? AND logged_at >= ? AND logged_at < ?",
		userID, startOfDay, endOfDay).Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summary"})
		return
	}

	// Calculate totals
	totalSteps := 0
	totalKM := 0.0

	for _, log := range logs {
		totalSteps += log.Steps
		totalKM += log.Distance
	}

	// Default goal: 10,000 steps
	goalSteps := 10000
	percentage := (float64(totalSteps) / float64(goalSteps)) * 100

	summary := models.StepSummary{
		Date:       dateStr,
		TotalSteps: totalSteps,
		TotalKM:    utils.RoundToTwo(totalKM),
		EntryCount: len(logs),
		GoalSteps:  goalSteps,
		Percentage: utils.RoundToTwo(percentage),
	}

	c.JSON(http.StatusOK, summary)
}

// DeleteStepLog - DELETE /api/steps/:id
func DeleteStepLog(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	logID := c.Param("id")

	var log models.StepLog
	if err := database.DB.Where("id = ? AND user_id = ?", logID, userID).First(&log).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Step log not found"})
		return
	}

	if err := database.DB.Delete(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete step log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Step log deleted successfully"})
}