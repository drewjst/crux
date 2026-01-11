package scores

// RuleOf40Threshold is the benchmark score for passing the Rule of 40.
const RuleOf40Threshold = 40.0

// CalculateRuleOf40 computes the Rule of 40 score for SaaS/growth companies.
//
// The Rule of 40 states that a healthy growth company's revenue growth rate
// plus profit margin should equal or exceed 40%. This balances growth
// against profitability - a company can have lower margins if growing fast,
// or slower growth if highly profitable.
//
// Formula: Score = Revenue Growth % + Profit Margin %
// Passed: Score >= 40
func CalculateRuleOf40(data FinancialData) RuleOf40Result {
	// Calculate profit margin (using operating margin as proxy)
	profitMargin := calculateProfitMargin(data)

	// Revenue growth would need YoY comparison
	// For now, we use FCF margin as a profitability proxy
	revenueGrowth := calculateRevenueGrowth(data)

	score := revenueGrowth + profitMargin

	return RuleOf40Result{
		Score:                score,
		RevenueGrowthPercent: revenueGrowth,
		ProfitMarginPercent:  profitMargin,
		Passed:               score >= RuleOf40Threshold,
	}
}

// CalculateRuleOf40WithGrowth computes Rule of 40 with explicit YoY comparison.
func CalculateRuleOf40WithGrowth(current, previous FinancialData) RuleOf40Result {
	revenueGrowth := 0.0
	if previous.Revenue > 0 {
		revenueGrowth = ((current.Revenue - previous.Revenue) / previous.Revenue) * 100
	}

	profitMargin := calculateProfitMargin(current)
	score := revenueGrowth + profitMargin

	return RuleOf40Result{
		Score:                score,
		RevenueGrowthPercent: revenueGrowth,
		ProfitMarginPercent:  profitMargin,
		Passed:               score >= RuleOf40Threshold,
	}
}

// calculateProfitMargin returns operating margin as a percentage.
func calculateProfitMargin(data FinancialData) float64 {
	if data.Revenue == 0 {
		return 0
	}
	return (data.OperatingIncome / data.Revenue) * 100
}

// calculateRevenueGrowth is a placeholder - actual implementation
// requires YoY revenue comparison.
func calculateRevenueGrowth(data FinancialData) float64 {
	// This would typically come from comparing current vs prior year revenue
	// For single-period data, we can't calculate growth
	return 0
}
