package api

import (
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRouter_Compression(t *testing.T) {
	// Initialize router with empty deps (health endpoint doesn't require services)
	deps := RouterDeps{}
	r := NewRouter(deps)

	// Create a request with Accept-Encoding: gzip
	req := httptest.NewRequest("GET", "/health?detailed=true", nil)
	req.Header.Set("Accept-Encoding", "gzip")
	w := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(w, req)

	// Check status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", w.Code)
	}

	// Check Content-Encoding header
	ce := w.Header().Get("Content-Encoding")
	if ce != "gzip" {
		t.Errorf("Expected Content-Encoding: gzip, got %q", ce)
	}

	// Verify body is actually compressed
	if ce == "gzip" {
		gr, err := gzip.NewReader(w.Body)
		if err != nil {
			t.Fatalf("Failed to create gzip reader: %v", err)
		}
		defer gr.Close()

		decompressed, err := io.ReadAll(gr)
		if err != nil {
			t.Fatalf("Failed to read compressed body: %v", err)
		}

		if !strings.Contains(string(decompressed), "healthy") {
			t.Errorf("Expected body to contain 'healthy', got %s", string(decompressed))
		}
	}
}
