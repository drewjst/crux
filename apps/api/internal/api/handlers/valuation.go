package handlers

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/drewjst/crux/apps/api/internal/api/middleware"
	"github.com/drewjst/crux/apps/api/internal/domain/valuation"
)

// ValuationHandler handles valuation-related HTTP requests.
type ValuationHandler struct {
	service *valuation.Service
}

// NewValuationHandler creates a new valuation handler with the given service.
func NewValuationHandler(service *valuation.Service) *ValuationHandler {
	return &ValuationHandler{service: service}
}

// GetValuation handles GET /api/stock/{ticker}/valuation requests.
// Returns comprehensive valuation analysis for the deep dive page.
func (h *ValuationHandler) GetValuation(w http.ResponseWriter, r *http.Request) {
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

	result, err := h.service.GetDeepDive(ctx, ticker)
	if err != nil {
		slog.Error("failed to get valuation deep dive",
			"error", err,
			"ticker", ticker,
			"request_id", requestID,
		)
		writeError(w, http.StatusInternalServerError, ErrCodeInternalError, "Failed to retrieve valuation data")
		return
	}

	if result == nil {
		writeErrorWithDetails(w, http.StatusNotFound, ErrCodeTickerNotFound,
			"Valuation data not available",
			map[string]string{"ticker": ticker},
		)
		return
	}

	writeJSON(w, http.StatusOK, result)
}
