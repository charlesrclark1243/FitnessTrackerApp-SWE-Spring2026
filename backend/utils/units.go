package utils

const (
	// LbPerKg is the conversion factor from kilograms to pounds
	LbPerKg = 2.20462262185
	// KgPerLb is the conversion factor from pounds to kilograms
	KgPerLb = 0.45359237
)

// LbsToKg converts pounds to kilograms
func LbsToKg(lbs float64) float64 {
	return lbs * KgPerLb
}

// KgToLbs converts kilograms to pounds
func KgToLbs(kg float64) float64 {
	return kg * LbPerKg
}

// ConvertWeightToKg converts weight to kg based on the unit system
// unit can be "metric" or "imperial"
func ConvertWeightToKg(weight float64, unit string) float64 {
	if unit == "imperial" {
		return LbsToKg(weight)
	}
	return weight // already in kg
}

// ConvertWeightFromKg converts weight from kg to the specified unit system
// unit can be "metric" or "imperial"
func ConvertWeightFromKg(weightKg float64, unit string) float64 {
	if unit == "imperial" {
		return KgToLbs(weightKg)
	}
	return weightKg
}
