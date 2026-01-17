// Package polygon provides a client for the Polygon.io API.
package polygon

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

const baseURL = "https://api.polygon.io"

// Client is a Polygon.io API client.
type Client struct {
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new Polygon API client.
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// TickerSearchResult represents a single ticker from Polygon search.
type TickerSearchResult struct {
	Ticker          string `json:"ticker"`
	Name            string `json:"name"`
	Market          string `json:"market"`
	Locale          string `json:"locale"`
	PrimaryExchange string `json:"primary_exchange"`
	Type            string `json:"type"`
	Active          bool   `json:"active"`
	CurrencyName    string `json:"currency_name"`
}

// tickersResponse is the API response structure.
type tickersResponse struct {
	Results   []TickerSearchResult `json:"results"`
	Status    string               `json:"status"`
	RequestID string               `json:"request_id"`
	Count     int                  `json:"count"`
	NextURL   string               `json:"next_url"`
}

// SearchTickers searches for tickers matching the query.
// Filters to common stocks and ETFs on major US exchanges.
func (c *Client) SearchTickers(ctx context.Context, query string, limit int) ([]TickerSearchResult, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	// Request more results than needed since we'll filter by type
	fetchLimit := limit * 2
	if fetchLimit > 50 {
		fetchLimit = 50
	}

	params := url.Values{}
	params.Set("search", query)
	params.Set("active", "true")
	params.Set("market", "stocks")
	params.Set("sort", "ticker")
	params.Set("order", "asc")
	params.Set("limit", fmt.Sprintf("%d", fetchLimit))
	params.Set("apiKey", c.apiKey)

	reqURL := fmt.Sprintf("%s/v3/reference/tickers?%s", baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var result tickersResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	// Filter to only common stocks (CS) and ETFs
	filtered := make([]TickerSearchResult, 0, len(result.Results))
	for _, r := range result.Results {
		if r.Type == "CS" || r.Type == "ETF" {
			filtered = append(filtered, r)
		}
	}

	// Sort by relevance: exact match first, then prefix match, then alphabetical
	upperQuery := strings.ToUpper(query)
	sort.Slice(filtered, func(i, j int) bool {
		ti, tj := filtered[i].Ticker, filtered[j].Ticker

		// Exact match gets highest priority
		exactI := ti == upperQuery
		exactJ := tj == upperQuery
		if exactI != exactJ {
			return exactI
		}

		// Prefix match gets second priority
		prefixI := strings.HasPrefix(ti, upperQuery)
		prefixJ := strings.HasPrefix(tj, upperQuery)
		if prefixI != prefixJ {
			return prefixI
		}

		// Then sort alphabetically
		return ti < tj
	})

	// Return top N results
	if len(filtered) > limit {
		filtered = filtered[:limit]
	}

	return filtered, nil
}
