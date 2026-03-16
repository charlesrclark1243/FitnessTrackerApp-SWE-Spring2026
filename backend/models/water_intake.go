package models

import "time"

type WaterIntake struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	AmountML  int       `gorm:"not null" json:"amount_ml"`  // Amount in milliliters
	LoggedAt  time.Time `gorm:"not null" json:"logged_at"`  // When they drank it
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// WaterIntakeSummary for daily/weekly summaries
type WaterIntakeSummary struct {
	Date        string  `json:"date"`         // YYYY-MM-DD
	TotalML     int     `json:"total_ml"`
	EntryCount  int     `json:"entry_count"`
	GoalML      int     `json:"goal_ml"`       // Optional daily goal
	Percentage  float64 `json:"percentage"`    // % of goal achieved
}