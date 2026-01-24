package models

// QuarterlyRatio represents a single quarter's valuation ratios for historical analysis.
type QuarterlyRatio struct {
	Date       string  `json:"date"`
	PE         float64 `json:"pe"`
	PS         float64 `json:"ps"`
	PB         float64 `json:"pb"`
	PriceToFCF float64 `json:"priceToFcf"`
	EVToEBITDA float64 `json:"evToEbitda"`
	PEG        float64 `json:"peg"`
}

// SectorPE represents sector-level P/E ratio data.
type SectorPE struct {
	Date     string  `json:"date"`
	Sector   string  `json:"sector"`
	Exchange string  `json:"exchange"`
	PE       float64 `json:"pe"`
}

// IndustryPE represents industry-level P/E ratio data (more granular than sector).
type IndustryPE struct {
	Date     string  `json:"date"`
	Industry string  `json:"industry"`
	Exchange string  `json:"exchange"`
	PE       float64 `json:"pe"`
}

// PeerValuation represents a peer company's valuation metrics for sector comparison.
type PeerValuation struct {
	Ticker     string   `json:"ticker"`
	Name       string   `json:"name"`
	PE         *float64 `json:"pe"`         // nil if negative earnings
	EVToEBITDA *float64 `json:"evToEbitda"` // nil if not available
	PS         *float64 `json:"ps"`         // nil if not available
	PB         *float64 `json:"pb"`         // nil if not available
	PriceToFCF *float64 `json:"priceToFcf"` // nil if not available
	PEG        *float64 `json:"peg"`        // nil if not available
	Growth     *float64 `json:"growth"`     // EPS growth rate (percentage), nil if not available
}

// HistoricalContext provides context for historical P/E percentile calculation.
type HistoricalContext struct {
	CurrentPE  float64          `json:"currentPE"`
	MinPE5Y    float64          `json:"minPE5Y"`
	MaxPE5Y    float64          `json:"maxPE5Y"`
	Percentile float64          `json:"percentile"`
	History    []QuarterlyRatio `json:"history"`
}

// SectorMedians contains median values for each valuation metric.
type SectorMedians struct {
	PE         *float64 `json:"pe"`
	EVToEBITDA *float64 `json:"evToEbitda"`
	PS         *float64 `json:"ps"`
	PB         *float64 `json:"pb"`
	PriceToFCF *float64 `json:"priceToFcf"`
	PEG        *float64 `json:"peg"`
	Growth     *float64 `json:"growth"`
}

// SectorContext provides context for sector P/E percentile calculation.
type SectorContext struct {
	PeerMedianPE float64         `json:"peerMedianPE"`
	Percentile   float64         `json:"percentile"`
	Peers        []PeerValuation `json:"peers"`
	Medians      *SectorMedians  `json:"medians"` // Medians for all metrics
	Insight      string          `json:"insight"` // Auto-generated insight text
}

// GrowthContext provides context for growth justification (PEG-based).
type GrowthContext struct {
	PEG       float64 `json:"peg"`
	ForwardPE float64 `json:"forwardPE"`
	EPSGrowth float64 `json:"epsGrowth"`
}

// ValuationTeaser is a minimal summary for the dashboard card.
type ValuationTeaser struct {
	Sentiment string `json:"sentiment"` // "cheap", "fair", "expensive"
	Headline  string `json:"headline"`  // e.g., "Trading at 85th percentile of 5Y range"
}

// ValuationMetricRow represents a single metric with comparison context.
type ValuationMetricRow struct {
	Key           string   `json:"key"`
	Label         string   `json:"label"`
	Current       *float64 `json:"current"`
	FiveYearAvg   *float64 `json:"fiveYearAvg"`
	SectorMedian  *float64 `json:"sectorMedian"`
	SPAvg         *float64 `json:"spAvg"`
	Percentile    *float64 `json:"percentile"`
	LowerIsBetter bool     `json:"lowerIsBetter"`
}

// DCFAnalysis contains DCF valuation and margin of safety calculations.
type DCFAnalysis struct {
	IntrinsicValue    float64  `json:"intrinsicValue"`
	CurrentPrice      float64  `json:"currentPrice"`
	DifferencePercent float64  `json:"differencePercent"`
	MarginOfSafety    float64  `json:"marginOfSafety"`
	ImpliedGrowthRate *float64 `json:"impliedGrowthRate"`
	Assessment        string   `json:"assessment"` // "Undervalued", "Fairly Valued", "Overvalued", "N/A"
}

// OwnerEarningsAnalysis contains Buffett-style owner earnings data.
type OwnerEarningsAnalysis struct {
	OwnerEarnings         float64 `json:"ownerEarnings"`         // Total owner earnings
	OwnerEarningsPerShare float64 `json:"ownerEarningsPerShare"` // Per share
	OwnerEarningsYield    float64 `json:"ownerEarningsYield"`    // OE / Market Cap as percentage
	MaintenanceCapex      float64 `json:"maintenanceCapex"`      // Maintenance capex (subtracted)
	GrowthCapex           float64 `json:"growthCapex"`           // Growth capex (not subtracted)
}

// ValuationSignal represents a valuation-related signal.
type ValuationSignal struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Sentiment   string `json:"sentiment"` // "bullish", "bearish", "neutral"
}

// ValuationDeepDive contains full valuation analysis for the deep dive page.
type ValuationDeepDive struct {
	Ticker      string `json:"ticker"`
	CompanyName string `json:"companyName"`

	// Historical Valuation (vs 5Y P/E history)
	HistoricalScore   *int               `json:"historicalScore"`   // 1-10
	HistoricalContext *HistoricalContext `json:"historicalContext"` // nil if no data

	// Sector Valuation (vs peer P/Es)
	SectorScore   *int           `json:"sectorScore"`   // 1-10
	SectorContext *SectorContext `json:"sectorContext"` // nil if no data

	// Growth Justification (PEG-based)
	GrowthScore   *int           `json:"growthScore"`   // 1-10
	GrowthContext *GrowthContext `json:"growthContext"` // nil if no data

	// Overall verdict
	Verdict   string `json:"verdict"`   // Summary sentence
	Sentiment string `json:"sentiment"` // "cheap", "fair", "expensive"

	// Key Valuation Metrics with context
	KeyMetrics []ValuationMetricRow `json:"keyMetrics"`

	// DCF / Intrinsic Value Analysis
	DCFAnalysis *DCFAnalysis `json:"dcfAnalysis"`

	// Owner Earnings Analysis (Buffett-style)
	OwnerEarningsAnalysis *OwnerEarningsAnalysis `json:"ownerEarningsAnalysis"`

	// Valuation Signals Summary
	Signals []ValuationSignal `json:"signals"`
}
