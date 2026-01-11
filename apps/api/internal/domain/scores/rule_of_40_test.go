package scores

import "testing"

func TestCalculateRuleOf40WithGrowth_Passed(t *testing.T) {
	current := FinancialData{
		Revenue:         120000000, // $120M
		OperatingIncome: 24000000,  // 20% margin
	}
	previous := FinancialData{
		Revenue: 100000000, // $100M (20% growth)
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// 20% growth + 20% margin = 40
	if !result.Passed {
		t.Errorf("expected Passed=true, got false (score: %.2f)", result.Score)
	}

	if result.Score < 39.9 || result.Score > 40.1 {
		t.Errorf("expected score ~40, got %.2f", result.Score)
	}
}

func TestCalculateRuleOf40WithGrowth_Failed(t *testing.T) {
	current := FinancialData{
		Revenue:         110000000, // $110M
		OperatingIncome: 11000000,  // 10% margin
	}
	previous := FinancialData{
		Revenue: 100000000, // $100M (10% growth)
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// 10% growth + 10% margin = 20
	if result.Passed {
		t.Errorf("expected Passed=false, got true (score: %.2f)", result.Score)
	}

	if result.Score < 19.9 || result.Score > 20.1 {
		t.Errorf("expected score ~20, got %.2f", result.Score)
	}
}

func TestCalculateRuleOf40WithGrowth_HighGrowthLowMargin(t *testing.T) {
	current := FinancialData{
		Revenue:         200000000, // $200M
		OperatingIncome: 10000000,  // 5% margin
	}
	previous := FinancialData{
		Revenue: 100000000, // $100M (100% growth!)
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// 100% growth + 5% margin = 105
	if !result.Passed {
		t.Errorf("expected Passed=true, got false (score: %.2f)", result.Score)
	}

	if result.RevenueGrowthPercent < 99.9 || result.RevenueGrowthPercent > 100.1 {
		t.Errorf("expected revenue growth ~100%%, got %.2f%%", result.RevenueGrowthPercent)
	}
}

func TestCalculateRuleOf40WithGrowth_HighMarginNoGrowth(t *testing.T) {
	current := FinancialData{
		Revenue:         100000000, // $100M
		OperatingIncome: 45000000,  // 45% margin
	}
	previous := FinancialData{
		Revenue: 100000000, // $100M (0% growth)
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// 0% growth + 45% margin = 45
	if !result.Passed {
		t.Errorf("expected Passed=true, got false (score: %.2f)", result.Score)
	}

	if result.RevenueGrowthPercent != 0 {
		t.Errorf("expected 0%% growth, got %.2f%%", result.RevenueGrowthPercent)
	}
}

func TestCalculateRuleOf40WithGrowth_NegativeMargin(t *testing.T) {
	current := FinancialData{
		Revenue:         150000000, // $150M
		OperatingIncome: -15000000, // -10% margin (losing money)
	}
	previous := FinancialData{
		Revenue: 100000000, // $100M (50% growth)
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// 50% growth + (-10%) margin = 40
	if !result.Passed {
		t.Errorf("expected Passed=true, got false (score: %.2f)", result.Score)
	}

	if result.ProfitMarginPercent > -9.9 || result.ProfitMarginPercent < -10.1 {
		t.Errorf("expected margin ~-10%%, got %.2f%%", result.ProfitMarginPercent)
	}
}

func TestCalculateRuleOf40WithGrowth_ZeroPreviousRevenue(t *testing.T) {
	current := FinancialData{
		Revenue:         100000000,
		OperatingIncome: 20000000,
	}
	previous := FinancialData{
		Revenue: 0, // No previous revenue
	}

	result := CalculateRuleOf40WithGrowth(current, previous)

	// Can't calculate growth with zero previous revenue
	if result.RevenueGrowthPercent != 0 {
		t.Errorf("expected 0%% growth with zero previous revenue, got %.2f%%", result.RevenueGrowthPercent)
	}

	// Should still calculate profit margin
	if result.ProfitMarginPercent < 19.9 || result.ProfitMarginPercent > 20.1 {
		t.Errorf("expected margin ~20%%, got %.2f%%", result.ProfitMarginPercent)
	}
}
