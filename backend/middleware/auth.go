package middleware

import (
    "net/http"
	"strings"
	
	"github.com/gin-gonic/gin"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/utils"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // get header
        authHeader := c.GetHeader("Authorization")
        // make sure header exists
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
            c.Abort()
            return
        }

        // extract token
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        // make sure format was right
        if tokenString == authHeader {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format."})
            c.Abort()
            return
        }

        // validate token
        claims, err := utils.ValidateToken(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
            c.Abort()
            return
        }

        // token is valid, set user ID in context
        c.Set("userID", claims.UserID)
        // continue
        c.Next()
    }
}

// helper to get userID from context
func GetUserID(c *gin.Context) (uint, bool) {
    userID, exists := c.Get("userID")
    if !exists {
        return 0, false
    }
    
    id, ok := userID.(uint)
    return id, ok
}