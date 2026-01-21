package signals

import (
	"fmt"
)

// Signal threshold constants
const (
	// Piotroski F-Score thresholds
	PiotroskiStrongScore = 7
	PiotroskiWeakScore   = 3

	// Altman Z-Score thresholds
	AltmanSafeThreshold = 4.0

	// Insider activity thresholds
	InsiderBuyCountThreshold  = 3
	InsiderBuyValueThreshold  = 100000
	InsiderSellCountThreshold = 5
	InsiderSellValueThreshold = -500000

	// Growth and margin thresholds
	HighGrowthThreshold = 20

	// Leverage thresholds
	HighDebtToEquityThreshold = 2.0

	// ROIC thresholds
	StrongROICThreshold = 20

	// Short interest thresholds (percent of float)
	LowShortInterestThreshold      = 5
	ElevatedShortInterestThreshold = 10
	VeryHighShortInterestThreshold = 20

	// Days to cover thresholds
	LowDaysToCoverThreshold      = 2
	ModerateDaysToCoverThreshold = 5
	HighDaysToCoverThreshold     = 10
)

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
		// Short interest rules
		&LowShortInterestRule{},
		&ElevatedShortInterestRule{},
		&VeryHighShortInterestRule{},
		&LowDaysToCoverRule{},
		&ModerateDaysToCoverRule{},
		&HighDaysToCoverRule{},
	}
}

// HighPiotroskiRule generates a bullish signal for high Piotroski scores.
type HighPiotroskiRule struct{}

func (r *HighPiotroskiRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Piotroski.Score >= PiotroskiStrongScore {
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
	if ctx.Piotroski.Score <= PiotroskiWeakScore {
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
	if ctx.AltmanZ.Zone == "safe" && ctx.AltmanZ.Score > AltmanSafeThreshold {
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

// InstitutionalAccumulationRule detects institutional buying patterns.
type InstitutionalAccumulationRule struct{}

func (r *InstitutionalAccumulationRule) Evaluate(ctx *RuleContext) *Signal {
	// Holdings data not reliably available in current API
	return nil
}

// InstitutionalDistributionRule detects institutional selling patterns.
type InstitutionalDistributionRule struct{}

func (r *InstitutionalDistributionRule) Evaluate(ctx *RuleContext) *Signal {
	// Holdings data not reliably available in current API
	return nil
}

// InsiderBuyingRule detects significant insider buying activity.
type InsiderBuyingRule struct{}

func (r *InsiderBuyingRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.InsiderActivity == nil {
		return nil
	}
	// Bullish if net buying and multiple buys
	if ctx.InsiderActivity.BuyCount90d >= InsiderBuyCountThreshold && ctx.InsiderActivity.NetValue90d > InsiderBuyValueThreshold {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryInsider,
			Message:  fmt.Sprintf("Strong insider buying: %d buys totaling $%.0fK net in 90 days", ctx.InsiderActivity.BuyCount90d, ctx.InsiderActivity.NetValue90d/1000),
			Priority: 4,
			Data:     map[string]interface{}{"buyCount": ctx.InsiderActivity.BuyCount90d, "netValue": ctx.InsiderActivity.NetValue90d},
		}
	}
	return nil
}

// InsiderSellingRule detects significant insider selling activity.
type InsiderSellingRule struct{}

func (r *InsiderSellingRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.InsiderActivity == nil {
		return nil
	}
	// Warning if heavy selling
	if ctx.InsiderActivity.SellCount90d >= InsiderSellCountThreshold && ctx.InsiderActivity.NetValue90d < InsiderSellValueThreshold {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryInsider,
			Message:  fmt.Sprintf("Heavy insider selling: %d sells totaling $%.0fM net in 90 days", ctx.InsiderActivity.SellCount90d, ctx.InsiderActivity.NetValue90d/1000000),
			Priority: 3,
			Data:     map[string]interface{}{"sellCount": ctx.InsiderActivity.SellCount90d, "netValue": ctx.InsiderActivity.NetValue90d},
		}
	}
	return nil
}

// HighGrowthRule detects strong revenue growth.
type HighGrowthRule struct{}

func (r *HighGrowthRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Financials == nil {
		return nil
	}
	// Strong growth > 20% YoY
	if ctx.Financials.RevenueGrowthYoY > HighGrowthThreshold {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Strong revenue growth of %.1f%% YoY", ctx.Financials.RevenueGrowthYoY),
			Priority: 3,
			Data:     map[string]interface{}{"growth": ctx.Financials.RevenueGrowthYoY},
		}
	}
	return nil
}

// NegativeMarginsRule warns about negative operating margins.
type NegativeMarginsRule struct{}

func (r *NegativeMarginsRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Financials == nil {
		return nil
	}
	// Warning if operating margin is negative
	if ctx.Financials.OperatingMargin < 0 {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Negative operating margin of %.1f%% indicates unprofitable operations", ctx.Financials.OperatingMargin),
			Priority: 4,
			Data:     map[string]interface{}{"margin": ctx.Financials.OperatingMargin},
		}
	}
	return nil
}

// HighDebtRule warns about elevated debt levels.
type HighDebtRule struct{}

