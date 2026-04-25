package utils

import (
	"sort"

	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/database"
	"github.com/charlesrclark1243/FitnessTrackerApp-SWE-Spring2026/backend/models"
)

type bpWithMAP struct {
	systolic  uint
	diastolic uint
	mapValue  float64
}

func computeMedianHeartRate(heartRates []uint) uint {
	n := len(heartRates)
	if n == 0 {
		return 0
	}

	// Sort the heart rates
	sort.Slice(heartRates, func(i, j int) bool {
		return heartRates[i] < heartRates[j]
	})

	if n%2 == 1 {
		return heartRates[n/2]
	}
	return (heartRates[n/2-1] + heartRates[n/2]) / 2
}

func CalculateMedianHeartRate(userID uint) (uint, error) {
	var heartRates []uint
	err := database.DB.Model(&models.HeartRate{}).Where("user_id = ?", userID).Pluck("rate", &heartRates).Error
	if err != nil {
		return 0, err
	}

	return computeMedianHeartRate(heartRates), nil
}

func computeMedianBloodPressure(readings []models.BloodPressure) (uint, uint) {
	if len(readings) == 0 {
		return 0, 0
	}

	pairs := make([]bpWithMAP, 0, len(readings))
	for _, reading := range readings {
		pairs = append(pairs, bpWithMAP{
			systolic:  reading.Systolic,
			diastolic: reading.Diastolic,
			mapValue:  float64(reading.Systolic+2*reading.Diastolic) / 3,
		})
	}

	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].mapValue == pairs[j].mapValue {
			if pairs[i].systolic == pairs[j].systolic {
				return pairs[i].diastolic < pairs[j].diastolic
			}
			return pairs[i].systolic < pairs[j].systolic
		}

		return pairs[i].mapValue < pairs[j].mapValue
	})

	n := len(pairs)
	if n%2 == 1 {
		median := pairs[n/2]
		return median.systolic, median.diastolic
	}

	lower := pairs[n/2-1]
	upper := pairs[n/2]
	targetMAP := (lower.mapValue + upper.mapValue) / 2

	lowerDist := absFloat64(lower.mapValue - targetMAP)
	upperDist := absFloat64(upper.mapValue - targetMAP)

	if lowerDist <= upperDist {
		return lower.systolic, lower.diastolic
	}

	return upper.systolic, upper.diastolic
}

func CalculateMedianBloodPressure(userID uint) (uint, uint, error) {
	var readings []models.BloodPressure
	err := database.DB.Model(&models.BloodPressure{}).
		Where("user_id = ?", userID).
		Select("systolic", "diastolic").
		Find(&readings).Error
	if err != nil {
		return 0, 0, err
	}

	systolic, diastolic := computeMedianBloodPressure(readings)
	return systolic, diastolic, nil
}

func absFloat64(v float64) float64 {
	if v < 0 {
		return -v
	}

	return v
}
