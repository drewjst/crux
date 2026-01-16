// Package search provides ticker search functionality.
package search

import (
	_ "embed"
	"encoding/json"
	"strings"
)

//go:embed tickers.json
var tickersJSON []byte

// Ticker represents a stock or ETF ticker with metadata.
type Ticker struct {
	Symbol   string `json:"ticker"`
	Name     string `json:"name"`
	Exchange string `json:"exchange,omitempty"`
	Type     string `json:"type,omitempty"` // "stock" or "etf"
}

// Result is returned by the search endpoint.
type Result struct {
	Ticker   string `json:"ticker"`
	Name     string `json:"name"`
	Exchange string `json:"exchange"`
	Type     string `json:"type,omitempty"`
}

// Index holds the searchable ticker data.
type Index struct {
	tickers []tickerEntry
}

type tickerEntry struct {
	Ticker    string
	Name      string
	Exchange  string
	Type      string
	SearchKey string // lowercase ticker + name for matching
}

// NewIndex creates a new search index from embedded ticker data.
func NewIndex() (*Index, error) {
	var tickers []Ticker
	if err := json.Unmarshal(tickersJSON, &tickers); err != nil {
		return nil, err
	}

	entries := make([]tickerEntry, len(tickers))
	for i, t := range tickers {
		exchange := t.Exchange
		if exchange == "" {
			exchange = "US"
		}
		tickerType := t.Type
		if tickerType == "" {
			tickerType = "stock"
		}
		entries[i] = tickerEntry{
			Ticker:    t.Symbol,
			Name:      t.Name,
			Exchange:  exchange,
			Type:      tickerType,
			SearchKey: strings.ToLower(t.Symbol + " " + t.Name),
		}
	}

	return &Index{tickers: entries}, nil
}

// Search finds tickers matching the query.
func (idx *Index) Search(query string, limit int) []Result {
	if query == "" {
		return []Result{}
	}

	query = strings.ToLower(strings.TrimSpace(query))
	if limit <= 0 {
		limit = 10
	}

	var results []Result

	// First pass: exact ticker match (highest priority)
	for _, t := range idx.tickers {
		if strings.ToLower(t.Ticker) == query {
			results = append(results, Result{Ticker: t.Ticker, Name: t.Name, Exchange: t.Exchange, Type: t.Type})
			break
		}
	}

	// Second pass: prefix matches on ticker
	for _, t := range idx.tickers {
		if len(results) >= limit {
			break
		}
		if strings.HasPrefix(strings.ToLower(t.Ticker), query) && !containsTicker(results, t.Ticker) {
			results = append(results, Result{Ticker: t.Ticker, Name: t.Name, Exchange: t.Exchange, Type: t.Type})
		}
	}

	// Third pass: contains match on name
	for _, t := range idx.tickers {
		if len(results) >= limit {
			break
		}
		if strings.Contains(t.SearchKey, query) && !containsTicker(results, t.Ticker) {
			results = append(results, Result{Ticker: t.Ticker, Name: t.Name, Exchange: t.Exchange, Type: t.Type})
		}
	}

	return results
}

func containsTicker(results []Result, ticker string) bool {
	for _, r := range results {
		if r.Ticker == ticker {
			return true
		}
	}
	return false
}
