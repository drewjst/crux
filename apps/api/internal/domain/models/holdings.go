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

// CongressTrade represents a trade by a member of Congress (Senate or House).
type CongressTrade struct {
	Chamber          string    // "senate" or "house"
	PoliticianName   string    // Full name
	State            string    // State code (e.g., "TX") or district (e.g., "CA17")
	Party            string    // Political party if available
	Owner            string    // "Self", "Spouse", "Joint", "Child"
	TradeType        string    // "buy" or "sell"
	Amount           string    // Value range (e.g., "$100,001 - $250,000")
	AssetDescription string    // Asset name/description
	TransactionDate  time.Time
	DisclosureDate   time.Time
	Link             string // URL to official filing
}
