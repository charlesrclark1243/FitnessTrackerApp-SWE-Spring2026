package handlers

import (
	"net/http"
	"time"
	
	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

// LogWaterIntake - POST /api/water
func LogWaterIntake(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		AmountML int       `json:"amount_ml" binding:"required"`
		LoggedAt time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validation
	if req.AmountML <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be positive"})
		return
	}

	if req.AmountML > 5000 { // Max 5 liters at once seems reasonable
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount too large (max 5000ml)"})
		return
	}

	// Default to current time if not provided
	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now()
	}

	// Prevent future dates
	if req.LoggedAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot log future water intake"})
		return
	}

	waterLog := models.WaterIntake{
		UserID:   userID,
		AmountML: req.AmountML,
		LoggedAt: req.LoggedAt,
	}

	if err := database.DB.Create(&waterLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log water intake"})
		return
	}

	c.JSON(http.StatusCreated, waterLog)
}

// GetWaterIntakeLogs - GET /api/water?date=YYYY-MM-DD
func GetWaterIntakeLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	dateStr := c.Query("date") // Optional: filter by date

	var logs []models.WaterIntake
	query := database.DB.Where("user_id = ?", userID)

	if dateStr != "" {
		// Parse date and get start/end of day
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch water logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetDailySummary - GET /api/water/summary?date=YYYY-MM-DD
func GetDailySummary(c *gin.Context) {
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

	var logs []models.WaterIntake
	err = database.DB.Where("user_id = ? AND logged_at >= ? AND logged_at < ?", 
		userID, startOfDay, endOfDay).Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summary"})
		return
	}

	// Calculate totals
	totalML := 0
	for _, log := range logs {
		totalML += log.AmountML
	}

	// Recommended daily intake: 2000ml (can be customized per user later)
	goalML := 2000
	percentage := (float64(totalML) / float64(goalML)) * 100

	summary := models.WaterIntakeSummary{
		Date:       dateStr,
		TotalML:    totalML,
		EntryCount: len(logs),
		GoalML:     goalML,
		Percentage: roundToTwo(percentage),
	}

	c.JSON(http.StatusOK, summary)
}

// DeleteWaterLog - DELETE /api/water/:id
func DeleteWaterLog(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	logID := c.Param("id")

	// Verify ownership before deleting
	var log models.WaterIntake
	if err := database.DB.Where("id = ? AND user_id = ?", logID, userID).First(&log).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Water log not found"})
		return
	}

	if err := database.DB.Delete(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete water log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Water log deleted successfully"})
}

// Helper function
func roundToTwo(val float64) float64 {
	return float64(int(val*100+0.5)) / 100
}