.PHONY: build run dev test lint clean migrate deps

# Build the server binary
build:
	go build -o bin/api ./cmd/api

# Run the server
run: build
	./bin/api

# Run with hot reload (requires air: go install github.com/air-verse/air@latest)
dev:
	air -c .air.toml

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Run linter (requires: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
lint:
	golangci-lint run ./...

# Run database migrations (requires: go install github.com/pressly/goose/v3/cmd/goose@latest)
migrate:
	goose -dir migrations postgres "$(DATABASE_URL)" up

# Rollback last migration
migrate-down:
	goose -dir migrations postgres "$(DATABASE_URL)" down

# Create a new migration
migrate-create:
	@read -p "Migration name: " name; \
	goose -dir migrations create $$name sql

# Clean build artifacts
clean:
	rm -rf bin/
	rm -rf tmp/
	rm -f coverage.out coverage.html

# Download and tidy dependencies
deps:
	go mod download
	go mod tidy

# Generate go.sum
tidy:
	go mod tidy
