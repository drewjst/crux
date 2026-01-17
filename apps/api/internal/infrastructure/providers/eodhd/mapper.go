package eodhd

import (
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/drewjst/recon/apps/api/internal/domain/models"
)

// mapCompany converts EODHD General to internal Company model.
func mapCompany(e *FundamentalsResponse) *models.Company {
	ceo := ""
	if len(e.General.Officers) > 0 {
		for _, officer := range e.General.Officers {
			title := strings.ToLower(officer.Title)
			if strings.Contains(title, "ceo") || strings.Contains(title, "chief executive") {
				ceo = officer.Name
				break
			}
		}
		// Fallback to first officer if no CEO found
		if ceo == "" {
			ceo = e.General.Officers[0].Name
		}
	}

	return &models.Company{
		Ticker:      e.General.Code,
		Name:        e.General.Name,
		Exchange:    e.General.Exchange,
		Sector:      e.General.Sector,
		Industry:    e.General.Industry,
		Description: e.General.Description,
		Website:     e.General.WebURL,
		CEO:         ceo,
		Employees:   e.General.FullTimeEmployees,
		Country:     e.General.CountryName,
	}
}

// mapRatios converts EODHD Highlights and Valuation to internal Ratios model.
func mapRatios(e *FundamentalsResponse) *models.Ratios {
	return &models.Ratios{
		Ticker: e.General.Code,
		AsOf:   time.Now(),

		// Valuation
		PE:         e.Valuation.TrailingPE,
		ForwardPE:  e.Valuation.ForwardPE,
		PEG:        e.Highlights.PEGRatio,
		PB:         e.Valuation.PriceBookMRQ,
		PS:         e.Valuation.PriceSalesTTM,
		EVToEBITDA: e.Valuation.EnterpriseValueEbitda,

		// Profitability - EODHD returns these as decimals, convert to percentages
		GrossMargin:     calculateGrossMargin(e),
		OperatingMargin: e.Highlights.OperatingMarginTTM * 100,
		NetMargin:       e.Highlights.ProfitMargin * 100,
		ROE:             e.Highlights.ReturnOnEquityTTM * 100,
		ROA:             e.Highlights.ReturnOnAssetsTTM * 100,

		// Note: EODHD doesn't provide these in Highlights, would need to calculate
		// from financial statements if needed
		// PriceToFCF: calculated separately if needed
		// FCFMargin: calculated separately if needed
		// ROIC: calculated separately if needed
		// AssetTurnover: calculated separately if needed
		// InventoryTurnover: calculated separately if needed
		// DebtToEquity: calculated separately if needed
		// CurrentRatio: calculated separately if needed
		// QuickRatio: calculated separately if needed
		// InterestCoverage: calculated separately if needed
	}
}

// calculateGrossMargin calculates gross margin from revenue and gross profit.
func calculateGrossMargin(e *FundamentalsResponse) float64 {
	if e.Highlights.RevenueTTM == 0 {
		return 0
	}
	return (e.Highlights.GrossProfitTTM / e.Highlights.RevenueTTM) * 100
}

