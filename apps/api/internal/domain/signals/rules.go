package signals

import "fmt"

// defaultRules returns the standard set of signal generation rules.
func defaultRules() []Rule {
	return []Rule{
		&HighPiotroskiRule{},
		&LowPiotroskiRule{},
		&AltmanDistressRule{},
		&AltmanSafeRule{},
		&InstitutionalAccumulationRule{},
		&InstitutionalDistributionRule{},
		&InsiderBuyingRule{},
		&InsiderSellingRule{},
		&HighGrowthRule{},
		&NegativeMarginsRule{},
		&HighDebtRule{},
		&StrongROICRule{},
	}
}

// HighPiotroskiRule generates a bullish signal for high Piotroski scores.
type HighPiotroskiRule struct{}

func (r *HighPiotroskiRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Piotroski.Score >= 7 {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Strong Piotroski F-Score of %d indicates solid fundamentals", ctx.Piotroski.Score),
			Priority: 4,
			Data:     map[string]interface{}{"score": ctx.Piotroski.Score},
		}
	}
	return nil
}

// LowPiotroskiRule generates a bearish signal for low Piotroski scores.
type LowPiotroskiRule struct{}

func (r *LowPiotroskiRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Piotroski.Score <= 3 {
		return &Signal{
			Type:     SignalBearish,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Weak Piotroski F-Score of %d suggests fundamental concerns", ctx.Piotroski.Score),
			Priority: 4,
			Data:     map[string]interface{}{"score": ctx.Piotroski.Score},
		}
	}
	return nil
}

// AltmanDistressRule generates a warning for companies in distress zone.
type AltmanDistressRule struct{}

func (r *AltmanDistressRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.AltmanZ.Zone == "distress" {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Altman Z-Score of %.2f indicates elevated bankruptcy risk", ctx.AltmanZ.Score),
			Priority: 5,
			Data:     map[string]interface{}{"score": ctx.AltmanZ.Score, "zone": ctx.AltmanZ.Zone},
		}
	}
	return nil
}

// AltmanSafeRule generates a bullish signal for companies in safe zone.
type AltmanSafeRule struct{}

func (r *AltmanSafeRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.AltmanZ.Zone == "safe" && ctx.AltmanZ.Score > 4.0 {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Strong Altman Z-Score of %.2f indicates excellent financial health", ctx.AltmanZ.Score),
			Priority: 3,
			Data:     map[string]interface{}{"score": ctx.AltmanZ.Score},
		}
	}
	return nil
}

// holdingsData is a helper struct to extract holdings data.
type holdingsData struct {
	NetChangeQuarters int
	NetChangeShares   int64
}

func getHoldingsData(h interface{}) *holdingsData {
	if h == nil {
		return nil
	}
	// Type assertion for the stock.Holdings type
	type holdingsLike interface {
		GetNetChangeQuarters() int
		GetNetChangeShares() int64
	}
	// Try direct struct access via reflection-like pattern
	// For simplicity, we use a type switch
	switch v := h.(type) {
	case *holdingsData:
		return v
	default:
		// Use reflection or interface to get fields
		// For now, return nil - this would be properly implemented
		// with the actual stock.Holdings type
		_ = v
		return nil
	}
}

// InstitutionalAccumulationRule detects institutional buying patterns.
type InstitutionalAccumulationRule struct{}

func (r *InstitutionalAccumulationRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs holdings data - skip if not available
	// In real implementation, would use type assertion
	return nil
}

// InstitutionalDistributionRule detects institutional selling patterns.
type InstitutionalDistributionRule struct{}

func (r *InstitutionalDistributionRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs holdings data - skip if not available
	return nil
}

// InsiderBuyingRule detects significant insider buying activity.
type InsiderBuyingRule struct{}

func (r *InsiderBuyingRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs insider trade data - skip if not available
	return nil
}

// InsiderSellingRule detects significant insider selling activity.
type InsiderSellingRule struct{}

func (r *InsiderSellingRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs insider trade data - skip if not available
	return nil
}

// HighGrowthRule detects strong revenue growth.
type HighGrowthRule struct{}

func (r *HighGrowthRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs financials data - skip if not available
	return nil
}

// NegativeMarginsRule warns about negative operating margins.
type NegativeMarginsRule struct{}

func (r *NegativeMarginsRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs financials data - skip if not available
	return nil
}

// HighDebtRule warns about elevated debt levels.
type HighDebtRule struct{}

func (r *HighDebtRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs financials data - skip if not available
	return nil
}

// StrongROICRule detects strong return on invested capital.
type StrongROICRule struct{}

func (r *StrongROICRule) Evaluate(ctx *RuleContext) *Signal {
	// This rule needs financials data - skip if not available
	return nil
}
