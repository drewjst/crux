package models

// OwnerEarnings represents owner earnings data (Buffett-style earnings).
// Owner earnings = net income + D&A - maintenance capex
type OwnerEarnings struct {
	Ticker                string
	OwnerEarnings         float64
	OwnerEarningsPerShare float64
	GrowthCapex           float64 // Growth capex (not subtracted from owner earnings)
	MaintenanceCapex      float64 // Maintenance capex (subtracted from owner earnings)
}
