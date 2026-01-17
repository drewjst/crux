package models

import "time"

// IndustryAverages represents average financial metrics for an industry.
// Used for comparing individual company metrics against sector/industry peers.
type IndustryAverages struct {
	Industry string
	Sector   string

	// Valuation multiples
	PE         float64
	ForwardPE  float64
	PEG        float64
	PB         float64
	PS         float64
	EVToEBITDA float64
	PriceToFCF float64

	// Profitability margins
	GrossMargin     float64
	OperatingMargin float64
	NetMargin       float64
	FCFMargin       float64
	ROE             float64
	ROIC            float64
	ROA             float64

	// Efficiency
	AssetTurnover     float64
	InventoryTurnover float64

	// Solvency / Financial Health
	DebtToEquity     float64
	CurrentRatio     float64
	QuickRatio       float64
	InterestCoverage float64

	// Growth (YoY)
	RevenueGrowth  float64
	EarningsGrowth float64
	FCFGrowth      float64

	// Dividend
	DividendYield float64

	// Metadata
	CompanyCount int       // Number of companies in the average
	AsOf         time.Time // Date of the data
}
