package database

// SQL queries as constants for type safety and easy review.
const (
	queryGetCompany = `
		SELECT ticker, name, sector, industry, description
		FROM companies
		WHERE ticker = $1`

	queryGetQuote = `
		SELECT
			price, change, change_percent, volume, market_cap,
			fifty_two_week_high, fifty_two_week_low, as_of
		FROM quotes
		WHERE ticker = $1
		ORDER BY as_of DESC
		LIMIT 1`

	queryGetFinancials = `
		SELECT
			revenue_growth_yoy, gross_margin, operating_margin,
			net_margin, fcf_margin, roe, roic, debt_to_equity,
			current_ratio, interest_coverage
		FROM financials
		WHERE ticker = $1
		ORDER BY fiscal_year DESC, fiscal_quarter DESC
		LIMIT 1`

	queryGetFinancialData = `
		SELECT
			revenue, gross_profit, operating_income, net_income, ebit,
			total_assets, total_liabilities, current_assets, current_liabilities,
			long_term_debt, shareholders_equity, retained_earnings, shares_outstanding,
			operating_cash_flow, free_cash_flow, market_cap, stock_price,
			fiscal_year, fiscal_quarter
		FROM financial_statements
		WHERE ticker = $1
		ORDER BY fiscal_year DESC, fiscal_quarter DESC
		LIMIT $2`

	queryGetHoldings = `
		SELECT
			total_institutional_ownership, net_change_shares, net_change_quarters
		FROM holdings_summary
		WHERE ticker = $1`

	queryGetTopHolders = `
		SELECT
			fund_name, fund_cik, shares, value, portfolio_percent,
			change_shares, change_percent, quarter_date
		FROM institutional_holders
		WHERE ticker = $1
		ORDER BY value DESC
		LIMIT $2`

	queryGetInsiderTrades = `
		SELECT
			insider_name, title, trade_type, shares, price, value, trade_date
		FROM insider_trades
		WHERE ticker = $1
		ORDER BY trade_date DESC
		LIMIT $2`

	querySearch = `
		SELECT ticker, name, exchange, sector
		FROM companies
		WHERE ticker ILIKE $1 OR name ILIKE $2
		ORDER BY
			CASE WHEN ticker ILIKE $1 THEN 0 ELSE 1 END,
			market_cap DESC NULLS LAST
		LIMIT $3`
)
