package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement"`
	Username     string    `gorm:"uniqueIndex;size:50;not null"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
}
