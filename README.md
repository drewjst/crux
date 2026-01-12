# Recon

Recon distills stock fundamentals into signals. Enter a ticker, get the crux in 30 seconds.

## Features

- **Conviction Scores**: Piotroski F-Score (0-9), Rule of 40, Altman Z-Score
- **Performance Tracking**: 1D, 1W, 1M, YTD, 1Y returns with 52-week range
- **Valuation Metrics**: P/E, PEG, EV/EBITDA, P/FCF, P/B with sector context
- **Growth & Profitability**: Revenue growth, margins, ROE, ROIC
- **Smart Money**: Institutional ownership, insider trading activity
- **Key Signals**: Actionable bullish/bearish/warning signals

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, TanStack Query, Tailwind CSS, shadcn/ui |
| Backend  | Go, Chi router                      |
| Data     | Financial Modeling Prep API         |
| Cache    | Redis 7 (optional)                  |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 14 (apps/web)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Server    │  │   Client    │  │     TanStack Query      │  │
│  │ Components  │  │ Components  │  │   (Server State Mgmt)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Go API (apps/api)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Chi Router  │  │  Handlers   │  │    Score Calculations   │  │
│  │             │  │             │  │  (Piotroski, Altman Z)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Financial Modeling Prep API                   │
│         (Quotes, Financials, Ratios, Historical Prices)         │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
recon/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   │   └── src/
│   │       ├── components/   # Dashboard sections, UI components
│   │       ├── hooks/        # TanStack Query hooks
│   │       └── lib/          # API client, utilities
│   └── api/              # Go backend service
│       ├── cmd/api/          # Entry point
│       └── internal/
│           ├── api/          # HTTP handlers, middleware
│           ├── domain/       # Business logic (scores, signals)
│           └── infrastructure/   # FMP client, cache
├── packages/
│   └── shared/           # Shared TypeScript types (API contracts)
└── docs/
    ├── architecture.md
    └── api-spec.md
```

## Local Development

### Prerequisites

- Node.js 20+
- Go 1.22+
- pnpm (recommended) or npm
- FMP API key ([get one free](https://financialmodelingprep.com/developer/docs/))

### Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url> recon
   cd recon
   pnpm install
   ```

2. **Configure environment**
   ```bash
   # API
   cd apps/api
   cp .env.example .env
   # Edit .env and add your FMP_API_KEY

   # Web
   cd ../web
   cp .env.example .env.local
   ```

3. **Run the API**
   ```bash
   cd apps/api
   go run ./cmd/api
   ```

4. **Run the frontend** (new terminal)
   ```bash
   cd apps/web
   pnpm dev
   ```

5. **Open the app**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/api/stock/AAPL

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/stock/{ticker}` | Full stock analysis with scores, signals, financials |
| `GET /api/search?q={query}` | Ticker search |
| `GET /health` | Health check |

## Documentation

- [Architecture Deep Dive](./docs/architecture.md)
- [API Specification](./docs/api-spec.md)
- [Claude Code Guidelines](./CLAUDE.md)

## Contributing

See [CLAUDE.md](./CLAUDE.md) for code standards and conventions.
