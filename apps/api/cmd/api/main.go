// Package main is the entry point for the Recon API server.
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"github.com/drewjst/recon/apps/api/internal/api"
	"github.com/drewjst/recon/apps/api/internal/config"
	"github.com/drewjst/recon/apps/api/internal/domain/stock"
	"github.com/drewjst/recon/apps/api/internal/infrastructure/cache"
	"github.com/drewjst/recon/apps/api/internal/infrastructure/database"
)

func main() {
	// Load .env file in development
	_ = godotenv.Load()

	// Initialize structured logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	if err := run(); err != nil {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx := context.Background()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// Initialize database
	db, err := database.NewSQLx(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	// Initialize cache
	var stockCache stock.Cache
	if cfg.EnableCache {
		redisCache, err := cache.NewRedis(ctx, cache.Config{URL: cfg.RedisURL})
		if err != nil {
			slog.Warn("redis unavailable, caching disabled", "error", err)
		} else {
			stockCache = redisCache
			defer redisCache.Close()
		}
	}

	// Initialize services
	repo := database.NewRepository(db)
	stockService := stock.NewService(repo, stockCache)

	// Initialize router
	router := api.NewRouter(api.RouterDeps{
		StockService:   stockService,
		AllowedOrigins: []string{"http://localhost:3000"},
	})

	// Create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server
	go func() {
		slog.Info("starting server", "port", cfg.Port, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
		}
	}()

	// Wait for shutdown signal
	return gracefulShutdown(srv)
}

func gracefulShutdown(srv *http.Server) error {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		return err
	}

	slog.Info("server stopped")
	return nil
}
