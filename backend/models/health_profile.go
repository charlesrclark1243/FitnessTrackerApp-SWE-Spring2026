package models

import "time"

type HealthProfile struct {
    ID             uint       `gorm:"primaryKey" json:"id"`
    UserID         uint       `gorm:"uniqueIndex;not null" json:"user_id"`
    DateOfBirth    *time.Time `json:"date_of_birth"`
    Sex            string     `gorm:"size:10" json:"sex"`
    HeightCM       float64    `json:"height_cm"`
    WeightKG       float64    `json:"weight_kg"`
    NeckCM         *float64   `json:"neck_cm"`
    WaistCM        *float64   `json:"waist_cm"`
    HipsCM         *float64   `json:"hips_cm"`
    ActivityLevel  string     `gorm:"size:20" json:"activity_level"`
    PreferredUnits string     `gorm:"size:10;default:metric" json:"preferred_units"`
    UpdatedAt      time.Time  `json:"updated_at"`
}

type ProfileStats struct {
	Age  int     `json:"age"`
	BMI  float64 `json:"bmi"`
	BFP  float64 `json:"bfp"`
	BMR  float64 `json:"bmr"`
	TDEE float64 `json:"tdee"`
}