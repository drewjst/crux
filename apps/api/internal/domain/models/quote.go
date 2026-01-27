package models

import "time"

// Quote represents real-time price and market data.
type Quote struct {
	Ticker        string
	Price         float64
	Change        float64
	ChangePercent float64
	Open          float64
	High          float64 // Day high
	Low           float64 // Day low
	YearHigh      float64 // 52-week high
	YearLow       float64 // 52-week low
	PrevClose     float64
	Volume        int64
	MarketCap     int64
	AsOf          time.Time
}
