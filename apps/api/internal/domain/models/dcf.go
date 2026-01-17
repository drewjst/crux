package models

// DCF represents discounted cash flow valuation data.
type DCF struct {
	Ticker     string
	DCFValue   float64
	StockPrice float64
}
