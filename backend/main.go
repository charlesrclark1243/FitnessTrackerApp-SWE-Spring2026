package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/routes"
)

func main() {
	// Initialize the database connection and perform migrations
	database.Connect()

	// Create a new Gin router with default middleware (logger and recovery)
	r := gin.Default()

	// Define routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Fitness Tracker API"})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK"})
	})

	routes.SetupRoutes(r, database.GetDB())

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
