package utils

import (
	"math"
	"testing"
)

func TestLbsToKg(t *testing.T) {
	tests := []struct {
		lbs      float64
		expected float64
	}{
		{0, 0},
		{100, 45.359237},
		{220.462262185, 100},
		{1, 0.45359237},
	}

	for _, tt := range tests {
		result := LbsToKg(tt.lbs)
		if math.Abs(result-tt.expected) > 0.000001 {
			t.Errorf("LbsToKg(%v) = %v; want %v", tt.lbs, result, tt.expected)
		}
	}
}

func TestKgToLbs(t *testing.T) {
	tests := []struct {
		kg       float64
		expected float64
	}{
		{0, 0},
		{100, 220.462262185},
		{45.359237, 100},
		{1, 2.20462262185},
	}

	for _, tt := range tests {
		result := KgToLbs(tt.kg)
		if math.Abs(result-tt.expected) > 0.000001 {
			t.Errorf("KgToLbs(%v) = %v; want %v", tt.kg, result, tt.expected)
		}
	}
}

func TestConvertWeightToKg(t *testing.T) {
	tests := []struct {
		weight   float64
		unit     string
		expected float64
	}{
		{100, "metric", 100},
		{100, "imperial", 45.359237},
		{220.462262185, "imperial", 100},
		{50, "metric", 50},
	}

	for _, tt := range tests {
		result := ConvertWeightToKg(tt.weight, tt.unit)
		if math.Abs(result-tt.expected) > 0.000001 {
			t.Errorf("ConvertWeightToKg(%v, %v) = %v; want %v", tt.weight, tt.unit, result, tt.expected)
		}
	}
}

func TestConvertWeightFromKg(t *testing.T) {
	tests := []struct {
		weightKg float64
		unit     string
		expected float64
	}{
		{100, "metric", 100},
		{100, "imperial", 220.462262185},
		{45.359237, "imperial", 100},
		{50, "metric", 50},
	}

	for _, tt := range tests {
		result := ConvertWeightFromKg(tt.weightKg, tt.unit)
		if math.Abs(result-tt.expected) > 0.000001 {
			t.Errorf("ConvertWeightFromKg(%v, %v) = %v; want %v", tt.weightKg, tt.unit, result, tt.expected)
		}
	}
}