// mapFinancials converts EODHD financial statements to internal Financials model.
// It returns financials sorted by date (most recent first).
func mapFinancials(e *FundamentalsResponse, periods int) []models.Financials {
	// Get yearly statements, sorted by date descending
	incomeStatements := getSortedPeriods(e.Financials.IncomeStatement.Yearly)
	balanceSheets := getSortedPeriods(e.Financials.BalanceSheet.Yearly)
	cashFlows := getSortedPeriods(e.Financials.CashFlow.Yearly)

	// Build a map of periods by date for matching
	incomeByDate := make(map[string]FinancialPeriod)
	for _, date := range incomeStatements {
		incomeByDate[date] = e.Financials.IncomeStatement.Yearly[date]
	}

	balanceByDate := make(map[string]FinancialPeriod)
	for _, date := range balanceSheets {
		balanceByDate[date] = e.Financials.BalanceSheet.Yearly[date]
	}

	cashFlowByDate := make(map[string]FinancialPeriod)
	for _, date := range cashFlows {
		cashFlowByDate[date] = e.Financials.CashFlow.Yearly[date]
	}

	// Use income statement dates as the primary list
	result := make([]models.Financials, 0, periods)
	count := 0

	for _, date := range incomeStatements {
		if count >= periods {
			break
		}

		income := incomeByDate[date]
		balance, hasBalance := balanceByDate[date]
		cashFlow, hasCashFlow := cashFlowByDate[date]

		financials := models.Financials{
			Ticker:       e.General.Code,
			FiscalYear:   parseYearFromDate(date),
			FiscalPeriod: "FY",
			ReportDate:   parseDate(date),

			// Income Statement
			Revenue:         int64(income.TotalRevenue),
			GrossProfit:     int64(income.GrossProfit),
			OperatingIncome: int64(income.OperatingIncome),
			NetIncome:       int64(income.NetIncome),
			EPS:             0, // Would need to calculate from shares outstanding
		}

		if hasBalance {
			financials.TotalAssets = int64(balance.TotalAssets)
			financials.TotalLiabilities = int64(balance.TotalLiabilities)
			financials.TotalEquity = int64(balance.TotalStockholderEquity)
			financials.Cash = int64(balance.CashAndShortTermInv)
			if financials.Cash == 0 {
				financials.Cash = int64(balance.Cash)
			}
			financials.Debt = int64(balance.TotalDebt)
			if financials.Debt == 0 {
				financials.Debt = int64(balance.ShortTermDebt + balance.LongTermDebt)
			}
		}

		if hasCashFlow {
			financials.OperatingCashFlow = int64(cashFlow.OperatingCashFlow)
			financials.CapEx = int64(cashFlow.CapitalExpenditures)
			financials.FreeCashFlow = int64(cashFlow.FreeCashFlow)
			if financials.FreeCashFlow == 0 && financials.OperatingCashFlow != 0 {
				financials.FreeCashFlow = financials.OperatingCashFlow - abs(financials.CapEx)
			}
		}

		result = append(result, financials)
		count++
	}

	return result
}

// getSortedPeriods returns period dates sorted descending (most recent first).
func getSortedPeriods(periods map[string]FinancialPeriod) []string {
	dates := make([]string, 0, len(periods))
	for date := range periods {
		dates = append(dates, date)
	}
	sort.Sort(sort.Reverse(sort.StringSlice(dates)))
	return dates
}

// mapInstitutionalHolders converts EODHD Holders to internal InstitutionalHolder models.
func mapInstitutionalHolders(e *FundamentalsResponse) []models.InstitutionalHolder {
	result := make([]models.InstitutionalHolder, 0, len(e.Holders.Institutions))

	for _, h := range e.Holders.Institutions {
		result = append(result, models.InstitutionalHolder{
			Name:          h.Name,
			Shares:        int64(h.CurrentShares),
			Value:         0, // EODHD doesn't provide value in this format
			PercentOwned:  0, // Would need to calculate from total shares outstanding
			ChangeShares:  int64(h.Change),
			ChangePercent: h.ChangePercent,
			DateReported:  parseDate(h.Date),
		})
	}

	return result
}

// mapInsiderTrades converts EODHD InsiderTransactions to internal InsiderTrade models.
func mapInsiderTrades(trades []InsiderTransaction, days int) []models.InsiderTrade {
	cutoff := time.Now().AddDate(0, 0, -days)
	result := make([]models.InsiderTrade, 0)

	for _, t := range trades {
		tradeDate := parseDate(t.TransactionDate)
		if tradeDate.Before(cutoff) {
			continue
		}

		// Skip zero-amount transactions
		if t.TransactionAmount == 0 {
			continue
		}

		tradeType := mapTransactionCode(t.TransactionCode, t.TransactionAcquiredDisposed)
		value := int64(t.TransactionAmount * t.TransactionPrice)

		result = append(result, models.InsiderTrade{
			Name:        t.OwnerName,
			Title:       "", // Would need owner title from different endpoint
			TradeType:   tradeType,
			Shares:      int64(t.TransactionAmount),
			Price:       t.TransactionPrice,
			Value:       value,
			SharesOwned: int64(t.PostTransactionAmount),
			TradeDate:   tradeDate,
			FilingDate:  parseDate(t.Date),
		})
	}

	return result
}

