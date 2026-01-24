package search

import (
	"context"
	"strings"

	"github.com/drewjst/crux/apps/api/internal/infrastructure/external/polygon"
)

// PolygonSearcher provides search functionality using the Polygon API.
type PolygonSearcher struct {
	client *polygon.Client
}

// NewPolygonSearcher creates a new Polygon-based search service.
func NewPolygonSearcher(client *polygon.Client) *PolygonSearcher {
	return &PolygonSearcher{client: client}
}

// Search queries Polygon for tickers matching the query.
func (s *PolygonSearcher) Search(ctx context.Context, query string, limit int) ([]Result, error) {
	if query == "" {
		return []Result{}, nil
	}

	if limit <= 0 {
		limit = 10
	}

	results, err := s.client.SearchTickers(ctx, query, limit)
	if err != nil {
		return nil, err
	}

	return convertResults(results), nil
}

// convertResults transforms Polygon results to our domain Result type.
func convertResults(polygonResults []polygon.TickerSearchResult) []Result {
	results := make([]Result, 0, len(polygonResults))

	for _, pr := range polygonResults {
		// Map Polygon type codes to our type names
		// CS = Common Stock, ETF = ETF, etc.
		assetType := mapPolygonType(pr.Type)

		results = append(results, Result{
			Ticker:   pr.Ticker,
			Name:     pr.Name,
			Exchange: pr.PrimaryExchange,
			Type:     assetType,
		})
	}

	return results
}

// mapPolygonType converts Polygon type codes to our asset types.
func mapPolygonType(polygonType string) string {
	switch strings.ToUpper(polygonType) {
	case "ETF":
		return "etf"
	case "CS": // Common Stock
		return "stock"
	case "PFD": // Preferred Stock
		return "stock"
	case "WARRANT":
		return "warrant"
	case "RIGHT":
		return "right"
	case "UNIT":
		return "unit"
	case "ADRC", "ADR": // ADR
		return "adr"
	case "SP": // Structured Product
		return "structured"
	default:
		return "stock"
	}
}
