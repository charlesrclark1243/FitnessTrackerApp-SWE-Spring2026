package models

import "time"

type CalorieIntake struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Calories    int       `gorm:"not null" json:"calories"`
	FoodName    string    `gorm:"size:200" json:"food_name"`    // Optional: what they ate
	MealType    string    `gorm:"size:50" json:"meal_type"`     // breakfast, lunch, dinner, snack
	LoggedAt    time.Time `gorm:"not null" json:"logged_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CalorieIntakeSummary struct {
	Date        string  `json:"date"`
	TotalCals   int     `json:"total_calories"`
	EntryCount  int     `json:"entry_count"`
	GoalCals    int     `json:"goal_calories"`
	Percentage  float64 `json:"percentage"`
	ByMealType  map[string]int `json:"by_meal_type"` // Breakdown by meal
}