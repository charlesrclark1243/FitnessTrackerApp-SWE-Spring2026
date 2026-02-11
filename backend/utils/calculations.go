package utils

import (
	"time"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

// calculate age from date of birth
func CalculateAge(dob *time.Time) int {
	if dob == nil {
		return 0
	}
	now := time.Now()
	age := now.Year() - dob.Year()
	
	// adjust if birthday hasn't occurred this year yet
	if now.Month() < dob.Month() || (now.Month() == dob.Month() && now.Day() < dob.Day()) {
		age--
	}
	
	return age
}

// calculate BMI (Body Mass Index)
// formula: weight (kg) / height (m)²
func CalculateBMI(weightKG, heightCM float64) float64 {
	if heightCM <= 0 || weightKG <= 0 {
		return 0
	}
	heightM := heightCM / 100
	return roundToTwo(weightKG / (heightM * heightM))
}

// calculate Body Fat Percentage using Deurenberg formula
// formula: (1.20 × BMI) + (0.23 × Age) − (10.8 × Sex) − 5.4
// sex: 1 for male, 0 for female
func CalculateBFP(bmi float64, age int, sex string) float64 {
	var sexFactor float64
	if sex == "male" {
		sexFactor = 1
	} else {
		sexFactor = 0
	}
	
	bfp := (1.20 * bmi) + (0.23 * float64(age)) - (10.8 * sexFactor) - 5.4
	return roundToTwo(bfp)
}

// calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
// male: (10 × weight) + (6.25 × height) - (5 × age) + 5
// female: (10 × weight) + (6.25 × height) - (5 × age) - 161
func CalculateBMR(weightKG, heightCM float64, age int, sex string) float64 {
	if sex == "male" {
		return roundToTwo((10 * weightKG) + (6.25 * heightCM) - (5 * float64(age)) + 5)
	}
	return roundToTwo((10 * weightKG) + (6.25 * heightCM) - (5 * float64(age)) - 161)
}

// calculate TDEE (Total Daily Energy Expenditure)
// TDEE = BMR × Activity Level Multiplier
func CalculateTDEE(bmr float64, activityLevel string) float64 {
	activityMultipliers := map[string]float64{
		"sedentary":   1.2,   // Little or no exercise
		"light":       1.375, // Light exercise 1-3 days/week
		"moderate":    1.55,  // Moderate exercise 3-5 days/week
		"active":      1.725, // Hard exercise 6-7 days/week
		"very_active": 1.9,   // Very hard exercise, physical job
	}

	multiplier, ok := activityMultipliers[activityLevel]
	if !ok {
		multiplier = 1.2 // Default to sedentary
	}

	return roundToTwo(bmr * multiplier)
}

// main function to calculate all stats from a health profile
func CalculateStats(profile *models.HealthProfile) models.ProfileStats {
	age := CalculateAge(profile.DateOfBirth)
	bmi := CalculateBMI(profile.WeightKG, profile.HeightCM)
	bfp := CalculateBFP(bmi, age, profile.Sex)
	bmr := CalculateBMR(profile.WeightKG, profile.HeightCM, age, profile.Sex)
	tdee := CalculateTDEE(bmr, profile.ActivityLevel)

	return models.ProfileStats{
		Age:  age,
		BMI:  bmi,
		BFP:  bfp,
		BMR:  bmr,
		TDEE: tdee,
	}
}

// helper function to round to 2 decimal places
func roundToTwo(val float64) float64 {
	return float64(int(val*100+0.5)) / 100
}