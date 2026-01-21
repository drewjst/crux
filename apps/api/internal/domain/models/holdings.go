package models

import "time"

// InstitutionalHolder represents an institutional investor's position.
type InstitutionalHolder struct {
	Name          string
	CIK           string
	Shares        int64
	Value         int64
	PercentOwned  float64
	ChangeShares  int64 // vs last quarter
	ChangePercent float64
	DateReported  time.Time
	IsNew         bool // New position this quarter
	IsSoldOut     bool // Position closed this quarter
}

// InstitutionalSummary contains aggregated institutional ownership data.
type InstitutionalSummary struct {
	OwnershipPercent       float64 // Total institutional ownership %
	OwnershipPercentChange float64 // QoQ change in ownership %
	InvestorsHolding       int     // Current number of institutional holders
	InvestorsIncreased     int     // Holders that increased positions
	InvestorsDecreased     int     // Holders that decreased positions
	InvestorsHeld          int     // Holders with unchanged positions
	InvestorsNew           int     // New positions this quarter
	InvestorsSoldOut       int     // Positions closed this quarter
}

// InsiderTrade represents an insider buy or sell transaction.
type InsiderTrade struct {
	Name        string
	Title       string
	TradeType   string // "buy", "sell"
	Shares      int64
	Price       float64
	Value       int64
	SharesOwned int64
	TradeDate   time.Time
	FilingDate  time.Time
}
