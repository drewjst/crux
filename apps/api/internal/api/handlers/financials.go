package handlers

import (
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/drewjst/crux/apps/api/internal/api/middleware"
	"github.com/drewjst/crux/apps/api/internal/domain/repository"
)

const (
	defaultPeriodLimit = 5
	maxPeriodLimit     = 20
)

// FinancialsHandler handles financial statement HTTP requests.
type FinancialsHandler struct {
	repo repository.FinancialsRepository
}

// NewFinancialsHandler creates a new financials handler.
func NewFinancialsHandler(repo repository.FinancialsRepository) *FinancialsHandler {
	return &FinancialsHandler{repo: repo}
}

// =============================================================================
// Response Types
// =============================================================================

// IncomeStatementResponse is the API response for income statements.
type IncomeStatementResponse struct {
	Ticker     string                  `json:"ticker"`
	Currency   string                  `json:"currency"`
	PeriodType string                  `json:"periodType"`
	Periods    []IncomeStatementPeriod `json:"periods"`
}

// IncomeStatementPeriod represents a single income statement period.
type IncomeStatementPeriod struct {
	PeriodEnd     string `json:"periodEnd"`
	FiscalYear    int    `json:"fiscalYear"`
	FiscalQuarter *int   `json:"fiscalQuarter"`
	FilingDate    string `json:"filingDate,omitempty"`

	// Revenue
	Revenue          int64   `json:"revenue"`
	RevenueFormatted string  `json:"revenueFormatted"`
	CostOfRevenue    int64   `json:"costOfRevenue"`
	GrossProfit      int64   `json:"grossProfit"`
	GrossMargin      float64 `json:"grossMargin"`

	// Operating
	OperatingExpenses int64   `json:"operatingExpenses"`
	OperatingIncome   int64   `json:"operatingIncome"`
	OperatingMargin   float64 `json:"operatingMargin"`

	// Net Income
	NetIncome          int64   `json:"netIncome"`
	NetIncomeFormatted string  `json:"netIncomeFormatted"`
	NetMargin          float64 `json:"netMargin"`

	// Per Share
	EPSDiluted float64 `json:"epsDiluted"`

	// Other
	EBITDA       int64   `json:"ebitda"`
	EBITDAMargin float64 `json:"ebitdaMargin"`

	// YoY Growth (computed)
	RevenueGrowth   *float64 `json:"revenueGrowth,omitempty"`
	NetIncomeGrowth *float64 `json:"netIncomeGrowth,omitempty"`
	EPSGrowth       *float64 `json:"epsGrowth,omitempty"`
}

// BalanceSheetResponse is the API response for balance sheets.
type BalanceSheetResponse struct {
	Ticker     string               `json:"ticker"`
	Currency   string               `json:"currency"`
	PeriodType string               `json:"periodType"`
	Periods    []BalanceSheetPeriod `json:"periods"`
}

// BalanceSheetPeriod represents a single balance sheet period.
type BalanceSheetPeriod struct {
	PeriodEnd     string `json:"periodEnd"`
	FiscalYear    int    `json:"fiscalYear"`
	FiscalQuarter *int   `json:"fiscalQuarter"`
	FilingDate    string `json:"filingDate,omitempty"`

	// Assets
	TotalAssets           int64  `json:"totalAssets"`
	TotalAssetsFormatted  string `json:"totalAssetsFormatted"`
	CashAndEquivalents    int64  `json:"cashAndEquivalents"`
	TotalCurrentAssets    int64  `json:"totalCurrentAssets"`
	TotalNonCurrentAssets int64  `json:"totalNonCurrentAssets"`

	// Liabilities
	TotalLiabilities        int64  `json:"totalLiabilities"`
	TotalLiabFormatted      string `json:"totalLiabilitiesFormatted"`
	TotalCurrentLiabilities int64  `json:"totalCurrentLiabilities"`
	TotalNonCurrentLiab     int64  `json:"totalNonCurrentLiabilities"`

	// Debt
	TotalDebt int64  `json:"totalDebt"`
	NetDebt   int64  `json:"netDebt"`

	// Equity
	TotalEquity          int64  `json:"totalEquity"`
	TotalEquityFormatted string `json:"totalEquityFormatted"`

	// Ratios
	CurrentRatio  float64 `json:"currentRatio"`
	DebtToEquity  float64 `json:"debtToEquity"`
	DebtToAssets  float64 `json:"debtToAssets"`

	// YoY Growth
	TotalAssetsGrowth *float64 `json:"totalAssetsGrowth,omitempty"`
	TotalEquityGrowth *float64 `json:"totalEquityGrowth,omitempty"`
}

