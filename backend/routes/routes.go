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
		api.POST("/auth/register/", func(c *gin.Context) {
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
		}
	}
}
