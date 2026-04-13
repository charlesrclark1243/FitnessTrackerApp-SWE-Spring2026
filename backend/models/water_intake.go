package models

import "time"

type WaterIntake struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	AmountML  int       `gorm:"not null" json:"amount_ml"`  // Amount in milliliters
	Unit	  string    `gorm:"size:10;default:'ml'" json:"unit"`
	LoggedAt  time.Time `gorm:"not null" json:"logged_at"`  // When they drank it
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// WaterIntakeSummary for daily/weekly summaries
type WaterIntakeSummary struct {
	Date        string  `json:"date"`         // YYYY-MM-DD
	TotalML     int     `json:"total_ml"`
	TotalOZ		float64		`json:"total_oz"`
	EntryCount  int     `json:"entry_count"`
	GoalML      int     `json:"goal_ml"`       // Optional daily goal
	GoalOZ		float64 `json:"goal_oz"`
	Percentage  float64 `json:"percentage"`    // % of goal achieved
}