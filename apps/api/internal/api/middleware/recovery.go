package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"
)

// Recoverer catches panics in handlers and returns a 500 error.
// Panics are logged with stack traces for debugging.
func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				requestID := GetRequestID(r.Context())

				slog.Error("panic recovered",
					"error", err,
					"request_id", requestID,
					"path", r.URL.Path,
					"stack", string(debug.Stack()),
				)

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(`{"code":"INTERNAL_ERROR","message":"An internal error occurred"}`))
			}
		}()

		next.ServeHTTP(w, r)
	})
}
