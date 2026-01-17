package eodhd

import (
	"encoding/json"
	"strconv"
)

// FlexFloat is a float64 that can be unmarshaled from either a JSON number or string.
// EODHD API sometimes returns financial values as strings like "364980000000.00".
type FlexFloat float64

// UnmarshalJSON implements json.Unmarshaler for FlexFloat.
func (f *FlexFloat) UnmarshalJSON(data []byte) error {
	// Try to unmarshal as a number first
	var num float64
	if err := json.Unmarshal(data, &num); err == nil {
		*f = FlexFloat(num)
		return nil
	}

	// Try to unmarshal as a string
	var str string
	if err := json.Unmarshal(data, &str); err != nil {
		return err
	}

	// Empty string means 0
	if str == "" {
		*f = 0
		return nil
	}

	// Parse the string as a float
	num, err := strconv.ParseFloat(str, 64)
	if err != nil {
		return err
	}
	*f = FlexFloat(num)
	return nil
}

// FundamentalsResponse represents the full response from /api/fundamentals/{ticker}.{exchange}
type FundamentalsResponse struct {
	General             General                       `json:"General"`
	Highlights          Highlights                    `json:"Highlights"`
	Valuation           Valuation                     `json:"Valuation"`
	SharesStats         SharesStats                   `json:"SharesStats"`
	Technicals          Technicals                    `json:"Technicals"`
	Holders             Holders                       `json:"Holders"`
	InsiderTransactions map[string]InsiderTransaction `json:"InsiderTransactions"`
	Financials          Financials                    `json:"Financials"`
	ETFData             *ETFData                      `json:"ETF_Data,omitempty"`
}

// General contains company profile information.
type General struct {
	Code              string             `json:"Code"`
	Type              string             `json:"Type"`
	Name              string             `json:"Name"`
	Exchange          string             `json:"Exchange"`
	CurrencyCode      string             `json:"CurrencyCode"`
	CurrencyName      string             `json:"CurrencyName"`
	CountryName       string             `json:"CountryName"`
	CountryISO        string             `json:"CountryISO"`
	ISIN              string             `json:"ISIN"`
	CIK               string             `json:"CIK"`
	Sector            string             `json:"Sector"`
	Industry          string             `json:"Industry"`
	GicSector         string             `json:"GicSector"`
	GicGroup          string             `json:"GicGroup"`
	GicIndustry       string             `json:"GicIndustry"`
	GicSubIndustry    string             `json:"GicSubIndustry"`
	Description       string             `json:"Description"`
	Address           string             `json:"Address"`
	Phone             string             `json:"Phone"`
	WebURL            string             `json:"WebURL"`
	LogoURL           string             `json:"LogoURL"`
	FullTimeEmployees int                `json:"FullTimeEmployees"`
	UpdatedAt         string             `json:"UpdatedAt"`
	IPODate           string             `json:"IPODate"`
	Officers          map[string]Officer `json:"Officers"`
}

// Officer represents a company executive.
type Officer struct {
	Name     string `json:"Name"`
	Title    string `json:"Title"`
	YearBorn string `json:"YearBorn"`
}

