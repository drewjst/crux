package models

import "time"

// AnalystEstimates contains analyst estimates, ratings, and price targets.
type AnalystEstimates struct {
	Ticker string

	// Consensus Rating
	Rating          string  // "Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"
	RatingScore     float64 // 1.0 (Strong Sell) to 5.0 (Strong Buy)
	AnalystCount    int
	StrongBuyCount  int
	BuyCount        int
	HoldCount       int
	SellCount       int
	StrongSellCount int

	// Price Targets
	PriceTargetHigh    float64
	PriceTargetLow     float64
	PriceTargetAverage float64
	PriceTargetMedian  float64

	// EPS Estimates
	EPSEstimateCurrentY float64
	EPSEstimateNextY    float64
	EPSGrowthNextY      float64 // Percentage growth

	// Revenue Estimates
	RevenueEstimateCurrentY float64
	RevenueEstimateNextY    float64
	RevenueGrowthNextY      float64 // Percentage growth

	AsOf time.Time
}