// mapInsiderTradesFromResponse converts InsiderTransactionResponse to internal InsiderTrade models.
func mapInsiderTradesFromResponse(trades []InsiderTransactionResponse, days int) []models.InsiderTrade {
	cutoff := time.Now().AddDate(0, 0, -days)
	result := make([]models.InsiderTrade, 0)

	for _, t := range trades {
		tradeDate := parseDate(t.TransactionDate)
		if tradeDate.Before(cutoff) {
			continue
		}

		if t.TransactionAmount == 0 {
			continue
		}

		tradeType := mapTransactionCode(t.TransactionCode, t.TransactionAcquiredDisposed)
		value := int64(t.TransactionAmount * t.TransactionPrice)

		result = append(result, models.InsiderTrade{
			Name:        t.OwnerName,
			Title:       t.OwnerTitle,
			TradeType:   tradeType,
			Shares:      int64(t.TransactionAmount),
			Price:       t.TransactionPrice,
			Value:       value,
			SharesOwned: int64(t.PostTransactionAmount),
			TradeDate:   tradeDate,
			FilingDate:  parseDate(t.Date),
		})
	}

	return result
}

// mapTransactionCode converts EODHD transaction codes to buy/sell.
func mapTransactionCode(code string, acquiredDisposed string) string {
	// EODHD uses SEC transaction codes:
	// P = Open market purchase
	// S = Open market sale
	// A = Grant/Award
	// D = Disposition to issuer
	// M = Exercise of derivative
	// etc.

	// First check the acquired/disposed field
	switch strings.ToUpper(acquiredDisposed) {
	case "A":
		return "buy"
	case "D":
		return "sell"
	}

	// Fallback to transaction code
	switch strings.ToUpper(code) {
	case "P":
		return "buy"
	case "S":
		return "sell"
	case "A", "M": // Grants and exercises are acquisitions
		return "buy"
	case "D", "F": // Dispositions and tax payments
		return "sell"
	default:
		return "other"
	}
}

// mapQuote converts EODHD QuoteResponse to internal Quote model.
func mapQuote(q *QuoteResponse, ticker string, marketCap int64) *models.Quote {
	return &models.Quote{
		Ticker:        ticker,
		Price:         q.Close,
		Change:        q.Change,
		ChangePercent: q.ChangePercent,
		Open:          q.Open,
		High:          q.High,
		Low:           q.Low,
		PrevClose:     q.PreviousClose,
		Volume:        q.Volume,
		MarketCap:     marketCap,
		AsOf:          time.Unix(q.Timestamp, 0),
	}
}

// mapHistoricalPrices converts EODHD historical prices to internal PriceBar models.
func mapHistoricalPrices(prices []HistoricalPrice) []models.PriceBar {
	result := make([]models.PriceBar, 0, len(prices))
	for _, p := range prices {
		result = append(result, models.PriceBar{
			Date:   parseDate(p.Date),
			Open:   p.Open,
			High:   p.High,
			Low:    p.Low,
			Close:  p.AdjustedClose,
			Volume: p.Volume,
		})
	}
	return result
}

// mapSearchResults converts EODHD search results to internal SearchResult models.
func mapSearchResults(results []SearchResult) []models.SearchResult {
	mapped := make([]models.SearchResult, 0, len(results))
	for _, r := range results {
		mapped = append(mapped, models.SearchResult{
			Ticker:   r.Code,
			Name:     r.Name,
			Exchange: r.Exchange,
			Type:     strings.ToLower(r.Type),
		})
	}
	return mapped
}

// parseDate parses a date string like "2024-09-30" to time.Time.
func parseDate(date string) time.Time {
	t, _ := time.Parse("2006-01-02", date)
	return t
}

// parseYearFromDate extracts the year from a date string like "2024-09-30".
func parseYearFromDate(date string) int {
	parts := strings.Split(date, "-")
	if len(parts) < 1 {
		return 0
	}
	year, _ := strconv.Atoi(parts[0])
	return year
}

// abs returns the absolute value of an int64.
func abs(n int64) int64 {
	if n < 0 {
		return -n
	}
	return n
}