// Highlights contains key financial metrics and highlights.
type Highlights struct {
	MarketCapitalization       float64 `json:"MarketCapitalization"`
	MarketCapitalizationMln    float64 `json:"MarketCapitalizationMln"`
	EBITDA                     float64 `json:"EBITDA"`
	PERatio                    float64 `json:"PERatio"`
	PEGRatio                   float64 `json:"PEGRatio"`
	WallStreetTargetPrice      float64 `json:"WallStreetTargetPrice"`
	BookValue                  float64 `json:"BookValue"`
	DividendShare              float64 `json:"DividendShare"`
	DividendYield              float64 `json:"DividendYield"`
	EarningsShare              float64 `json:"EarningsShare"`
	EPSEstimateCurrentYear     float64 `json:"EPSEstimateCurrentYear"`
	EPSEstimateNextYear        float64 `json:"EPSEstimateNextYear"`
	EPSEstimateNextQuarter     float64 `json:"EPSEstimateNextQuarter"`
	EPSEstimateCurrentQuarter  float64 `json:"EPSEstimateCurrentQuarter"`
	MostRecentQuarter          string  `json:"MostRecentQuarter"`
	ProfitMargin               float64 `json:"ProfitMargin"`
	OperatingMarginTTM         float64 `json:"OperatingMarginTTM"`
	ReturnOnAssetsTTM          float64 `json:"ReturnOnAssetsTTM"`
	ReturnOnEquityTTM          float64 `json:"ReturnOnEquityTTM"`
	RevenueTTM                 float64 `json:"RevenueTTM"`
	RevenuePerShareTTM         float64 `json:"RevenuePerShareTTM"`
	QuarterlyRevenueGrowthYOY  float64 `json:"QuarterlyRevenueGrowthYOY"`
	GrossProfitTTM             float64 `json:"GrossProfitTTM"`
	DilutedEpsTTM              float64 `json:"DilutedEpsTTM"`
	QuarterlyEarningsGrowthYOY float64 `json:"QuarterlyEarningsGrowthYOY"`
}

// Valuation contains valuation ratios and multiples.
type Valuation struct {
	TrailingPE             float64 `json:"TrailingPE"`
	ForwardPE              float64 `json:"ForwardPE"`
	PriceSalesTTM          float64 `json:"PriceSalesTTM"`
	PriceBookMRQ           float64 `json:"PriceBookMRQ"`
	EnterpriseValue        float64 `json:"EnterpriseValue"`
	EnterpriseValueRevenue float64 `json:"EnterpriseValueRevenue"`
	EnterpriseValueEbitda  float64 `json:"EnterpriseValueEbitda"`
}

// SharesStats contains ownership statistics.
type SharesStats struct {
	SharesOutstanding       float64 `json:"SharesOutstanding"`
	SharesFloat             float64 `json:"SharesFloat"`
	PercentInsiders         float64 `json:"PercentInsiders"`
	PercentInstitutions     float64 `json:"PercentInstitutions"`
	SharesShort             float64 `json:"SharesShort"`
	SharesShortPriorMonth   float64 `json:"SharesShortPriorMonth"`
	ShortRatio              float64 `json:"ShortRatio"`
	ShortPercentOutstanding float64 `json:"ShortPercentOutstanding"`
	ShortPercentFloat       float64 `json:"ShortPercentFloat"`
}

// Technicals contains technical analysis metrics.
type Technicals struct {
	Beta       float64 `json:"Beta"`
	High52Week float64 `json:"52WeekHigh"`
	Low52Week  float64 `json:"52WeekLow"`
	MA50Day    float64 `json:"50DayMA"`
	MA200Day   float64 `json:"200DayMA"`
}

// Holders contains institutional and fund holder information.
type Holders struct {
	Institutions map[string]InstitutionalHolder `json:"Institutions"`
	Funds        map[string]InstitutionalHolder `json:"Funds"`
}

// InstitutionalHolder represents a holder (institution or fund).
type InstitutionalHolder struct {
	Name          string  `json:"name"`
	Date          string  `json:"date"`
	TotalShares   float64 `json:"totalShares"`
	TotalAssets   float64 `json:"totalAssets"`
	CurrentShares float64 `json:"currentShares"`
	Change        float64 `json:"change"`
	ChangePercent float64 `json:"change_p"`
}

// InsiderTransaction represents an insider trading transaction.
type InsiderTransaction struct {
	Date                        string  `json:"date"`
	OwnerCIK                    string  `json:"ownerCik"`
	OwnerName                   string  `json:"ownerName"`
	TransactionDate             string  `json:"transactionDate"`
	TransactionCode             string  `json:"transactionCode"`
	TransactionAmount           float64 `json:"transactionAmount"`
	TransactionPrice            float64 `json:"transactionPrice"`
	TransactionAcquiredDisposed string  `json:"transactionAcquiredDisposed"`
	PostTransactionAmount       float64 `json:"postTransactionAmount"`
	SECLink                     string  `json:"secLink"`
}