// CashFlowResponse is the API response for cash flow statements.
type CashFlowResponse struct {
	Ticker     string           `json:"ticker"`
	Currency   string           `json:"currency"`
	PeriodType string           `json:"periodType"`
	Periods    []CashFlowPeriod `json:"periods"`
}

// CashFlowPeriod represents a single cash flow statement period.
type CashFlowPeriod struct {
	PeriodEnd     string `json:"periodEnd"`
	FiscalYear    int    `json:"fiscalYear"`
	FiscalQuarter *int   `json:"fiscalQuarter"`
	FilingDate    string `json:"filingDate,omitempty"`

	// Operating Activities
	OperatingCashFlow          int64  `json:"operatingCashFlow"`
	OperatingCashFlowFormatted string `json:"operatingCashFlowFormatted"`

	// Investing Activities
	CapitalExpenditures int64 `json:"capitalExpenditures"`
	InvestingCashFlow   int64 `json:"investingCashFlow"`

	// Financing Activities
	DividendsPaid          int64 `json:"dividendsPaid"`
	CommonStockRepurchased int64 `json:"stockBuybacks"`
	FinancingCashFlow      int64 `json:"financingCashFlow"`

	// Free Cash Flow
	FreeCashFlow          int64  `json:"freeCashFlow"`
	FreeCashFlowFormatted string `json:"freeCashFlowFormatted"`

	// YoY Growth
	OperatingCFGrowth *float64 `json:"operatingCashFlowGrowth,omitempty"`
	FreeCashFlowGrowth *float64 `json:"freeCashFlowGrowth,omitempty"`
}

// SegmentsResponse is the API response for revenue segments.
type SegmentsResponse struct {
	Ticker     string          `json:"ticker"`
	Currency   string          `json:"currency"`
	PeriodType string          `json:"periodType"`
	Periods    []SegmentPeriod `json:"periods"`
}

// SegmentPeriod represents segments for a single period.
type SegmentPeriod struct {
	PeriodEnd string           `json:"periodEnd"`
	Segments  []RevenueSegment `json:"segments"`
}

// RevenueSegment represents a single revenue segment.
type RevenueSegment struct {
	Type       string  `json:"type"` // "product" or "geography"
	Name       string  `json:"name"`
	Revenue    int64   `json:"revenue"`
	Percentage float64 `json:"percentage"`
}

// =============================================================================
// Handlers
// =============================================================================

