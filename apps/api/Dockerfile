# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/api ./cmd/api

# Production stage
FROM alpine:3.20

WORKDIR /app

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -S recon && adduser -S recon -G recon

# Copy binary from builder
COPY --from=builder /bin/api /app/api

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Switch to non-root user
USER recon

EXPOSE 8080

ENTRYPOINT ["/app/api"]
