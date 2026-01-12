// Package config handles environment-based configuration loading and validation.
package config

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

// Config holds all configuration values for the application.
type Config struct {
	Port      string
	Env       string
	FMPAPIKey string
}

// Load reads configuration from environment variables.
// Falls back to AWS Secrets Manager for FMP_API_KEY in production.
func Load() (*Config, error) {
	cfg := &Config{
		Port: getEnv("PORT", "8080"),
		Env:  getEnv("ENV", "development"),
	}

	// Try env var first (local dev), then AWS Secrets Manager (production)
	if apiKey := os.Getenv("FMP_API_KEY"); apiKey != "" {
		cfg.FMPAPIKey = apiKey
	} else {
		slog.Info("FMP_API_KEY not in env, trying AWS Secrets Manager")
		secret, err := getAWSSecret("recon/fmp-api-key")
		if err != nil {
			return nil, fmt.Errorf("failed to get FMP API key: %w", err)
		}
		cfg.FMPAPIKey = secret
	}

	if cfg.FMPAPIKey == "" {
		return nil, fmt.Errorf("FMP_API_KEY is required")
	}

	return cfg, nil
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

// getAWSSecret retrieves a secret from AWS Secrets Manager.
func getAWSSecret(secretName string) (string, error) {
	ctx := context.Background()
	awsCfg, err := config.LoadDefaultConfig(ctx, config.WithRegion("us-west-2"))
	if err != nil {
		return "", fmt.Errorf("loading AWS config: %w", err)
	}

	client := secretsmanager.NewFromConfig(awsCfg)
	result, err := client.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: &secretName,
	})
	if err != nil {
		return "", fmt.Errorf("getting secret %s: %w", secretName, err)
	}

	if result.SecretString == nil {
		return "", fmt.Errorf("secret %s has no string value", secretName)
	}

	return *result.SecretString, nil
}
