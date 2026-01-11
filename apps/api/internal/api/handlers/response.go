package handlers

import (
	"encoding/json"
	"net/http"
)

// APIError represents a standardized error response.
type APIError struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

// Common error codes
const (
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeBadRequest     = "BAD_REQUEST"
	ErrCodeInternalError  = "INTERNAL_ERROR"
	ErrCodeInvalidTicker  = "INVALID_TICKER"
	ErrCodeTickerNotFound = "TICKER_NOT_FOUND"
)

// writeJSON writes a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// writeError writes a standardized error response.
func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, APIError{
		Code:    code,
		Message: message,
	})
}

// writeErrorWithDetails writes an error response with additional details.
func writeErrorWithDetails(w http.ResponseWriter, status int, code, message string, details map[string]string) {
	writeJSON(w, status, APIError{
		Code:    code,
		Message: message,
		Details: details,
	})
}
