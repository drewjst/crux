# Cruxit

**Stock fundamental analysis, distilled.** Enter a ticker, get the crux in 30 seconds.

Cruxit synthesizes financial data into conviction scores and actionable signals — cutting through noise to surface what matters for investment decisions.

Live at [cruxit.finance](https://cruxit.finance)

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
- **Sector Heatmap** — Sector-level overview with aggregate stats, SMA breadth, and RS rankings
- **ETF Support** — Fund overview, holdings, sector breakdown, and performance

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| State | TanStack Query |
| Styling | Tailwind CSS 4, shadcn/ui |
| Charts | Recharts |
| Types | `@recon/shared` (local package) |
| Backend | Go API ([crux-api](https://github.com/drewjst/crux-api)) |
| Deployment | Google Cloud Run, GitHub Actions |

## Local Development

### Prerequisites

- Node.js 22+
- [crux-api](https://github.com/drewjst/crux-api) running locally (or use a deployed URL)

### Quick Start

```bash
git clone https://github.com/drewjst/crux.git
cd crux
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL in .env.local (default: http://localhost:8080)

npm run dev
```

Open http://localhost:3000

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend API URL (default: `http://localhost:8080`) |
| `API_KEY` | No | API key for server-side requests to authenticated API (prod only) |

## Project Structure

```
src/
  app/                  # Pages (stock, compare, sectors, 10k, crypto)
  components/           # React components (layout, search, sectors, ui)
  hooks/                # TanStack Query hooks
  lib/                  # API client, utilities, types
packages/
  shared/               # Shared TypeScript API type contracts
.github/
  workflows/            # CI/CD (release, deploy-dev, deploy-prod)
  cloudbuild-web.yaml   # Cloud Build config
```

## Deployment

Hosted on **Google Cloud Run** with CI/CD via GitHub Actions.

| Trigger | Environment |
|---------|-------------|
| Push to `main` | Dev |
| Release published or manual dispatch | Prod |

Secrets are managed via Google Secret Manager and injected at deploy time.

## Contributing

See [CLAUDE.md](./CLAUDE.md) for coding standards and architecture decisions.

## License

MIT
