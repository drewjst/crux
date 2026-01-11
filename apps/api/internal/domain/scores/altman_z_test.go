package scores

import (
	"math"
	"testing"
)

func TestCalculateAltmanZScore_SafeZone(t *testing.T) {
	// Strong company with healthy financials
	data := FinancialData{
		CurrentAssets:      500000,
		CurrentLiabilities: 200000,
		TotalAssets:        1000000,
		RetainedEarnings:   300000,
		EBIT:               150000,
		MarketCap:          2000000,
		TotalLiabilities:   400000,
		Revenue:            800000,
	}

	result := CalculateAltmanZScore(data)

	if result.Zone != "safe" {
		t.Errorf("expected zone 'safe', got '%s' (score: %.2f)", result.Zone, result.Score)
	}

	if result.Score <= AltmanZSafeThreshold {
		t.Errorf("expected score > %.2f, got %.2f", AltmanZSafeThreshold, result.Score)
	}
}

func TestCalculateAltmanZScore_DistressZone(t *testing.T) {
	// Struggling company with poor financials
	data := FinancialData{
		CurrentAssets:      100000,
		CurrentLiabilities: 300000, // Negative working capital
		TotalAssets:        500000,
		RetainedEarnings:   -100000, // Accumulated losses
		EBIT:               -50000,  // Operating losses
		MarketCap:          100000,
		TotalLiabilities:   450000,
		Revenue:            200000,
	}

	result := CalculateAltmanZScore(data)

	if result.Zone != "distress" {
		t.Errorf("expected zone 'distress', got '%s' (score: %.2f)", result.Zone, result.Score)
	}

	if result.Score >= AltmanZDistressThreshold {
		t.Errorf("expected score < %.2f, got %.2f", AltmanZDistressThreshold, result.Score)
	}
}

func TestCalculateAltmanZScore_GrayZone(t *testing.T) {
	// Company in uncertain territory
	data := FinancialData{
		CurrentAssets:      250000,
		CurrentLiabilities: 200000,
		TotalAssets:        600000,
		RetainedEarnings:   50000,
		EBIT:               40000,
		MarketCap:          400000,
		TotalLiabilities:   350000,
		Revenue:            450000,
	}

	result := CalculateAltmanZScore(data)

	if result.Zone != "gray" {
		t.Errorf("expected zone 'gray', got '%s' (score: %.2f)", result.Zone, result.Score)
	}

	if result.Score <= AltmanZDistressThreshold || result.Score >= AltmanZSafeThreshold {
		t.Errorf("expected score between %.2f and %.2f, got %.2f",
			AltmanZDistressThreshold, AltmanZSafeThreshold, result.Score)
	}
}

func TestCalculateAltmanZScore_Components(t *testing.T) {
	data := FinancialData{
		CurrentAssets:      300000,
		CurrentLiabilities: 100000,
		TotalAssets:        1000000,
		RetainedEarnings:   200000,
		EBIT:               100000,
		MarketCap:          800000,
		TotalLiabilities:   400000,
		Revenue:            500000,
	}

	result := CalculateAltmanZScore(data)

	// Working Capital / Total Assets = (300000 - 100000) / 1000000 = 0.2
	expectedWC := 0.2
	if math.Abs(result.Components.WorkingCapitalToAssets-expectedWC) > 0.001 {
		t.Errorf("WorkingCapitalToAssets: expected %.3f, got %.3f",
			expectedWC, result.Components.WorkingCapitalToAssets)
	}

	// Retained Earnings / Total Assets = 200000 / 1000000 = 0.2
	expectedRE := 0.2
	if math.Abs(result.Components.RetainedEarningsToAssets-expectedRE) > 0.001 {
		t.Errorf("RetainedEarningsToAssets: expected %.3f, got %.3f",
			expectedRE, result.Components.RetainedEarningsToAssets)
	}

	// EBIT / Total Assets = 100000 / 1000000 = 0.1
	expectedEBIT := 0.1
	if math.Abs(result.Components.EBITToAssets-expectedEBIT) > 0.001 {
		t.Errorf("EBITToAssets: expected %.3f, got %.3f",
			expectedEBIT, result.Components.EBITToAssets)
	}

	// Market Cap / Total Liabilities = 800000 / 400000 = 2.0
	expectedMC := 2.0
	if math.Abs(result.Components.MarketCapToLiabilities-expectedMC) > 0.001 {
		t.Errorf("MarketCapToLiabilities: expected %.3f, got %.3f",
			expectedMC, result.Components.MarketCapToLiabilities)
	}

	// Sales / Total Assets = 500000 / 1000000 = 0.5
	expectedSales := 0.5
	if math.Abs(result.Components.SalesToAssets-expectedSales) > 0.001 {
		t.Errorf("SalesToAssets: expected %.3f, got %.3f",
			expectedSales, result.Components.SalesToAssets)
	}
}

func TestCalculateAltmanZScore_ZeroAssets(t *testing.T) {
	data := FinancialData{
		TotalAssets: 0,
	}

	result := CalculateAltmanZScore(data)

	// Should handle zero assets gracefully without panicking
	if result.Score != 0 {
		t.Errorf("expected score 0 with zero assets, got %.2f", result.Score)
	}

	if result.Zone != "distress" {
		t.Errorf("expected zone 'distress' with zero score, got '%s'", result.Zone)
	}
}

func TestCalculateAltmanZScore_ZeroLiabilities(t *testing.T) {
	data := FinancialData{
		CurrentAssets:      500000,
		CurrentLiabilities: 100000,
		TotalAssets:        1000000,
		RetainedEarnings:   300000,
		EBIT:               150000,
		MarketCap:          2000000,
		TotalLiabilities:   0, // No liabilities (rare but possible)
		Revenue:            800000,
	}

	result := CalculateAltmanZScore(data)

	// Should handle zero liabilities - MarketCapToLiabilities would be 0
	if result.Components.MarketCapToLiabilities != 0 {
		t.Errorf("expected MarketCapToLiabilities 0 with zero liabilities, got %.2f",
			result.Components.MarketCapToLiabilities)
	}
}
