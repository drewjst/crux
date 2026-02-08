# Crux

**Stock fundamental analysis, distilled.** Enter a ticker, get the crux in 30 seconds.

Crux synthesizes financial data into conviction scores and actionable signals — cutting through noise to surface what matters for investment decisions.

## Features

- **AI Insights** — Vertex AI-powered summaries for valuation, position analysis, and news sentiment
- **Financial Health Scores** — Piotroski F-Score (0-9), Rule of 40, Altman Z-Score, DCF Valuation
- **Growth** — Revenue, EPS, net income, operating income, projected EPS/revenue, FCF, and operating cash flow growth with sector percentile rankings
- **Performance** — 1D, 1W, 1M, YTD, 1Y returns with 52-week range visualization
- **Valuation** — P/E, Forward P/E, PEG, EV/EBITDA, P/FCF, P/B with sector percentiles
- **Profitability** — ROIC, ROE, operating/gross/net margins with sector comparisons
- **10-K Financials** — Detailed income statement, balance sheet, and cash flow with multi-period comparison, common-size analysis, and CSV export
- **Smart Money** — Institutional ownership trends, insider activity, congressional trades, short interest
- **Signals** — Automated bullish/bearish/warning flags based on score thresholds
- **Stock Compare** — Side-by-side comparison of 2-4 stocks
- **Sector Heatmap** — Sector-level overview with aggregate stats and SMA breadth
- **ETF Support** — Fund overview, holdings, sector breakdown, and performance

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React 19, TanStack Query, Tailwind CSS, shadcn/ui |
| Backend | Go (separate repo: [crux-api](https://github.com/drewjst/crux-api)) |
| Database | PostgreSQL (Cloud SQL) |
| AI | Google Vertex AI (Gemini 2.0 Flash) |
| Data | FMP (fundamentals), Polygon.io (search), Massive (technicals) |
| Deployment | Google Cloud Run, GitHub Actions |

## Local Development

### Prerequisites

- Node.js 22+
- [API server](https://github.com/drewjst/crux-api) running locally (or use a deployed URL)

### Quick Start

```bash
git clone https://github.com/drewjst/crux.git
cd crux
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL in .env.local (default: http://localhost:8080)

# Start frontend
npm run dev
```

Frontend: http://localhost:3000

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend API URL (default: http://localhost:8080) |

## Project Structure

```
crux/
├── src/
│   ├── app/              # Pages (stock, compare, sectors, crypto)
│   ├── components/       # React components
│   ├── hooks/            # TanStack Query hooks
│   └── lib/              # API client, utilities, types
├── packages/
│   └── shared/           # Shared TypeScript API contracts
├── Dockerfile            # Production container build
└── .github/
    ├── workflows/        # GitHub Actions (deploy dev/prod)
    └── cloudbuild-web.yaml
```

## Deployment

Hosted on **Google Cloud Run**.

- Push to `main` deploys to dev environment
- Release publish deploys to production
- Secrets managed via Google Secret Manager

## Contributing

See [CLAUDE.md](./CLAUDE.md) for coding standards and conventions.

**Key Principles:**
- Readability over cleverness
- Functions do one thing (max 20-30 lines)
- Type safety (no `any` in TypeScript)
- Server Components where possible, client only for interactivity

## License

MIT