// GetIncomeStatements handles GET /api/stock/{ticker}/financials/income
func (h *FinancialsHandler) GetIncomeStatements(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	ticker := strings.ToUpper(chi.URLParam(r, "ticker"))
	if !isValidTicker(ticker) {
		writeErrorWithDetails(w, http.StatusBadRequest, ErrCodeInvalidTicker,
			"Invalid ticker format", map[string]string{"ticker": ticker})
		return
	}

	periodType, limit := parseFinancialsParams(r)

	statements, err := h.repo.GetIncomeStatements(ctx, ticker, periodType, limit)
	if err != nil {
		slog.Error("failed to get income statements",
			"error", err, "ticker", ticker, "request_id", requestID)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
			"Failed to retrieve income statements")
		return
	}

	response := IncomeStatementResponse{
		Ticker:     ticker,
		Currency:   "USD",
		PeriodType: string(periodType),
		Periods:    make([]IncomeStatementPeriod, len(statements)),
	}

	for i, stmt := range statements {
		period := IncomeStatementPeriod{
			PeriodEnd:     stmt.PeriodEnd.Format("2006-01-02"),
			FiscalYear:    stmt.FiscalYear,
			FiscalQuarter: stmt.FiscalQuarter,

			Revenue:          stmt.Revenue,
			RevenueFormatted: formatLargeNumber(stmt.Revenue),
			CostOfRevenue:    stmt.CostOfRevenue,
			GrossProfit:      stmt.GrossProfit,
			GrossMargin:      safePercent(stmt.GrossProfit, stmt.Revenue),

			OperatingExpenses: stmt.OperatingExpenses,
			OperatingIncome:   stmt.OperatingIncome,
			OperatingMargin:   safePercent(stmt.OperatingIncome, stmt.Revenue),

			NetIncome:          stmt.NetIncome,
			NetIncomeFormatted: formatLargeNumber(stmt.NetIncome),
			NetMargin:          safePercent(stmt.NetIncome, stmt.Revenue),

			EPSDiluted: stmt.EPSDiluted,

			EBITDA:       stmt.EBITDA,
			EBITDAMargin: safePercent(stmt.EBITDA, stmt.Revenue),
		}

		if stmt.FilingDate != nil {
			period.FilingDate = stmt.FilingDate.Format("2006-01-02")
		}

		// Compute YoY growth by comparing to next period in slice (which is previous chronologically)
		if i < len(statements)-1 {
			prev := statements[i+1]
			period.RevenueGrowth = computeGrowth(stmt.Revenue, prev.Revenue)
			period.NetIncomeGrowth = computeGrowth(stmt.NetIncome, prev.NetIncome)
			period.EPSGrowth = computeGrowthFloat(stmt.EPSDiluted, prev.EPSDiluted)
		}

		response.Periods[i] = period
	}

	writeJSON(w, http.StatusOK, response)
}

// GetBalanceSheets handles GET /api/stock/{ticker}/financials/balance-sheet
func (h *FinancialsHandler) GetBalanceSheets(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	ticker := strings.ToUpper(chi.URLParam(r, "ticker"))
	if !isValidTicker(ticker) {
		writeErrorWithDetails(w, http.StatusBadRequest, ErrCodeInvalidTicker,
			"Invalid ticker format", map[string]string{"ticker": ticker})
		return
	}

	periodType, limit := parseFinancialsParams(r)

	sheets, err := h.repo.GetBalanceSheets(ctx, ticker, periodType, limit)
	if err != nil {
		slog.Error("failed to get balance sheets",
			"error", err, "ticker", ticker, "request_id", requestID)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
			"Failed to retrieve balance sheets")
		return
	}

	response := BalanceSheetResponse{
		Ticker:     ticker,
		Currency:   "USD",
		PeriodType: string(periodType),
		Periods:    make([]BalanceSheetPeriod, len(sheets)),
	}

	for i, sheet := range sheets {
		period := BalanceSheetPeriod{
			PeriodEnd:     sheet.PeriodEnd.Format("2006-01-02"),
			FiscalYear:    sheet.FiscalYear,
			FiscalQuarter: sheet.FiscalQuarter,

			TotalAssets:           sheet.TotalAssets,
			TotalAssetsFormatted:  formatLargeNumber(sheet.TotalAssets),
			CashAndEquivalents:    sheet.CashAndEquivalents,
			TotalCurrentAssets:    sheet.TotalCurrentAssets,
			TotalNonCurrentAssets: sheet.TotalNonCurrentAssets,

			TotalLiabilities:        sheet.TotalLiabilities,
			TotalLiabFormatted:      formatLargeNumber(sheet.TotalLiabilities),
			TotalCurrentLiabilities: sheet.TotalCurrentLiabilities,
			TotalNonCurrentLiab:     sheet.TotalNonCurrentLiab,

			TotalDebt: sheet.TotalDebt,
			NetDebt:   sheet.NetDebt,

			TotalEquity:          sheet.TotalEquity,
			TotalEquityFormatted: formatLargeNumber(sheet.TotalEquity),

			CurrentRatio: safeRatio(float64(sheet.TotalCurrentAssets), float64(sheet.TotalCurrentLiabilities)),
			DebtToEquity: safeRatio(float64(sheet.TotalDebt), float64(sheet.TotalEquity)),
			DebtToAssets: safeRatio(float64(sheet.TotalDebt), float64(sheet.TotalAssets)),
		}

		if sheet.FilingDate != nil {
			period.FilingDate = sheet.FilingDate.Format("2006-01-02")
		}

		// Compute YoY growth
		if i < len(sheets)-1 {
			prev := sheets[i+1]
			period.TotalAssetsGrowth = computeGrowth(sheet.TotalAssets, prev.TotalAssets)
			period.TotalEquityGrowth = computeGrowth(sheet.TotalEquity, prev.TotalEquity)
		}

		response.Periods[i] = period
	}

	writeJSON(w, http.StatusOK, response)
}

