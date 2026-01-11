package scores

// Altman Z-Score thresholds
const (
	AltmanZSafeThreshold     = 2.99
	AltmanZDistressThreshold = 1.81
)

// Altman Z-Score coefficients for the original manufacturing formula
const (
	coeffA = 1.2 // Working Capital / Total Assets
	coeffB = 1.4 // Retained Earnings / Total Assets
	coeffC = 3.3 // EBIT / Total Assets
	coeffD = 0.6 // Market Cap / Total Liabilities
	coeffE = 1.0 // Sales / Total Assets
)

// CalculateAltmanZScore computes the Altman Z-Score for bankruptcy prediction.
//
// The Z-Score combines five financial ratios to predict the probability
// of a company going bankrupt within two years.
//
// Formula: Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E
// Where:
//
//	A = Working Capital / Total Assets
//	B = Retained Earnings / Total Assets
//	C = EBIT / Total Assets
//	D = Market Value of Equity / Total Liabilities
//	E = Sales / Total Assets
//
// Zones:
//
//	Z > 2.99: Safe Zone (low probability of bankruptcy)
//	1.81 < Z < 2.99: Gray Zone (uncertain)
//	Z < 1.81: Distress Zone (high probability of bankruptcy)
func CalculateAltmanZScore(data FinancialData) AltmanZResult {
	components := calculateZScoreComponents(data)
	score := calculateZScore(components)
	zone := determineZone(score)

	return AltmanZResult{
		Score:      score,
		Zone:       zone,
		Components: components,
	}
}

// calculateZScoreComponents computes each component of the Z-Score formula.
func calculateZScoreComponents(data FinancialData) AltmanZComponents {
	components := AltmanZComponents{}

	if data.TotalAssets > 0 {
		workingCapital := data.CurrentAssets - data.CurrentLiabilities
		components.WorkingCapitalToAssets = workingCapital / data.TotalAssets
		components.RetainedEarningsToAssets = data.RetainedEarnings / data.TotalAssets
		components.EBITToAssets = data.EBIT / data.TotalAssets
		components.SalesToAssets = data.Revenue / data.TotalAssets
	}

	if data.TotalLiabilities > 0 {
		components.MarketCapToLiabilities = data.MarketCap / data.TotalLiabilities
	}

	return components
}

// calculateZScore applies the Altman formula to compute the final score.
func calculateZScore(c AltmanZComponents) float64 {
	return (coeffA * c.WorkingCapitalToAssets) +
		(coeffB * c.RetainedEarningsToAssets) +
		(coeffC * c.EBITToAssets) +
		(coeffD * c.MarketCapToLiabilities) +
		(coeffE * c.SalesToAssets)
}

// determineZone classifies the Z-Score into risk categories.
func determineZone(score float64) string {
	switch {
	case score > AltmanZSafeThreshold:
		return "safe"
	case score < AltmanZDistressThreshold:
		return "distress"
	default:
		return "gray"
	}
}