// Financials contains financial statements data.
type Financials struct {
	BalanceSheet    FinancialStatementSet `json:"Balance_Sheet"`
	IncomeStatement FinancialStatementSet `json:"Income_Statement"`
	CashFlow        FinancialStatementSet `json:"Cash_Flow"`
}

// FinancialStatementSet contains quarterly and yearly financial data.
type FinancialStatementSet struct {
	CurrencySymbol string                     `json:"currency_symbol"`
	Quarterly      map[string]FinancialPeriod `json:"quarterly"`
	Yearly         map[string]FinancialPeriod `json:"yearly"`
}

// FinancialPeriod represents a single period's financial data.
// Fields vary by statement type (balance sheet, income, cash flow).
// Uses FlexFloat to handle EODHD returning values as strings or numbers.
type FinancialPeriod struct {
	Date           string `json:"date"`
	FilingDate     string `json:"filing_date"`
	CurrencySymbol string `json:"currency_symbol"`

	// Income Statement fields
	TotalRevenue          FlexFloat `json:"totalRevenue"`
	GrossProfit           FlexFloat `json:"grossProfit"`
	OperatingIncome       FlexFloat `json:"operatingIncome"`
	NetIncome             FlexFloat `json:"netIncome"`
	NetIncomeCommonShares FlexFloat `json:"netIncomeApplicableToCommonShares"`
	EBITDA                FlexFloat `json:"ebitda"`
	CostOfRevenue         FlexFloat `json:"costOfRevenue"`

	// Balance Sheet fields
	TotalAssets             FlexFloat `json:"totalAssets"`
	TotalCurrentAssets      FlexFloat `json:"totalCurrentAssets"`
	TotalLiabilities        FlexFloat `json:"totalLiab"`
	TotalCurrentLiabilities FlexFloat `json:"totalCurrentLiabilities"`
	TotalStockholderEquity  FlexFloat `json:"totalStockholderEquity"`
	Cash                    FlexFloat `json:"cash"`
	CashAndShortTermInv     FlexFloat `json:"cashAndShortTermInvestments"`
	ShortTermDebt           FlexFloat `json:"shortTermDebt"`
	LongTermDebt            FlexFloat `json:"longTermDebt"`
	TotalDebt               FlexFloat `json:"shortLongTermDebt"`
	Inventory               FlexFloat `json:"inventory"`

	// Cash Flow fields
	OperatingCashFlow    FlexFloat `json:"totalCashFromOperatingActivities"`
	CapitalExpenditures  FlexFloat `json:"capitalExpenditures"`
	FreeCashFlow         FlexFloat `json:"freeCashFlow"`
	CashFromInvestingAct FlexFloat `json:"totalCashflowsFromInvestingActivities"`
	CashFromFinancingAct FlexFloat `json:"totalCashFromFinancingActivities"`
	DividendsPaid        FlexFloat `json:"dividendsPaid"`
}

// QuoteResponse represents the response from real-time quote endpoint.
type QuoteResponse struct {
	Code          string  `json:"code"`
	Timestamp     int64   `json:"timestamp"`
	GMTOFFSET     int     `json:"gmtoffset"`
	Open          float64 `json:"open"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Close         float64 `json:"close"`
	Volume        int64   `json:"volume"`
	PreviousClose float64 `json:"previousClose"`
	Change        float64 `json:"change"`
	ChangePercent float64 `json:"change_p"`
}

// HistoricalPrice represents a single day's price data from EOD endpoint.
type HistoricalPrice struct {
	Date          string  `json:"date"`
	Open          float64 `json:"open"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Close         float64 `json:"close"`
	AdjustedClose float64 `json:"adjusted_close"`
	Volume        int64   `json:"volume"`
}

