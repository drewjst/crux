package middleware

import (
	"net"
	"net/http"
	"strings"
)

// RealIP extracts the real client IP from X-Forwarded-For or X-Real-IP headers.
// Falls back to RemoteAddr if no forwarding headers are present.
func RealIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			// X-Forwarded-For can contain multiple IPs; first is the client
			if idx := strings.Index(xff, ","); idx != -1 {
				xff = xff[:idx]
			}
			xff = strings.TrimSpace(xff)
			if xff != "" {
				r.RemoteAddr = xff
			}
		} else if xri := r.Header.Get("X-Real-IP"); xri != "" {
			r.RemoteAddr = strings.TrimSpace(xri)
		} else {
			// Strip port from RemoteAddr
			if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
				r.RemoteAddr = ip
			}
		}

		next.ServeHTTP(w, r)
	})
}
