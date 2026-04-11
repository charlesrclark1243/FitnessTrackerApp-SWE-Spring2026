package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
	"github.com/gin-gonic/gin"
)

// LogCalorieIntake - POST /api/calories
func LogCalorieIntake(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Calories int       `json:"calories" binding:"required"`
		FoodName string    `json:"food_name"`
		MealType string    `json:"meal_type"`
		LoggedAt time.Time `json:"logged_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validation
	if req.Calories <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Calories must be positive"})
		return
	}

	if req.Calories > 10000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Calories too large (max 10000)"})
		return
	}

	// Validate meal type if provided
	if req.MealType != "" {
		req.MealType = strings.ToLower(req.MealType)
		validMealTypes := []string{"breakfast", "lunch", "dinner", "snack"}
		valid := false
		for _, mt := range validMealTypes {
			if req.MealType == mt {
				valid = true
				break
			}
		}
		if !valid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Meal type must be: breakfast, lunch, dinner, or snack"})
			return
		}
	}

	// Default to current time if not provided
	if req.LoggedAt.IsZero() {
		req.LoggedAt = time.Now()
	}

	// Prevent future dates
	if req.LoggedAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot log future calorie intake"})
		return
	}

	calorieLog := models.CalorieIntake{
		UserID:   userID,
		Calories: req.Calories,
		FoodName: req.FoodName,
		MealType: req.MealType,
		LoggedAt: req.LoggedAt,
	}

	if err := database.DB.Create(&calorieLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log calorie intake"})
		return
	}

	c.JSON(http.StatusCreated, calorieLog)
}

// GetCalorieIntakeLogs - GET /api/calories?date=YYYY-MM-DD
func GetCalorieIntakeLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	dateStr := c.Query("date")

	var logs []models.CalorieIntake
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calorie logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetRecentCalorieLogs - GET /api/calories/recent?limit=30
func GetRecentCalorieLogs(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Default limit to 30, allow customization
	limit := 30
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
			limit = parsedLimit
			// Cap at 100 to prevent excessive queries
			if limit > 100 {
				limit = 100
			}
		}
	}

	var logs []models.CalorieIntake
	err := database.DB.Where("user_id = ?", userID).
		Order("logged_at DESC").
		Limit(limit).
		Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent calorie logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// GetDailyCalorieSummary - GET /api/calories/summary?date=YYYY-MM-DD
func GetDailyCalorieSummary(c *gin.Context) {
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

	var logs []models.CalorieIntake
	err = database.DB.Where("user_id = ? AND logged_at >= ? AND logged_at < ?",
		userID, startOfDay, endOfDay).Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch summary"})
		return
	}

	// Calculate totals
	totalCals := 0
	byMealType := make(map[string]int)

	for _, log := range logs {
		totalCals += log.Calories
		if log.MealType != "" {
			byMealType[log.MealType] += log.Calories
		}
	}

	// Get user's TDEE as goal (if profile exists)
	var profile models.HealthProfile
	goalCals := 2000

	err = database.DB.Where("user_id = ?", userID).First(&profile).Error
	if err == nil && profile.DateOfBirth != nil {
		// Calculate TDEE as goal
		age := utils.CalculateAge(profile.DateOfBirth) // Remove the * (DateOfBirth is already *time.Time)
		bmr := utils.CalculateBMR(profile.WeightKG, profile.HeightCM, age, profile.Sex)
		tdee := utils.CalculateTDEE(bmr, profile.ActivityLevel)

		var calorieAdjustment float64
		if profile.WeightGoal == "lose" {
			calorieAdjustment = -300
		} else if profile.WeightGoal == "hold" {
			calorieAdjustment = 0
		} else if profile.WeightGoal == "gain" {
			calorieAdjustment = 300
		}

		goalCals = int(tdee + calorieAdjustment)
	}

	percentage := (float64(totalCals) / float64(goalCals)) * 100

	summary := models.CalorieIntakeSummary{
		Date:       dateStr,
		TotalCals:  totalCals,
		EntryCount: len(logs),
		GoalCals:   goalCals,
		Percentage: utils.RoundToTwo(percentage),
		ByMealType: byMealType,
	}

	c.JSON(http.StatusOK, summary)
}

// DeleteCalorieLog - DELETE /api/calories/:id
func DeleteCalorieLog(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	logID := c.Param("id")

	var log models.CalorieIntake
	if err := database.DB.Where("id = ? AND user_id = ?", logID, userID).First(&log).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Calorie log not found"})
		return
	}

	if err := database.DB.Delete(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete calorie log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Calorie log deleted successfully"})
}
