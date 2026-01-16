// Package main generates the static tickers.json file from FMP API.
// Run: go run cmd/generate-tickers/main.go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

const (
	outputPath = "internal/domain/search/tickers.json"
)

// Ticker represents a stock or ETF for the search index.
type Ticker struct {
	Symbol   string `json:"ticker"`
	Name     string `json:"name"`
	Exchange string `json:"exchange"`
	Type     string `json:"type"`
}

// FMPStock represents a stock from FMP's stock list endpoint.
type FMPStock struct {
	Symbol        string `json:"symbol"`
	Name          string `json:"name"`
	Exchange      string `json:"exchange"`
	ExchangeShort string `json:"exchangeShortName"`
	Type          string `json:"type"`
}

// FMPETFInfo represents an ETF from FMP's ETF list endpoint.
type FMPETFInfo struct {
	Symbol   string `json:"symbol"`
	Name     string `json:"name"`
	Exchange string `json:"exchange"`
}

// ManualTickers are tickers that FMP might miss but we want to include.
var ManualTickers = []Ticker{
	{"MSTR", "MicroStrategy Incorporated", "NASDAQ", "stock"},
	{"HUT", "Hut 8 Corp.", "NASDAQ", "stock"},
	{"RIOT", "Riot Platforms Inc.", "NASDAQ", "stock"},
	{"MARA", "Marathon Digital Holdings Inc.", "NASDAQ", "stock"},
	{"COIN", "Coinbase Global Inc.", "NASDAQ", "stock"},
	{"CLSK", "CleanSpark Inc.", "NASDAQ", "stock"},
	{"BITF", "Bitfarms Ltd.", "NASDAQ", "stock"},
	{"IREN", "Iris Energy Limited", "NASDAQ", "stock"},
	{"CIFR", "Cipher Mining Inc.", "NASDAQ", "stock"},
	{"CORZ", "Core Scientific Inc.", "NASDAQ", "stock"},
}

func main() {
	apiKey := os.Getenv("FMP_API_KEY")
	if apiKey == "" {
		fmt.Println("FMP_API_KEY environment variable required")
		fmt.Println("Usage: FMP_API_KEY=your_key go run cmd/generate-tickers/main.go")
		os.Exit(1)
	}

	fmt.Println("Fetching stock list from FMP...")
	stocks, err := fetchStocks(apiKey)
	if err != nil {
		fmt.Printf("Error fetching stocks: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Fetched %d stocks\n", len(stocks))

	fmt.Println("Fetching ETF list from FMP...")
	etfs, err := fetchETFs(apiKey)
	if err != nil {
		fmt.Printf("Error fetching ETFs: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Fetched %d ETFs\n", len(etfs))

	// Combine and deduplicate
	tickerMap := make(map[string]Ticker)

	// Add manual tickers first (highest priority)
	for _, t := range ManualTickers {
		tickerMap[t.Symbol] = t
	}

	// Add stocks
	for _, s := range stocks {
		if _, exists := tickerMap[s.Symbol]; exists {
			continue // Don't overwrite manual entries
		}
		if !isUSExchange(s.ExchangeShort) {
			continue
		}
		tickerMap[s.Symbol] = Ticker{
			Symbol:   s.Symbol,
			Name:     s.Name,
			Exchange: normalizeExchange(s.ExchangeShort),
			Type:     "stock",
		}
	}

	// Add ETFs
	for _, e := range etfs {
		if _, exists := tickerMap[e.Symbol]; exists {
			continue
		}
		tickerMap[e.Symbol] = Ticker{
			Symbol:   e.Symbol,
			Name:     e.Name,
			Exchange: normalizeExchange(e.Exchange),
			Type:     "etf",
		}
	}

	// Convert to sorted slice
	tickers := make([]Ticker, 0, len(tickerMap))
	for _, t := range tickerMap {
		// Filter out invalid entries
		if t.Symbol == "" || t.Name == "" {
			continue
		}
		// Filter out symbols with special characters (warrants, units, etc.)
		if strings.ContainsAny(t.Symbol, "^+-") {
			continue
		}
		tickers = append(tickers, t)
	}

	// Sort alphabetically by symbol
	sort.Slice(tickers, func(i, j int) bool {
		return tickers[i].Symbol < tickers[j].Symbol
	})

	fmt.Printf("Total unique tickers: %d\n", len(tickers))

	// Write to file
	data, err := json.MarshalIndent(tickers, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	if err := os.WriteFile(outputPath, data, 0644); err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully wrote %d tickers to %s\n", len(tickers), outputPath)
}

func fetchStocks(apiKey string) ([]FMPStock, error) {
	url := fmt.Sprintf("https://financialmodelingprep.com/api/v3/stock/list?apikey=%s", apiKey)
	return fetchJSON[[]FMPStock](url)
}

func fetchETFs(apiKey string) ([]FMPETFInfo, error) {
	url := fmt.Sprintf("https://financialmodelingprep.com/api/v3/etf/list?apikey=%s", apiKey)
	return fetchJSON[[]FMPETFInfo](url)
}

func fetchJSON[T any](url string) (T, error) {
	var result T

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return result, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return result, fmt.Errorf("API returned %d: %s", resp.StatusCode, string(body))
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return result, fmt.Errorf("JSON decode failed: %w", err)
	}

	return result, nil
}

func isUSExchange(exchange string) bool {
	usExchanges := map[string]bool{
		"NASDAQ": true,
		"NYSE":   true,
		"AMEX":   true,
		"BATS":   true,
		"ARCA":   true,
		"":       true, // Include if no exchange specified
	}
	return usExchanges[strings.ToUpper(exchange)]
}

func normalizeExchange(exchange string) string {
	switch strings.ToUpper(exchange) {
	case "NASDAQ", "NGM", "NGS", "NMS":
		return "NASDAQ"
	case "NYSE", "NYQ":
		return "NYSE"
	case "AMEX", "ASE":
		return "AMEX"
	case "BATS", "BZX":
		return "BATS"
	case "ARCA", "PCX":
		return "NYSE"
	default:
		if exchange == "" {
			return "US"
		}
		return exchange
	}
}
