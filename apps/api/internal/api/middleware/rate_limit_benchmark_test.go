package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

// BenchmarkRateLimit_VaryingPorts measures performance when requests come from the same IP but different ports.
// It also verifies that the visitor count remains 1, proving the memory leak fix.
func BenchmarkRateLimit_VaryingPorts(b *testing.B) {
	// High limit to focus on map access/parsing rather than limiting logic
	rl := NewRateLimiter(1000000)
	defer rl.Stop()

	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Simulate different ephemeral ports
		req.RemoteAddr = fmt.Sprintf("192.168.1.1:%d", 1024+(i%60000))

		// Reset recorder
		w = httptest.NewRecorder()

		handler.ServeHTTP(w, req)
	}

	// Stop timer to check verification
	b.StopTimer()

	if count := rl.VisitorCount(); count != 1 {
		b.Errorf("Expected 1 visitor (IP based), got %d. Memory leak detected!", count)
	}
}

type noopWriter struct {
	header http.Header
}

func (w *noopWriter) Header() http.Header {
	if w.header == nil {
		w.header = make(http.Header)
	}
	return w.header
}
func (w *noopWriter) Write(b []byte) (int, error) { return len(b), nil }
func (w *noopWriter) WriteHeader(statusCode int)  {}

func BenchmarkRateLimit_Concurrent(b *testing.B) {
	rl := NewRateLimiter(1000000)
	defer rl.Stop()

	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Pre-generate IPs to avoid fmt.Sprintf overhead during benchmark
	ips := make([]string, 1000)
	for i := 0; i < 1000; i++ {
		ips[i] = fmt.Sprintf("192.168.%d.%d", i/255, i%255)
	}

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		var i uint64
		w := &noopWriter{}
		req := httptest.NewRequest("GET", "/", nil)
		for pb.Next() {
			idx := atomic.AddUint64(&i, 1)
			req.RemoteAddr = ips[idx%1000]
			handler.ServeHTTP(w, req)
		}
	})
}