// SearchResult represents a ticker search result.
type SearchResult struct {
	Code     string `json:"Code"`
	Name     string `json:"Name"`
	Country  string `json:"Country"`
	Exchange string `json:"Exchange"`
	Currency string `json:"Currency"`
	Type     string `json:"Type"`
	ISIN     string `json:"ISIN"`
}

// InsiderTransactionResponse represents the response from insider-transactions endpoint.
type InsiderTransactionResponse struct {
	Code                        string  `json:"code"`
	Date                        string  `json:"date"`
	OwnerCIK                    string  `json:"ownerCik"`
	OwnerName                   string  `json:"ownerName"`
	OwnerTitle                  string  `json:"ownerTitle"`
	TransactionDate             string  `json:"transactionDate"`
	TransactionCode             string  `json:"transactionCode"`
	TransactionAmount           float64 `json:"transactionAmount"`
	TransactionPrice            float64 `json:"transactionPrice"`
	TransactionAcquiredDisposed string  `json:"transactionAcquiredDisposed"`
	PostTransactionAmount       float64 `json:"postTransactionAmount"`
	SECLink                     string  `json:"secLink"`
}

// =============================================================================
// ETF-Specific Types
// =============================================================================

// ETFData represents ETF-specific data from EODHD fundamentals endpoint.
// This data is only present when the ticker is an ETF.
// Note: Many fields use FlexFloat because EODHD sometimes returns them as strings.
type ETFData struct {
	ISIN                     string                         `json:"ISIN"`
	CompanyURL               string                         `json:"Company_URL"`
	NetExpenseRatio          FlexFloat                      `json:"Net_Expense_Ratio"`
	TotalAssets              FlexFloat                      `json:"Total_Assets"`
	Yield                    FlexFloat                      `json:"Yield"`
	InceptionDate            string                         `json:"Inception_Date"`
	Holdings                 map[string]ETFHoldingData      `json:"Holdings"`
	SectorWeights            map[string]ETFSectorWeight     `json:"Sector_Weights"`
	WorldRegions             map[string]ETFRegionWeight     `json:"World_Regions"`
	MarketCapitalisation     ETFMarketCapBreakdown          `json:"Market_Capitalisation"`
	ValuationsRatesPortfolio ETFValuationsRates             `json:"Valuations_Rates_Portfolio"`
	MorningStar              map[string]interface{}         `json:"MorningStar"`
}

// ETFHoldingData represents a single holding within an ETF portfolio.
type ETFHoldingData struct {
	Code          string    `json:"Code"`
	Name          string    `json:"Name"`
	Sector        string    `json:"Sector"`
	Industry      string    `json:"Industry"`
	Country       string    `json:"Country"`
	AssetsPercent FlexFloat `json:"Assets_%"`
}

// ETFSectorWeight represents sector allocation within an ETF.
type ETFSectorWeight struct {
	EquityPercent      FlexFloat `json:"Equity_%"`
	RelativeToCategory FlexFloat `json:"Relative_to_Category"`
}

// ETFRegionWeight represents geographic allocation within an ETF.
type ETFRegionWeight struct {
	EquityPercent      FlexFloat `json:"Equity_%"`
	RelativeToCategory FlexFloat `json:"Relative_to_Category"`
}

// ETFMarketCapBreakdown represents market cap distribution of ETF holdings.
type ETFMarketCapBreakdown struct {
	Mega   FlexFloat `json:"Mega"`
	Big    FlexFloat `json:"Big"`
	Medium FlexFloat `json:"Medium"`
	Small  FlexFloat `json:"Small"`
	Micro  FlexFloat `json:"Micro"`
}

// ETFValuationsRates represents aggregate valuation metrics for ETF holdings.
type ETFValuationsRates struct {
	PriceProspectiveEarnings FlexFloat `json:"Price/Prospective Earnings"`
	PriceBook                FlexFloat `json:"Price/Book"`
	PriceSales               FlexFloat `json:"Price/Sales"`
	PriceCashFlow            FlexFloat `json:"Price/Cash Flow"`
	DividendYieldFactor      FlexFloat `json:"Dividend-Yield Factor"`
}
