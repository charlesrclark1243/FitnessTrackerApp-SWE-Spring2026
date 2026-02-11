package handlers


import (
    "net/http"
	"time"
	
	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func GetProfile(c *gin.Context) {
    // validate through middleware
    userID, ok := middleware.GetUserID(c)
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // if valid, get profile
    var profile models.HealthProfile
    if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
        return
    }

    c.JSON(http.StatusOK, profile)
}

func UpdateProfile(c *gin.Context) {
    userID, ok := middleware.GetUserID(c)
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var req models.HealthProfile
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // validation
	if req.HeightCM <= 0 || req.WeightKG <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Height and weight must be positive"})
		return
	}

	if req.Sex != "male" && req.Sex != "female" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sex must be 'male' or 'female'"})
		return
	}

	if req.DateOfBirth != nil && req.DateOfBirth.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date of birth cannot be in the future"})
		return
	}

    validActivities := map[string]bool{
		"sedentary": true, "light": true, "moderate": true, 
		"active": true, "very_active": true,
	}

	if req.ActivityLevel != "" && !validActivities[req.ActivityLevel] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid activity level"})
		return
	}


    // check if profile already exists
    var profile models.HealthProfile
    err := database.DB.Where("user_id = ?", userID).First(&profile).Error

    if err != nil {
        // does not exist, create new profile
        profile = models.HealthProfile{
            UserID:         userID,
            DateOfBirth:    req.DateOfBirth,
            Sex:            req.Sex,
            HeightCM:       req.HeightCM,
            WeightKG:       req.WeightKG,
            NeckCM:         req.NeckCM,
            WaistCM:        req.WaistCM,
            HipsCM:         req.HipsCM,
            ActivityLevel:  req.ActivityLevel,
            PreferredUnits: req.PreferredUnits,
        }
        if err := database.DB.Create(&profile).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
            return
        }
    } else {
        // does exist, update existing profile
		profile.HeightCM = req.HeightCM;
		profile.WeightKG = req.WeightKG;
		profile.NeckCM = req.NeckCM;
		profile.WaistCM = req.WaistCM;
		profile.HipsCM = req.HipsCM;
		profile.ActivityLevel = req.ActivityLevel;
		profile.PreferredUnits = req.PreferredUnits;
		profile.UpdatedAt = req.UpdatedAt;

        if err := database.DB.Save(&profile).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
            return
        }
    }

    c.JSON(http.StatusOK, profile)
}

func GetStats(c *gin.Context) {
    userID, ok := middleware.GetUserID(c)
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var profile models.HealthProfile
    if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found. Please create a profile first."})
        return
    }

    stats := utils.CalculateStats(&profile)

    c.JSON(http.StatusOK, stats)
}
