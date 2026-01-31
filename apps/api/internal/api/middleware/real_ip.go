package middleware

import (
	"net"
	"net/http"
	"strings"
)

// RealIP extracts the real client IP from X-Forwarded-For or X-Real-IP headers.
// Falls back to RemoteAddr if no forwarding headers are present or if they are invalid.
// It only trusts headers if the request comes from a trusted proxy.
func RealIP(trustedProxies []string) func(http.Handler) http.Handler {
	// Parse trusted IPs/nets once for performance
	var trustedIPs []net.IP
	var trustedNets []*net.IPNet

	for _, p := range trustedProxies {
		if ip := net.ParseIP(p); ip != nil {
			trustedIPs = append(trustedIPs, ip)
		} else if _, ipNet, err := net.ParseCIDR(p); err == nil {
			trustedNets = append(trustedNets, ipNet)
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get immediate peer IP (strip port)
			remoteIPStr, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				remoteIPStr = r.RemoteAddr
			}
			remoteIP := net.ParseIP(remoteIPStr)

			isTrusted := false
			if remoteIP != nil {
				for _, tip := range trustedIPs {
					if remoteIP.Equal(tip) {
						isTrusted = true
						break
					}
				}
				if !isTrusted {
					for _, tnet := range trustedNets {
						if tnet.Contains(remoteIP) {
							isTrusted = true
							break
						}
					}
				}
			}

			if isTrusted {
				// 1. Try X-Forwarded-For
				if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
					// X-Forwarded-For can contain multiple IPs; first is the client
					if idx := strings.Index(xff, ","); idx != -1 {
						xff = xff[:idx]
					}
					xff = strings.TrimSpace(xff)
					if net.ParseIP(xff) != nil {
						r.RemoteAddr = xff
						next.ServeHTTP(w, r)
						return
					}
				}

				// 2. Try X-Real-IP
				if xri := r.Header.Get("X-Real-IP"); xri != "" {
					xri = strings.TrimSpace(xri)
					if net.ParseIP(xri) != nil {
						r.RemoteAddr = xri
						next.ServeHTTP(w, r)
						return
					}
				}
			}

			// 3. Fallback: Strip port from RemoteAddr
			if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
				r.RemoteAddr = ip
			}

			next.ServeHTTP(w, r)
		})
	}
}
