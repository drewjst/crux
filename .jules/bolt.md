# Bolt's Journal

## Critical Learnings

## 2024-05-22 - [Lazy Loading Dashboard Sections]
**Learning:** `StockDashboard` is a heavy client component importing many sub-sections. By default, Next.js bundles all imported client components into the parent's chunk. Lazy loading below-the-fold sections using `next/dynamic` significantly reduces the initial bundle size for the dashboard route.
**Action:** Identify large client components that are not immediately visible and lazy load them using `next/dynamic` with named exports handling (`import(...).then(mod => mod.NamedExport)`).

## 2026-02-01 - [Missing GZIP Compression]
**Learning:** The Go API was missing GZIP compression middleware despite `apps/api` being a high-traffic JSON provider. This resulted in significantly larger payloads for stock data.
**Action:** Always verify `Compress` middleware is present in `chi` routers for API services, especially when handling large JSON objects.
