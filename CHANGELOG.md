# Changelog

All notable changes to Recon are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- **Ticker search: ADR support** — Search now includes ADR Class C securities (e.g., NVO, TSM, BABA) alongside common stocks and ETFs
- **Ticker search: Parallel queries** — Runs ticker prefix search and fuzzy name search concurrently for better results and faster response

### Fixed
- **ETF fund overview data** — Fixed all N/A values in ETF fund overview (expense ratio, AUM, NAV, beta, etc.) by correcting FMP type mappings
- **ETF expense ratio display** — SPY now correctly shows 0.0945% instead of 9.45%
- **Header search persistence** — Ticker search in header now remains visible when navigating to `/stock/{ticker}` pages
- **Ticker search accuracy** — "WM" now correctly returns Waste Management as first result

### Changed
- **Default provider** — FMP is now the default and recommended fundamentals provider (EODHD remains as fallback for ETF holdings)

---

## Previous Changes

Initial release features documented in [README.md](./README.md):
- Stock fundamental analysis with Piotroski F-Score, Rule of 40, Altman Z-Score
- Multi-provider architecture (FMP, Polygon, EODHD)
- ETF support with holdings and sector breakdown
- Stock comparison tool
- 24-hour PostgreSQL caching
