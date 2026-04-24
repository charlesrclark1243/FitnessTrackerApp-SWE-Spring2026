package models

import "time"

type StepLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Steps     int       `gorm:"not null" json:"steps"`
	Distance  float64   `json:"distance_km"`    // Optional: distance in kilometers
	LoggedAt  time.Time `gorm:"not null" json:"logged_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type StepSummary struct {
	Date       string  `json:"date"`
	TotalSteps int     `json:"total_steps"`
	TotalKM    float64 `json:"total_km"`
	EntryCount int     `json:"entry_count"`
	GoalSteps  int     `json:"goal_steps"`      // Default: 10,000 steps
	Percentage float64 `json:"percentage"`
}