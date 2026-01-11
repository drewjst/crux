// Package cache provides Redis caching functionality.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Redis implements the stock.Cache interface using Redis.
type Redis struct {
	client *redis.Client
	prefix string
}

// Config holds Redis configuration options.
type Config struct {
	URL    string
	Prefix string
}

// NewRedis creates a new Redis cache client.
func NewRedis(ctx context.Context, cfg Config) (*Redis, error) {
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("parsing redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	// Test the connection
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("pinging redis: %w", err)
	}

	prefix := cfg.Prefix
	if prefix == "" {
		prefix = "recon:"
	}

	return &Redis{
		client: client,
		prefix: prefix,
	}, nil
}

// Get retrieves a value from cache and unmarshals it into dest.
func (r *Redis) Get(ctx context.Context, key string, dest any) error {
	data, err := r.client.Get(ctx, r.prefix+key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return ErrCacheMiss
		}
		return fmt.Errorf("getting from cache: %w", err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("unmarshaling cached value: %w", err)
	}

	return nil
}

// Set stores a value in cache with the given TTL.
func (r *Redis) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("marshaling value for cache: %w", err)
	}

	if err := r.client.Set(ctx, r.prefix+key, data, ttl).Err(); err != nil {
		return fmt.Errorf("setting cache value: %w", err)
	}

	return nil
}

// Delete removes a value from cache.
func (r *Redis) Delete(ctx context.Context, key string) error {
	if err := r.client.Del(ctx, r.prefix+key).Err(); err != nil {
		return fmt.Errorf("deleting from cache: %w", err)
	}
	return nil
}

// Close closes the Redis connection.
func (r *Redis) Close() error {
	return r.client.Close()
}

// ErrCacheMiss is returned when a key is not found in cache.
var ErrCacheMiss = fmt.Errorf("cache miss")
