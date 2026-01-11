// Package signals contains the signal generation logic for stock analysis.
package signals

// SignalType represents the sentiment of a signal.
type SignalType string

const (
	SignalBullish SignalType = "bullish"
	SignalBearish SignalType = "bearish"
	SignalWarning SignalType = "warning"
)

// SignalCategory represents the source category of a signal.
type SignalCategory string

const (
	CategoryInsider       SignalCategory = "insider"
	CategoryInstitutional SignalCategory = "institutional"
	CategoryFundamental   SignalCategory = "fundamental"
	CategoryValuation     SignalCategory = "valuation"
	CategoryTechnical     SignalCategory = "technical"
)

// Signal represents an actionable insight derived from data analysis.
type Signal struct {
	Type     SignalType             `json:"type"`
	Category SignalCategory         `json:"category"`
	Message  string                 `json:"message"`
	Priority int                    `json:"priority"` // 1-5, higher = more important
	Data     map[string]interface{} `json:"data,omitempty"`
}
