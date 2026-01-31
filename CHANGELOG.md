# Changelog

All notable changes to Crux are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- **Smart Money Deep Dive** — New `/stock/{ticker}/smart-money` page with comprehensive institutional analysis
  - Institutional ownership trends with historical charts
  - Top holders table with position changes
  - Holder type breakdown (hedge funds, mutual funds, etc.)
  - New/closed positions and biggest increases/decreases
  - AI-powered smart money summary
- **Institutional Detail API** — New `/api/stock/{ticker}/institutional` endpoint with full 13F data
- **News Sentiment Analysis** — AI-powered news sentiment with top article links
- **Short Interest Display** — Short interest metrics in Smart Money section
- **Congress Trades** — Senate and House trading disclosures in Smart Money section
  - Tabbed interface to switch between Insider and Congress activity
  - Shows politician name, party, state, trade type, and amount range
  - Data from FMP Senate/House disclosure endpoints
- **CruxAI Insights** — AI-powered analysis using Google Vertex AI (Gemini 2.0 Flash)
  - Position Summary: Executive overview on main stock page with quality signals and key factors
  - Valuation Summary: Deep-dive valuation analysis on valuation page
  - Smart Money Summary: Institutional and insider activity overview
  - News Sentiment: AI-analyzed news with key article links
  - 24-hour caching for generated insights
- **DCF Valuation** — Discounted Cash Flow analysis with intrinsic value estimates
- **Owner Earnings** — Buffett-style owner earnings calculation for quality assessment
- **Ticker search: ADR support** — Search now includes ADR Class C securities (e.g., NVO, TSM, BABA) alongside common stocks and ETFs
- **Ticker search: Parallel queries** — Runs ticker prefix search and fuzzy name search concurrently for better results and faster response
- **Collapsible Dashboard Sections** — Balance Sheet and Operating Metrics now collapsible for cleaner UI
- **Snapshot Sidebar** — Quick stats sidebar on stock pages

### Fixed
- **Institutional data availability** — Use conservative quarter estimates to ensure complete 13F filings (major institutions file near 45-day deadline)
- **FMP API field mappings** — Corrected JSON field mappings for institutional ownership data
- **Congress trade fields** — Aligned backend JSON fields with frontend types
- **News AI parsing** — Strip markdown code blocks before parsing AI response
- **AI prompt data accuracy** — Fixed double percentage conversion that showed margins as 100x actual value (e.g., -186% instead of -1.86%)
- **ETF fund overview data** — Fixed all N/A values in ETF fund overview (expense ratio, AUM, NAV, beta, etc.) by correcting FMP type mappings
- **ETF expense ratio display** — SPY now correctly shows 0.0945% instead of 9.45%
- **Header search persistence** — Ticker search in header now remains visible when navigating to `/stock/{ticker}` pages
- **Ticker search accuracy** — "WM" now correctly returns Waste Management as first result
- **CI/CD environment variables** — CruxAI env vars now persist across deployments
- **Cache error handling** — Cache retrieval and serialization errors now logged instead of silently discarded
- **Date parsing errors** — Parse failures for dates and numeric types now logged for debugging
- **Rate limiter cleanup** — Fixed goroutine leak in rate limiting middleware

### Changed
- **EODHD provider removed** — FMP is now the sole data provider (EODHD subscription discontinued)
- **Project renamed** — Renamed from "Recon" to "Crux"
- **Quarter calculation consolidated** — Shared fiscal quarter utilities for 13F data timing
- **Valuation Metrics UI** — Removed opinionated verdict headline; metrics now stand on their own with clear labels (P/E vs History, P/E vs Sector, PEG Ratio)
- **Home page quick tickers** — Updated to top 7 S&P 500 companies by market cap

### Removed
- **EODHD provider** — Removed EODHD as data provider (no longer used)
- **EODHD_API_KEY** — Environment variable no longer needed
- **FUNDAMENTALS_PROVIDER** — Environment variable no longer needed (FMP is the only provider)

---

## Previous Changes

Initial release features documented in [README.md](./README.md):
- Stock fundamental analysis with Piotroski F-Score, Rule of 40, Altman Z-Score
- Multi-provider architecture (FMP, Polygon)
- ETF support with holdings and sector breakdown
- Stock comparison tool
- 24-hour PostgreSQL caching