// GetCashFlowStatements handles GET /api/stock/{ticker}/financials/cash-flow
func (h *FinancialsHandler) GetCashFlowStatements(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	ticker := strings.ToUpper(chi.URLParam(r, "ticker"))
	if !isValidTicker(ticker) {
		writeErrorWithDetails(w, http.StatusBadRequest, ErrCodeInvalidTicker,
			"Invalid ticker format", map[string]string{"ticker": ticker})
		return
	}

	periodType, limit := parseFinancialsParams(r)

	statements, err := h.repo.GetCashFlowStatements(ctx, ticker, periodType, limit)
	if err != nil {
		slog.Error("failed to get cash flow statements",
			"error", err, "ticker", ticker, "request_id", requestID)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
			"Failed to retrieve cash flow statements")
		return
	}

	response := CashFlowResponse{
		Ticker:     ticker,
		Currency:   "USD",
		PeriodType: string(periodType),
		Periods:    make([]CashFlowPeriod, len(statements)),
	}

	for i, stmt := range statements {
		period := CashFlowPeriod{
			PeriodEnd:     stmt.PeriodEnd.Format("2006-01-02"),
			FiscalYear:    stmt.FiscalYear,
			FiscalQuarter: stmt.FiscalQuarter,

			OperatingCashFlow:          stmt.OperatingCashFlow,
			OperatingCashFlowFormatted: formatLargeNumber(stmt.OperatingCashFlow),

			CapitalExpenditures: stmt.CapitalExpenditures,
			InvestingCashFlow:   stmt.InvestingCashFlow,

			DividendsPaid:          stmt.DividendsPaid,
			CommonStockRepurchased: stmt.CommonStockRepurchased,
			FinancingCashFlow:      stmt.FinancingCashFlow,

			FreeCashFlow:          stmt.FreeCashFlow,
			FreeCashFlowFormatted: formatLargeNumber(stmt.FreeCashFlow),
		}

		if stmt.FilingDate != nil {
			period.FilingDate = stmt.FilingDate.Format("2006-01-02")
		}

		// Compute YoY growth
		if i < len(statements)-1 {
			prev := statements[i+1]
			period.OperatingCFGrowth = computeGrowth(stmt.OperatingCashFlow, prev.OperatingCashFlow)
			period.FreeCashFlowGrowth = computeGrowth(stmt.FreeCashFlow, prev.FreeCashFlow)
		}

		response.Periods[i] = period
	}

	writeJSON(w, http.StatusOK, response)
}

