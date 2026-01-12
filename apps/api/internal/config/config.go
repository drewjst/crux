package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port      string
	Env       string
	FMPAPIKey string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:      getEnv("PORT", "8080"),
		Env:       getEnv("ENV", "development"),
		FMPAPIKey: os.Getenv("FMP_API_KEY"),
	}

	if cfg.FMPAPIKey == "" {
		return nil, fmt.Errorf("FMP_API_KEY environment variable is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