func (r *HighDebtRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Financials == nil {
		return nil
	}
	// Warning if D/E > 2.0 (high leverage)
	if ctx.Financials.DebtToEquity > HighDebtToEquityThreshold {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("High debt-to-equity ratio of %.2f indicates elevated leverage", ctx.Financials.DebtToEquity),
			Priority: 3,
			Data:     map[string]interface{}{"debtToEquity": ctx.Financials.DebtToEquity},
		}
	}
	return nil
}

// StrongROICRule detects strong return on invested capital.
type StrongROICRule struct{}

func (r *StrongROICRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.Financials == nil {
		return nil
	}
	// Bullish if ROIC > 20% (strong capital efficiency)
	if ctx.Financials.ROIC > StrongROICThreshold {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryFundamental,
			Message:  fmt.Sprintf("Excellent ROIC of %.1f%% shows strong capital efficiency", ctx.Financials.ROIC),
			Priority: 3,
			Data:     map[string]interface{}{"roic": ctx.Financials.ROIC},
		}
	}
	return nil
}

// Short Interest Rules
// These rules analyze short selling activity to identify potential signals.

// LowShortInterestRule generates a bullish signal for low short interest.
type LowShortInterestRule struct{}

func (r *LowShortInterestRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.ShortPercentFloat <= 0 {
		return nil
	}
	// Bullish if short interest < 5% of float
	if ctx.ShortInterest.ShortPercentFloat < LowShortInterestThreshold {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("Low short interest at %.1f%% of float", ctx.ShortInterest.ShortPercentFloat),
			Priority: 2,
			Data:     map[string]interface{}{"shortPercent": ctx.ShortInterest.ShortPercentFloat},
		}
	}
	return nil
}

// ElevatedShortInterestRule generates a bearish signal for elevated short interest.
type ElevatedShortInterestRule struct{}

func (r *ElevatedShortInterestRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.ShortPercentFloat <= 0 {
		return nil
	}
	// Bearish if short interest 10-20% of float
	if ctx.ShortInterest.ShortPercentFloat >= ElevatedShortInterestThreshold && ctx.ShortInterest.ShortPercentFloat < VeryHighShortInterestThreshold {
		return &Signal{
			Type:     SignalBearish,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("Elevated short interest at %.1f%% of float", ctx.ShortInterest.ShortPercentFloat),
			Priority: 3,
			Data:     map[string]interface{}{"shortPercent": ctx.ShortInterest.ShortPercentFloat},
		}
	}
	return nil
}

// VeryHighShortInterestRule generates a warning for very high short interest.
type VeryHighShortInterestRule struct{}

func (r *VeryHighShortInterestRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.ShortPercentFloat <= 0 {
		return nil
	}
	// Warning if short interest > 20% of float (potential squeeze)
	if ctx.ShortInterest.ShortPercentFloat >= VeryHighShortInterestThreshold {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("Very high short interest at %.1f%% - potential squeeze", ctx.ShortInterest.ShortPercentFloat),
			Priority: 4,
			Data:     map[string]interface{}{"shortPercent": ctx.ShortInterest.ShortPercentFloat},
		}
	}
	return nil
}

// LowDaysToCoverRule generates a bullish signal for low days to cover.
type LowDaysToCoverRule struct{}

func (r *LowDaysToCoverRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.DaysToCover <= 0 {
		return nil
	}
	// Bullish if days to cover < 2 (minimal short pressure)
	if ctx.ShortInterest.DaysToCover < LowDaysToCoverThreshold {
		return &Signal{
			Type:     SignalBullish,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("Low days to cover (%.1f) - minimal short pressure", ctx.ShortInterest.DaysToCover),
			Priority: 2,
			Data:     map[string]interface{}{"daysToCover": ctx.ShortInterest.DaysToCover},
		}
	}
	return nil
}

// ModerateDaysToCoverRule generates a bearish signal for moderate days to cover.
type ModerateDaysToCoverRule struct{}

func (r *ModerateDaysToCoverRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.DaysToCover <= 0 {
		return nil
	}
	// Bearish if days to cover 5-10 (building pressure)
	if ctx.ShortInterest.DaysToCover >= ModerateDaysToCoverThreshold && ctx.ShortInterest.DaysToCover < HighDaysToCoverThreshold {
		return &Signal{
			Type:     SignalBearish,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("Days to cover at %.1f suggests building pressure", ctx.ShortInterest.DaysToCover),
			Priority: 3,
			Data:     map[string]interface{}{"daysToCover": ctx.ShortInterest.DaysToCover},
		}
	}
	return nil
}

// HighDaysToCoverRule generates a warning for high days to cover.
type HighDaysToCoverRule struct{}

func (r *HighDaysToCoverRule) Evaluate(ctx *RuleContext) *Signal {
	if ctx.ShortInterest == nil || ctx.ShortInterest.DaysToCover <= 0 {
		return nil
	}
	// Warning if days to cover > 10 (potential squeeze setup)
	if ctx.ShortInterest.DaysToCover >= HighDaysToCoverThreshold {
		return &Signal{
			Type:     SignalWarning,
			Category: CategoryTechnical,
			Message:  fmt.Sprintf("High days to cover (%.1f) - potential squeeze setup", ctx.ShortInterest.DaysToCover),
			Priority: 4,
			Data:     map[string]interface{}{"daysToCover": ctx.ShortInterest.DaysToCover},
		}
	}
	return nil
}
