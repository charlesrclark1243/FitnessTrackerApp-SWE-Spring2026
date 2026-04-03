package handlers

import (
	"github.com/gin-gonic/gin"

	"net/http"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func CalculateCalorieGoal(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		TargetDirection string `json:"target_direction" binding:"required"` // "lose", "hold", or "gain"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.TargetDirection != "lose" && req.TargetDirection != "hold" && req.TargetDirection != "gain" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target_direction must be 'lose', 'hold', or 'gain'"})
		return
	}

	// get activity level from health profile
	var profile models.HealthProfile
	if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve health profile"})
		return
	}

	tdee := utils.CalculateTDEE(
		utils.CalculateBMR(profile.WeightKG, profile.HeightCM, utils.CalculateAge(profile.DateOfBirth), profile.Sex),
		profile.ActivityLevel,
	)

	var calorieAdjustment float64
	if req.TargetDirection == "lose" {
		calorieAdjustment = -300 // 500 calorie deficit for weight loss
	} else if req.TargetDirection == "hold" {
		calorieAdjustment = 0 // No change for weight maintenance
	} else {
		calorieAdjustment = 300 // 500 calorie surplus for weight gain
	}

	adjustedCalories := tdee + calorieAdjustment

	c.JSON(http.StatusOK, gin.H{
		"adjusted_calories": adjustedCalories,
	})
}
