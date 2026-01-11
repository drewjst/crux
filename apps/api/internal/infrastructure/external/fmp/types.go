package fmp

// CompanyProfile represents the FMP company profile response.
type CompanyProfile struct {
	Symbol            string  `json:"symbol"`
	CompanyName       string  `json:"companyName"`
	Exchange          string  `json:"exchange"`
	Industry          string  `json:"industry"`
	Sector            string  `json:"sector"`
	Description       string  `json:"description"`
	CEO               string  `json:"ceo"`
	Website           string  `json:"website"`
	FullTimeEmployees int     `json:"fullTimeEmployees"`
	Price             float64 `json:"price"`
	MarketCap         int64   `json:"mktCap"`
	Beta              float64 `json:"beta"`
	VolAvg            int64   `json:"volAvg"`
	LastDiv           float64 `json:"lastDiv"`
	Range             string  `json:"range"`
	IPODate           string  `json:"ipoDate"`
	Country           string  `json:"country"`
}

// Quote represents the FMP quote response.
type Quote struct {
	Symbol           string  `json:"symbol"`
	Name             string  `json:"name"`
	Price            float64 `json:"price"`
	Change           float64 `json:"change"`
	ChangePercent    float64 `json:"changesPercentage"`
	DayHigh          float64 `json:"dayHigh"`
	DayLow           float64 `json:"dayLow"`
	YearHigh         float64 `json:"yearHigh"`
	YearLow          float64 `json:"yearLow"`
	Volume           int64   `json:"volume"`
	AvgVolume        int64   `json:"avgVolume"`
	MarketCap        int64   `json:"marketCap"`
	PE               float64 `json:"pe"`
	EPS              float64 `json:"eps"`
	Open             float64 `json:"open"`
	PreviousClose    float64 `json:"previousClose"`
	Timestamp        int64   `json:"timestamp"`
}

// IncomeStatement represents the FMP income statement response.
type IncomeStatement struct {
	Date                   string  `json:"date"`
	Symbol                 string  `json:"symbol"`
	FilingDate             string  `json:"fillingDate"`
	Period                 string  `json:"period"`
	Revenue                float64 `json:"revenue"`
	CostOfRevenue          float64 `json:"costOfRevenue"`
	GrossProfit            float64 `json:"grossProfit"`
	GrossProfitRatio       float64 `json:"grossProfitRatio"`
	OperatingExpenses      float64 `json:"operatingExpenses"`
	OperatingIncome        float64 `json:"operatingIncome"`
	OperatingIncomeRatio   float64 `json:"operatingIncomeRatio"`
	EBITDA                 float64 `json:"ebitda"`
	EBITDARatio            float64 `json:"ebitdaratio"`
	InterestExpense        float64 `json:"interestExpense"`
	IncomeBeforeTax        float64 `json:"incomeBeforeTax"`
	NetIncome              float64 `json:"netIncome"`
	NetIncomeRatio         float64 `json:"netIncomeRatio"`
	EPS                    float64 `json:"eps"`
	EPSDiluted             float64 `json:"epsdiluted"`
	WeightedAvgSharesOut   int64   `json:"weightedAverageShsOut"`
	WeightedAvgSharesDil   int64   `json:"weightedAverageShsOutDil"`
}

// BalanceSheet represents the FMP balance sheet response.
type BalanceSheet struct {
	Date                    string  `json:"date"`
	Symbol                  string  `json:"symbol"`
	FilingDate              string  `json:"fillingDate"`
	Period                  string  `json:"period"`
	TotalAssets             float64 `json:"totalAssets"`
	TotalCurrentAssets      float64 `json:"totalCurrentAssets"`
	TotalNonCurrentAssets   float64 `json:"totalNonCurrentAssets"`
	TotalLiabilities        float64 `json:"totalLiabilities"`
	TotalCurrentLiabilities float64 `json:"totalCurrentLiabilities"`
	TotalNonCurrentLiab     float64 `json:"totalNonCurrentLiabilities"`
	LongTermDebt            float64 `json:"longTermDebt"`
	TotalDebt               float64 `json:"totalDebt"`
	TotalStockholdersEquity float64 `json:"totalStockholdersEquity"`
	RetainedEarnings        float64 `json:"retainedEarnings"`
	CommonStock             float64 `json:"commonStock"`
	TotalEquity             float64 `json:"totalEquity"`
	SharesOutstanding       int64   `json:"commonStockSharesOutstanding"`
}

// CashFlowStatement represents the FMP cash flow statement response.
type CashFlowStatement struct {
	Date                   string  `json:"date"`
	Symbol                 string  `json:"symbol"`
	FilingDate             string  `json:"fillingDate"`
	Period                 string  `json:"period"`
	NetIncome              float64 `json:"netIncome"`
	OperatingCashFlow      float64 `json:"operatingCashFlow"`
	CapitalExpenditure     float64 `json:"capitalExpenditure"`
	FreeCashFlow           float64 `json:"freeCashFlow"`
	DividendsPaid          float64 `json:"dividendsPaid"`
	DebtRepayment          float64 `json:"debtRepayment"`
	CommonStockIssued      float64 `json:"commonStockIssued"`
	CommonStockRepurchased float64 `json:"commonStockRepurchased"`
}

// SearchResult represents a ticker search result.
type SearchResult struct {
	Symbol        string `json:"symbol"`
	Name          string `json:"name"`
	Currency      string `json:"currency"`
	StockExchange string `json:"stockExchange"`
	ExchangeShort string `json:"exchangeShortName"`
}
