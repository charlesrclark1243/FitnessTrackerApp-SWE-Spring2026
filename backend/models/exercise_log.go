package models

import "time"

type ExerciseLog struct {
	ID             uint      `gorm:"primaryKey"`
	UserID         uint      `gorm:"index;not null"`
	User           User      `gorm:"foreignKey:UserID;"`
	Type           string    `gorm:"not null"` // e.g., "Running", "Cycling"
	Duration       int       `gorm:"not null"` // in minutes
	CaloriesBurned int       `gorm:"not null"`
	LoggedAt       time.Time `gorm:"autoCreateTime"`
}
