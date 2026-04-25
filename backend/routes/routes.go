package routes

import (
	"gorm.io/gorm"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/handlers"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	api := router.Group("/api")
	{
		//public endpoints
		api.POST("/auth/register", func(c *gin.Context) {
			handlers.Register(c, db)
		})
		api.POST("/auth/login", func(c *gin.Context) {
			handlers.Login(c, db)
		})

		// protected endpoints
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// health Profile CRUD
			protected.GET("/profile", handlers.GetProfile)
			protected.PUT("/profile", handlers.UpdateProfile)

			// stats calculation
			protected.GET("/profile/stats", handlers.GetStats)

			// water intake
			protected.POST("/water", handlers.LogWaterIntake)
			protected.GET("/water", handlers.GetWaterIntakeLogs)
			protected.GET("/water/summary", handlers.GetDailySummary)
			protected.DELETE("/water/:id", handlers.DeleteWaterLog)

			// weight log CRUD
			protected.PUT("/weight/add", handlers.AddWeightLog)
			protected.GET("/weight/logs", handlers.GetWeightLogs)
			protected.POST("/weight/modify", handlers.ModifyLastWeight)

			// calorie goal calculation
			protected.POST("/caloriegoal", handlers.CalculateCalorieGoal)

			// exercise log CRUD
			protected.POST("/exercise/add", handlers.LogExercise)
			protected.GET("/exercise/logs", handlers.GetExerciseLogs)

			// Calorie intake routes
			protected.POST("/calories", handlers.LogCalorieIntake)
			protected.GET("/calories", handlers.GetCalorieIntakeLogs)
			protected.GET("/calories/summary", handlers.GetDailyCalorieSummary)
			protected.DELETE("/calories/:id", handlers.DeleteCalorieLog)

			// Step log routes
			protected.POST("/steps", handlers.LogSteps)
			protected.GET("/steps", handlers.GetStepLogs)
			protected.GET("/steps/recent", handlers.GetRecentStepLogs)
			protected.GET("/steps/summary", handlers.GetDailyStepSummary)
			protected.DELETE("/steps/:id", handlers.DeleteStepLog)

			// Heart health routes
			protected.POST("/heart/rate", handlers.LogHeartRate)
			protected.POST("/heart/blood-pressure", handlers.LogBloodPressure)
			protected.GET("/heart/summary", handlers.GetHeartHealthSummary)
			protected.DELETE("/heart/:type/:id", handlers.DeleteHeartHealthEntry)
		}
	}
}
