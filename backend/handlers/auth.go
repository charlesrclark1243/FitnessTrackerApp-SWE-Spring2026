package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"net/http"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)


type registerRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}


func Register(c *gin.Context, db *gorm.DB) {
	var registerReq registerRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&registerReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ensure username meets length requirements
	if len(registerReq.Username) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be at least 6 characters long."})
		return
	} else if len(registerReq.Username) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must not exceed 50 characters."})
		return
	}

	// Ensure password meets length requirements
	if len(registerReq.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters long."})
		return
	}

	// Check if username already exists
	var existingUser models.User
	if err := db.Where("username = ?", registerReq.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already taken."})
		return
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(registerReq.Password)
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

	//generate token
	token, err := utils.GenerateToken(newUser.ID, newUser.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return success response
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"token":    token,
			"id":       newUser.ID,
			"username": newUser.Username,
		},
	})
}

func Login(c *gin.Context, db *gorm.DB) {
	var loginReq loginRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by username
	var user models.User
	if err := db.Where("username = ?", loginReq.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username."})
		return
	}

	// Check password
	if !utils.CheckPasswordHash(user.PasswordHash, loginReq.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password."})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token."})
		return
	}

	// Return success response with token
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}