// GetRevenueSegments handles GET /api/stock/{ticker}/financials/segments
func (h *FinancialsHandler) GetRevenueSegments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	ticker := strings.ToUpper(chi.URLParam(r, "ticker"))
	if !isValidTicker(ticker) {
		writeErrorWithDetails(w, http.StatusBadRequest, ErrCodeInvalidTicker,
			"Invalid ticker format", map[string]string{"ticker": ticker})
		return
	}

	periodType, limit := parseFinancialsParams(r)

	segments, err := h.repo.GetRevenueSegments(ctx, ticker, periodType, limit)
	if err != nil {
		slog.Error("failed to get revenue segments",
			"error", err, "ticker", ticker, "request_id", requestID)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError,
			"Failed to retrieve revenue segments")
		return
	}

	// Group segments by period
	periodMap := make(map[string][]RevenueSegment)
	for _, seg := range segments {
		key := seg.PeriodEnd.Format("2006-01-02")
		periodMap[key] = append(periodMap[key], RevenueSegment{
			Type:       seg.SegmentType,
			Name:       seg.SegmentName,
			Revenue:    seg.Revenue,
			Percentage: seg.Percentage,
		})
	}

	// Convert to response format
	var periods []SegmentPeriod
	for periodEnd, segs := range periodMap {
		periods = append(periods, SegmentPeriod{
			PeriodEnd: periodEnd,
			Segments:  segs,
		})
	}

	response := SegmentsResponse{
		Ticker:     ticker,
		Currency:   "USD",
		PeriodType: string(periodType),
		Periods:    periods,
	}

	writeJSON(w, http.StatusOK, response)
}

// =============================================================================
// Helper Functions
// =============================================================================

// parseFinancialsParams extracts period type and limit from query params.
func parseFinancialsParams(r *http.Request) (repository.PeriodType, int) {
	periodStr := r.URL.Query().Get("period")
	var periodType repository.PeriodType
	switch periodStr {
	case "quarterly":
		periodType = repository.PeriodTypeQuarterly
	case "ttm":
		periodType = repository.PeriodTypeTTM
	default:
		periodType = repository.PeriodTypeAnnual
	}

	limit := defaultPeriodLimit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
			if limit > maxPeriodLimit {
				limit = maxPeriodLimit
			}
		}
	}

	return periodType, limit
}

// formatLargeNumber formats a number as $X.XB, $X.XM, or $X.XK.
func formatLargeNumber(n int64) string {
	abs := n
	prefix := ""
	if n < 0 {
		abs = -n
		prefix = "-"
	}

	switch {
	case abs >= 1_000_000_000_000:
		return fmt.Sprintf("%s$%.1fT", prefix, float64(abs)/1_000_000_000_000)
	case abs >= 1_000_000_000:
		return fmt.Sprintf("%s$%.1fB", prefix, float64(abs)/1_000_000_000)
	case abs >= 1_000_000:
		return fmt.Sprintf("%s$%.1fM", prefix, float64(abs)/1_000_000)
	case abs >= 1_000:
		return fmt.Sprintf("%s$%.1fK", prefix, float64(abs)/1_000)
	default:
		return fmt.Sprintf("%s$%d", prefix, abs)
	}
}

// safePercent calculates (numerator/denominator)*100, returning 0 if denominator is 0.
func safePercent(numerator, denominator int64) float64 {
	if denominator == 0 {
		return 0
	}
	return round2(float64(numerator) / float64(denominator) * 100)
}

// safeRatio calculates numerator/denominator, returning 0 if denominator is 0.
func safeRatio(numerator, denominator float64) float64 {
	if denominator == 0 {
		return 0
	}
	return round2(numerator / denominator)
}

// computeGrowth calculates YoY growth rate as a percentage.
func computeGrowth(current, previous int64) *float64 {
	if previous == 0 {
		return nil
	}
	growth := round2((float64(current) - float64(previous)) / float64(previous) * 100)
	return &growth
}

// computeGrowthFloat calculates YoY growth rate for float values.
func computeGrowthFloat(current, previous float64) *float64 {
	if previous == 0 {
		return nil
	}
	growth := round2((current - previous) / previous * 100)
	return &growth
}

// round2 rounds a float to 2 decimal places.
func round2(f float64) float64 {
	return math.Round(f*100) / 100
}

// Ensure time is imported (used for FilingDate formatting)
var _ = time.Now
