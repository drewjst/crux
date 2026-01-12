// Package config handles environment-based configuration loading and validation.
package config

import (
	"fmt"
	"os"
)

// Config holds all configuration values for the application.
// All fields are populated from environment variables.
type Config struct {
	// Server settings
	Port string
	Env  string // "development", "staging", "production"

	// External APIs
	FMPAPIKey string // Financial Modeling Prep API key
}

// Load reads configuration from environment variables and validates required fields.
// Returns an error if any required configuration is missing.
func Load() (*Config, error) {
	cfg := &Config{
		Port:      getEnv("PORT", "8080"),
		Env:       getEnv("ENV", "development"),
		FMPAPIKey: os.Getenv("FMP_API_KEY"),
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return cfg, nil
}

// validate checks that all required configuration is present.
func (c *Config) validate() error {
	if c.FMPAPIKey == "" {
		return fmt.Errorf("FMP_API_KEY is required")
	}
	return nil
}

// IsDevelopment returns true if running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if running in production mode.
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

// getEnv returns the environment variable value or a default if not set.
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
