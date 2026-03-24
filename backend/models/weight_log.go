package models

import "time"

type WeightLog struct {
	ID       uint      `gorm:"primaryKey"`
	UserID   uint      `gorm:"index;not null"`
	User     User      `gorm:"foreignKey:UserID;"`
	WeightKG float64   `gorm:"not null"`
	LoggedAt time.Time `gorm:"autoCreateTime"`
}
