package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

// LogWaterIntake - POST /api/water
func LogWaterIntake(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Amount   float64   `json:"amount" binding:"required"`
		Unit     string    `json:"unit"`                        // "ml" or "oz"
		LoggedAt time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default unit to ml
	if req.Unit == "" {
		req.Unit = "ml"
	}

	// Normalize unit
	req.Unit = strings.ToLower(req.Unit)

	// Validate unit
	if req.Unit != "ml" && req.Unit != "oz" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unit must be 'ml' or 'oz'"})
		return
	}

	// Validation
	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be positive"})
		return
	}

	// Convert to ML for storage
	var amountML int
	if req.Unit == "oz" {
		amountML = utils.OzToML(req.Amount)
		if amountML > 150000 { // ~5000 oz is crazy
			c.JSON(http.StatusBadRequest, gin.H{"error": "Amount too large"})
			return
		}
	} else {
		amountML = int(req.Amount)
		if amountML > 5000 { // Max 5 liters at once
			c.JSON(http.StatusBadRequest, gin.H{"error": "Amount too large (max 5000ml)"})
			return
		}
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
		AmountML: amountML,
		Unit:     req.Unit, // Store what unit they used
		LoggedAt: req.LoggedAt,
	}

	if err := database.DB.Create(&waterLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log water intake"})
		return
	}

	// Return with both units for display
	response := map[string]interface{}{
		"id":         waterLog.ID,
		"user_id":    waterLog.UserID,
		"amount_ml":  waterLog.AmountML,
		"amount_oz":  utils.RoundToTwo(utils.MLToOz(waterLog.AmountML)),
		"unit":       waterLog.Unit,
		"logged_at":  waterLog.LoggedAt,
		"created_at": waterLog.CreatedAt,
		"updated_at": waterLog.UpdatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetWaterIntakeLogs - GET /api/water?date=YYYY-MM-DD&unit=ml|oz
func GetWaterIntakeLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	dateStr := c.Query("date")

	var logs []models.WaterIntake
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch water logs"})
		return
	}

	// Add converted amounts to response
	response := make([]map[string]interface{}, len(logs))
	for i, log := range logs {
		response[i] = map[string]interface{}{
			"id":         log.ID,
			"user_id":    log.UserID,
			"amount_ml":  log.AmountML,
			"amount_oz":  utils.RoundToTwo(utils.MLToOz(log.AmountML)),
			"unit":       log.Unit, // Original unit they logged in
			"logged_at":  log.LoggedAt,
			"created_at": log.CreatedAt,
			"updated_at": log.UpdatedAt,
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetDailySummary - GET /api/water/summary?date=YYYY-MM-DD&unit=ml|oz
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

	// Calculate totals (always in ML internally)
	totalML := 0
	for _, log := range logs {
		totalML += log.AmountML
	}

	// Goal: 2000ml (about 68 oz)
	goalML := 2000
	percentage := (float64(totalML) / float64(goalML)) * 100

	summary := models.WaterIntakeSummary{
		Date:       dateStr,
		TotalML:    totalML,
		TotalOZ:    utils.RoundToTwo(utils.MLToOz(totalML)),
		EntryCount: len(logs),
		GoalML:     goalML,
		GoalOZ:     utils.RoundToTwo(utils.MLToOz(goalML)),
		Percentage: utils.RoundToTwo(percentage),
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