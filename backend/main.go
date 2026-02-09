package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/handlers"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

func main() {
	// Initialize SQLite database
	db, err := gorm.Open(sqlite.Open("fitness.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Auto-migrate database models
	db.AutoMigrate(&models.User{}) // , &models.HealthProfile{})

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

	// Register endpoint
	r.POST("/api/auth/register", func(c *gin.Context) {
		var registerReq handlers.RegisterRequest

		// Bind and validate JSON
		if err := c.ShouldBindJSON(&registerReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if username already exists
		var existingUser models.User
		if err := db.Where("username = ?", registerReq.Username).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already taken."})
			return
		}

		// Hash the password
		hashedPassword, err := handlers.HashPassword(registerReq.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password."})
			return
		}

		// Create new user
		newUser := models.User{
			Username:     registerReq.Username,
			PasswordHash: hashedPassword,
		}

		// Save new user to database
		if err := db.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new user."})
			return
		}

		// Return success response
		c.JSON(http.StatusCreated, gin.H{
			"message": "User registered successfully",
			"user": gin.H{
				"id":       newUser.ID,
				"username": newUser.Username,
			},
		})
	})

	// Start the server
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
