package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"

	"github.com/drewjst/recon/apps/api/internal/domain/scores"
	"github.com/drewjst/recon/apps/api/internal/domain/stock"
)

// Repository implements stock.Repository using PostgreSQL.
type Repository struct {
	db *sqlx.DB
}

// NewRepository creates a new PostgreSQL repository.
func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// GetCompany retrieves company information by ticker.
func (r *Repository) GetCompany(ctx context.Context, ticker string) (*stock.Company, error) {
	var company stock.Company
	err := r.db.GetContext(ctx, &company, queryGetCompany, ticker)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("querying company: %w", err)
	}
	return &company, nil
}

// GetQuote retrieves the latest quote for a ticker.
func (r *Repository) GetQuote(ctx context.Context, ticker string) (*stock.Quote, error) {
	var quote stock.Quote
	err := r.db.GetContext(ctx, &quote, queryGetQuote, ticker)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("querying quote: %w", err)
	}
	return &quote, nil
}

// GetFinancials retrieves key financial metrics for a ticker.
func (r *Repository) GetFinancials(ctx context.Context, ticker string) (*stock.Financials, error) {
	var financials stock.Financials
	err := r.db.GetContext(ctx, &financials, queryGetFinancials, ticker)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &stock.Financials{}, nil
		}
		return nil, fmt.Errorf("querying financials: %w", err)
	}
	return &financials, nil
}

// GetFinancialData retrieves raw financial data for score calculations.
func (r *Repository) GetFinancialData(ctx context.Context, ticker string, periods int) ([]scores.FinancialData, error) {
	var data []scores.FinancialData
	err := r.db.SelectContext(ctx, &data, queryGetFinancialData, ticker, periods)
	if err != nil {
		return nil, fmt.Errorf("querying financial data: %w", err)
	}
	return data, nil
}

// GetValuation retrieves valuation metrics for a ticker.
func (r *Repository) GetValuation(ctx context.Context, ticker string) (*stock.Valuation, error) {
	// For now, return empty valuation - will be populated from external APIs
	return &stock.Valuation{}, nil
}

// GetHoldings retrieves institutional holdings for a ticker.
func (r *Repository) GetHoldings(ctx context.Context, ticker string) (*stock.Holdings, error) {
	var holdings stock.Holdings
	err := r.db.GetContext(ctx, &holdings, queryGetHoldings, ticker)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &stock.Holdings{}, nil
		}
		return nil, fmt.Errorf("querying holdings: %w", err)
	}

	// Get top institutional holders
	var holders []stock.InstitutionalHolder
	err = r.db.SelectContext(ctx, &holders, queryGetTopHolders, ticker, 10)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("querying top holders: %w", err)
	}
	holdings.TopInstitutional = holders

	return &holdings, nil
}

// GetInsiderTrades retrieves recent insider transactions for a ticker.
func (r *Repository) GetInsiderTrades(ctx context.Context, ticker string, limit int) ([]stock.InsiderTrade, error) {
	var trades []stock.InsiderTrade
	err := r.db.SelectContext(ctx, &trades, queryGetInsiderTrades, ticker, limit)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("querying insider trades: %w", err)
	}
	return trades, nil
}

// Search finds tickers matching the query.
func (r *Repository) Search(ctx context.Context, query string, limit int) ([]stock.SearchResult, error) {
	var results []stock.SearchResult
	searchPattern := query + "%"
	err := r.db.SelectContext(ctx, &results, querySearch, searchPattern, searchPattern, limit)
	if err != nil {
		return nil, fmt.Errorf("searching tickers: %w", err)
	}
	return results, nil
}
