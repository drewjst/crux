package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/drewjst/recon/apps/api/internal/api/middleware"
	"github.com/drewjst/recon/apps/api/internal/domain/stock"
)

const (
	defaultSearchLimit = 10
	maxSearchLimit     = 50
)

// SearchHandler handles ticker search requests.
type SearchHandler struct {
	service *stock.Service
}

// NewSearchHandler creates a new search handler with the given service.
func NewSearchHandler(service *stock.Service) *SearchHandler {
	return &SearchHandler{service: service}
}

// SearchResponse represents the search API response.
type SearchResponse struct {
	Results []stock.SearchResult `json:"results"`
	Query   string               `json:"query"`
}

// Search handles GET /api/search?q={query} requests.
// Returns matching tickers for autocomplete functionality.
func (h *SearchHandler) Search(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	requestID := middleware.GetRequestID(ctx)

	query := r.URL.Query().Get("q")
	if query == "" {
		writeError(w, http.StatusBadRequest, ErrCodeBadRequest, "Query parameter 'q' is required")
		return
	}

	limit := parseLimit(r.URL.Query().Get("limit"))

	results, err := h.service.Search(ctx, query, limit)
	if err != nil {
		slog.Error("search failed",
			"error", err,
			"query", query,
			"request_id", requestID,
		)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError, "Search failed")
		return
	}

	writeJSON(w, http.StatusOK, SearchResponse{
		Results: results,
		Query:   query,
	})
}

// parseLimit extracts and validates the limit parameter.
func parseLimit(s string) int {
	if s == "" {
		return defaultSearchLimit
	}

	limit, err := strconv.Atoi(s)
	if err != nil || limit < 1 {
		return defaultSearchLimit
	}

	if limit > maxSearchLimit {
		return maxSearchLimit
	}

	return limit
}
