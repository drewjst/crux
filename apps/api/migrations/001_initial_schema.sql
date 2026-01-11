-- +goose Up
-- Initial schema for Recon stock research database

-- =============================================================================
-- Companies table - Core company information
-- =============================================================================
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    exchange VARCHAR(50),
    description TEXT,
    cik VARCHAR(10),
    market_cap BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_ticker ON companies(ticker);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_market_cap ON companies(market_cap DESC NULLS LAST);

-- =============================================================================
-- Quotes table - Real-time market data
-- =============================================================================
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    price DECIMAL(12, 4) NOT NULL,
    change DECIMAL(12, 4),
    change_percent DECIMAL(8, 4),
    volume BIGINT,
    market_cap BIGINT,
    fifty_two_week_high DECIMAL(12, 4),
    fifty_two_week_low DECIMAL(12, 4),
    as_of TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_ticker_as_of ON quotes(ticker, as_of DESC);

-- =============================================================================
-- Financial Statements - Raw financial data for calculations
-- =============================================================================
CREATE TABLE financial_statements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,
    fiscal_quarter INT, -- NULL for annual
    period_end_date DATE NOT NULL,

    -- Income Statement
    revenue DECIMAL(18, 2),
    cost_of_revenue DECIMAL(18, 2),
    gross_profit DECIMAL(18, 2),
    operating_income DECIMAL(18, 2),
    net_income DECIMAL(18, 2),
    ebit DECIMAL(18, 2),
    ebitda DECIMAL(18, 2),

    -- Balance Sheet
    total_assets DECIMAL(18, 2),
    total_liabilities DECIMAL(18, 2),
    current_assets DECIMAL(18, 2),
    current_liabilities DECIMAL(18, 2),
    long_term_debt DECIMAL(18, 2),
    total_debt DECIMAL(18, 2),
    shareholders_equity DECIMAL(18, 2),
    retained_earnings DECIMAL(18, 2),
    shares_outstanding BIGINT,

    -- Cash Flow
    operating_cash_flow DECIMAL(18, 2),
    capital_expenditure DECIMAL(18, 2),
    free_cash_flow DECIMAL(18, 2),

    -- Market Data (at period end)
    market_cap BIGINT,
    stock_price DECIMAL(12, 4),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(ticker, fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_financial_statements_ticker_period ON financial_statements(ticker, fiscal_year DESC, fiscal_quarter DESC);

-- =============================================================================
-- Financials - Computed metrics (derived from financial_statements)
-- =============================================================================
CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,
    fiscal_quarter INT,

    revenue_growth_yoy DECIMAL(8, 4),
    gross_margin DECIMAL(8, 4),
    operating_margin DECIMAL(8, 4),
    net_margin DECIMAL(8, 4),
    fcf_margin DECIMAL(8, 4),
    roe DECIMAL(8, 4),
    roic DECIMAL(8, 4),
    roa DECIMAL(8, 4),
    debt_to_equity DECIMAL(8, 4),
    current_ratio DECIMAL(8, 4),
    interest_coverage DECIMAL(8, 4),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(ticker, fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_financials_ticker_period ON financials(ticker, fiscal_year DESC, fiscal_quarter DESC);

-- =============================================================================
-- Holdings Summary - Aggregated institutional ownership
-- =============================================================================
CREATE TABLE holdings_summary (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    total_institutional_ownership DECIMAL(8, 4),
    net_change_shares BIGINT,
    net_change_quarters INT,
    quarter_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(ticker, quarter_date)
);

CREATE INDEX idx_holdings_summary_ticker ON holdings_summary(ticker, quarter_date DESC);

-- =============================================================================
-- Institutional Holders - Individual fund positions from 13F filings
-- =============================================================================
CREATE TABLE institutional_holders (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    fund_name VARCHAR(255) NOT NULL,
    fund_cik VARCHAR(10),
    shares BIGINT NOT NULL,
    value BIGINT NOT NULL,
    portfolio_percent DECIMAL(8, 4),
    change_shares BIGINT,
    change_percent DECIMAL(8, 4),
    quarter_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(ticker, fund_cik, quarter_date)
);

CREATE INDEX idx_institutional_holders_ticker ON institutional_holders(ticker, quarter_date DESC);
CREATE INDEX idx_institutional_holders_value ON institutional_holders(ticker, value DESC);

-- =============================================================================
-- Insider Trades - Form 4 filings
-- =============================================================================
CREATE TABLE insider_trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL REFERENCES companies(ticker) ON DELETE CASCADE,
    insider_name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    trade_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    shares BIGINT NOT NULL,
    price DECIMAL(12, 4),
    value BIGINT,
    trade_date DATE NOT NULL,
    filing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(ticker, insider_name, trade_date, trade_type, shares)
);

CREATE INDEX idx_insider_trades_ticker ON insider_trades(ticker, trade_date DESC);

-- =============================================================================
-- Sector Medians - For valuation comparisons
-- =============================================================================
CREATE TABLE sector_medians (
    id SERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    metric VARCHAR(50) NOT NULL, -- 'pe', 'forward_pe', 'peg', etc.
    median_value DECIMAL(12, 4),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(sector, metric)
);

CREATE INDEX idx_sector_medians_sector ON sector_medians(sector);

-- =============================================================================
-- Updated at trigger function
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_statements_updated_at
    BEFORE UPDATE ON financial_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financials_updated_at
    BEFORE UPDATE ON financials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_summary_updated_at
    BEFORE UPDATE ON holdings_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose Down
DROP TRIGGER IF EXISTS update_holdings_summary_updated_at ON holdings_summary;
DROP TRIGGER IF EXISTS update_financials_updated_at ON financials;
DROP TRIGGER IF EXISTS update_financial_statements_updated_at ON financial_statements;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS sector_medians;
DROP TABLE IF EXISTS insider_trades;
DROP TABLE IF EXISTS institutional_holders;
DROP TABLE IF EXISTS holdings_summary;
DROP TABLE IF EXISTS financials;
DROP TABLE IF EXISTS financial_statements;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS companies;
