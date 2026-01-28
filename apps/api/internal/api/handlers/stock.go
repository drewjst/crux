package handlers

import (
	"errors"
	"log/slog"
	"net/http"
	"regexp"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/drewjst/crux/apps/api/internal/api/middleware"
	"github.com/drewjst/crux/apps/api/internal/domain/stock"
)

// StockHandler handles stock-related HTTP requests.
type StockHandler struct {
	service *stock.Service
}

// NewStockHandler creates a new stock handler with the given service.
func NewStockHandler(service *stock.Service) *StockHandler {
	return &StockHandler{service: service}
}

// tickerPattern validates ticker symbols.
// Supports: AAPL, TSLA (1-5 letters), BRK.A, BRK.B (class shares with dot).
var tickerPattern = regexp.MustCompile(`^[A-Z]{1,5}(\.[A-Z]{1,2})?$`)

// GetStock handles GET /api/stock/{ticker} requests.
// Returns comprehensive stock data including scores, signals, and financials.
// Query params:
//   - refresh=true: Bypass cache and fetch fresh data
func (h *StockHandler) GetStock(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	ticker := strings.ToUpper(chi.URLParam(r, "ticker"))

	if !isValidTicker(ticker) {
		writeErrorWithDetails(w, http.StatusBadRequest, ErrCodeInvalidTicker,
			"Invalid ticker format",
			map[string]string{"ticker": ticker},
		)
		return
	}

	// Check for cache refresh flag
	forceRefresh := r.URL.Query().Get("refresh") == "true"
	if forceRefresh {
		slog.Info("cache refresh requested", "ticker", ticker, "request_id", requestID)
	}

	result, err := h.service.GetStockDetailWithOptions(ctx, ticker, forceRefresh)
	if err != nil {
		if errors.Is(err, stock.ErrTickerNotFound) {
			writeErrorWithDetails(w, http.StatusNotFound, ErrCodeTickerNotFound,
				"Stock not found",
				map[string]string{"ticker": ticker},
			)
			return
		}

		slog.Error("failed to get stock detail",
			"error", err,
			"ticker", ticker,
			"request_id", requestID,
		)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError, "Failed to retrieve stock data")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// isValidTicker checks if a ticker symbol matches expected format.
func isValidTicker(ticker string) bool {
	return tickerPattern.MatchString(ticker)
}
