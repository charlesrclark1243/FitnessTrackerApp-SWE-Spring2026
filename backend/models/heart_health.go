package models

import "time"

type HeartRate struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Rate      uint      `gorm:"not null" json:"rate"` // Heart rate in beats per minute
	LoggedAt  time.Time `gorm:"not null" json:"logged_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type BloodPressure struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Systolic  uint      `gorm:"not null" json:"systolic"`  // Systolic pressure
	Diastolic uint      `gorm:"not null" json:"diastolic"` // Diastolic pressure
	LoggedAt  time.Time `gorm:"not null" json:"logged_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type HeartHealthSummary struct {
	Date         string `json:"date"` // YYYY-MM-DD
	AvgHeartRate uint   `json:"avg_heart_rate"`
	AvgSystolic  uint   `json:"avg_systolic"`
	AvgDiastolic uint   `json:"avg_diastolic"`
	EntryCount   int    `json:"entry_count"`
}
