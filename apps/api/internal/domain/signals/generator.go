package signals

import (
	"sort"

	"github.com/drewjst/recon/apps/api/internal/domain/scores"
)

// Generator creates signals from various data sources.
type Generator struct {
	rules []Rule
}

// NewGenerator creates a new signal generator with default rules.
func NewGenerator() *Generator {
	return &Generator{
		rules: defaultRules(),
	}
}

// Company is a minimal interface for company data needed by signals.
type Company interface {
	GetTicker() string
}

// Quote is a minimal interface for quote data needed by signals.
type Quote interface{}

// Financials is a minimal interface for financials data needed by signals.
type Financials interface {
	GetRevenueGrowthYoY() float64
	GetOperatingMargin() float64
	GetDebtToEquity() float64
	GetROIC() float64
}

// Holdings is a minimal interface for holdings data needed by signals.
type Holdings interface {
	GetNetChangeQuarters() int
	GetNetChangeShares() int64
}

// InsiderTrade is a minimal interface for insider trade data needed by signals.
type InsiderTrade interface {
	GetTradeType() string
	GetValue() int64
}

// GenerateAll generates signals from all available data sources.
// Uses interface{} to avoid circular imports with stock package.
func (g *Generator) GenerateAll(
	company interface{},
	quote interface{},
	financials interface{},
	holdings interface{},
	insiderTrades interface{},
	piotroski scores.PiotroskiResult,
	altmanZ scores.AltmanZResult,
) []Signal {
	ctx := &RuleContext{
		Company:       company,
		Quote:         quote,
		Financials:    financials,
		Holdings:      holdings,
		InsiderTrades: insiderTrades,
		Piotroski:     piotroski,
		AltmanZ:       altmanZ,
	}

	var signals []Signal
	for _, rule := range g.rules {
		if signal := rule.Evaluate(ctx); signal != nil {
			signals = append(signals, *signal)
		}
	}

	// Sort by priority (highest first)
	sort.Slice(signals, func(i, j int) bool {
		return signals[i].Priority > signals[j].Priority
	})

	return signals
}

// RuleContext contains all data available for signal generation.
type RuleContext struct {
	Company       interface{}
	Quote         interface{}
	Financials    interface{}
	Holdings      interface{}
	InsiderTrades interface{}
	Piotroski     scores.PiotroskiResult
	AltmanZ       scores.AltmanZResult
}

// Rule defines the interface for signal generation rules.
type Rule interface {
	Evaluate(ctx *RuleContext) *Signal
}
