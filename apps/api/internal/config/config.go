package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port                 string
	Env                  string
	FMPAPIKey            string
	EODHDAPIKey          string
	FundamentalsProvider string // "fmp" (default) or "eodhd"
	PolygonAPIKey        string
	DatabaseURL          string
	AllowedOrigins       []string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:                 getEnv("PORT", "8080"),
		Env:                  getEnv("ENV", "development"),
		FMPAPIKey:            os.Getenv("FMP_API_KEY"),
		EODHDAPIKey:          os.Getenv("EODHD_API_KEY"),
		FundamentalsProvider: getEnv("FUNDAMENTALS_PROVIDER", "fmp"),
		PolygonAPIKey:        os.Getenv("POLYGON_API_KEY"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		cfg.AllowedOrigins = []string{"http://localhost:3000"}
	} else {
		rawOrigins := strings.Split(allowedOrigins, ",")
		for _, origin := range rawOrigins {
			if trimmed := strings.TrimSpace(origin); trimmed != "" {
				cfg.AllowedOrigins = append(cfg.AllowedOrigins, trimmed)
			}
		}
	}

	// Validate required API keys based on selected provider
	switch strings.ToLower(cfg.FundamentalsProvider) {
	case "eodhd":
		if cfg.EODHDAPIKey == "" {
			return nil, fmt.Errorf("EODHD_API_KEY environment variable is required when FUNDAMENTALS_PROVIDER=eodhd")
		}
	default: // "fmp" or empty (default)
		if cfg.FMPAPIKey == "" {
			return nil, fmt.Errorf("FMP_API_KEY environment variable is required")
		}
	}

	if cfg.PolygonAPIKey == "" {
		return nil, fmt.Errorf("POLYGON_API_KEY environment variable is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
