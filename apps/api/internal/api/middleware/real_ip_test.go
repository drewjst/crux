package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRealIP(t *testing.T) {
	tests := []struct {
		name           string
		trustedProxies []string
		headers        map[string]string
		remoteAddr     string
		expectedRemote string
	}{
		{
			name:           "No headers",
			trustedProxies: []string{},
			headers:        map[string]string{},
			remoteAddr:     "192.168.1.1:1234",
			expectedRemote: "192.168.1.1",
		},
		{
			name:           "Untrusted proxy with X-Forwarded-For",
			trustedProxies: []string{"10.0.0.1"},
			headers:        map[string]string{"X-Forwarded-For": "1.1.1.1"},
			remoteAddr:     "192.168.1.1:1234", // Not in trusted list
			expectedRemote: "192.168.1.1",     // Header ignored
		},
		{
			name:           "Trusted proxy IP with X-Forwarded-For",
			trustedProxies: []string{"192.168.1.1"},
			headers:        map[string]string{"X-Forwarded-For": "10.0.0.1"},
			remoteAddr:     "192.168.1.1:1234",
			expectedRemote: "10.0.0.1", // Header respected
		},
		{
			name:           "Trusted proxy CIDR with X-Forwarded-For",
			trustedProxies: []string{"192.168.1.0/24"},
			headers:        map[string]string{"X-Forwarded-For": "10.0.0.1"},
			remoteAddr:     "192.168.1.50:1234",
			expectedRemote: "10.0.0.1", // Header respected
		},
		{
			name:           "Trusted proxy with invalid X-Forwarded-For",
			trustedProxies: []string{"192.168.1.1"},
			headers:        map[string]string{"X-Forwarded-For": "invalid"},
			remoteAddr:     "192.168.1.1:1234",
			expectedRemote: "192.168.1.1", // Header ignored (invalid), port stripped
		},
		{
			name:           "Trusted proxy with X-Real-IP",
			trustedProxies: []string{"192.168.1.1"},
			headers:        map[string]string{"X-Real-IP": "10.0.0.2"},
			remoteAddr:     "192.168.1.1:1234",
			expectedRemote: "10.0.0.2",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			capturedRemote := ""
			nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				capturedRemote = r.RemoteAddr
			})

			handler := RealIP(tt.trustedProxies)(nextHandler)

			req := httptest.NewRequest("GET", "/", nil)
			req.RemoteAddr = tt.remoteAddr
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}

			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			if capturedRemote != tt.expectedRemote {
				t.Errorf("RemoteAddr = %q, want %q", capturedRemote, tt.expectedRemote)
			}
		})
	}
}
