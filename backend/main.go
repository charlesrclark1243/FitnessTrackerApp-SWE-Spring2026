package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Initialize SQLite database
	db, err := gorm.Open(sqlite.Open("fitness.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to databse: ", err)
	}

	// Auto-migrate database models
	// db.AutoMigrate(&models.User{}, &models.HealthProfile{})

	// Create a new Gin router with default middleware (logger and recovery)
	r := gin.Default()

	// Define routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Fitness Tracker API",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
		})
	})

	// Start the server
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
