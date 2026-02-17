package main

import (
	"log"
	
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/routes"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func main() {
	// Initialize database
	db, err := gorm.Open(sqlite.Open("fitness.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("Database connected successfully")

	database.DB = db

	// Auto-migrate database models
	db.AutoMigrate(&models.User{}, &models.HealthProfile{})
	log.Println("Migrations completed successfully")

	//Create a new Gin router with default middleware (logger and recovery)
	r := gin.Default()


	// Define routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Fitness Tracker API"})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK"})
	})


	routes.SetupRoutes(r, db)

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}