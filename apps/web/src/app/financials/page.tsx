'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, Search, TrendingUp, BarChart3, Wallet } from 'lucide-react';
import { TickerSearch } from '@/components/search/ticker-search';

export default function FinancialsLandingPage() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = '10-K Financial Statements | Crux';
  }, []);

  // Handle ticker selection - navigate to that stock's financials
  const handleTickerSelect = (ticker: string) => {
    router.push(`/stock/${ticker.toUpperCase()}/financials`);
  };

  return (
    <div className="min-h-screen border-x border-border max-w-4xl mx-auto bg-background/50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 mb-6">
            <FileSpreadsheet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            10-K Financial Statements
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Dive deep into income statements, balance sheets, and cash flows.
            Finance for nerds.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <TickerSearch
              onSelect={handleTickerSelect}
              placeholder="Search for a stock..."
              buttonLabel="View 10-K"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Enter a ticker symbol to view financial statements
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/50 rounded-xl border border-border/50 p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Income Statement</h3>
            <p className="text-sm text-muted-foreground">
              Revenue, margins, and profitability trends over time
            </p>
          </div>

          <div className="bg-card/50 rounded-xl border border-border/50 p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Balance Sheet</h3>
            <p className="text-sm text-muted-foreground">
              Assets, liabilities, and shareholder equity analysis
            </p>
          </div>

          <div className="bg-card/50 rounded-xl border border-border/50 p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Cash Flow</h3>
            <p className="text-sm text-muted-foreground">
              Operating, investing, and financing cash flows
            </p>
          </div>
        </div>

        {/* Popular Tickers - Quick Access */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Popular Stocks
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B'].map((ticker) => (
              <button
                key={ticker}
                onClick={() => handleTickerSelect(ticker)}
                className="px-3 py-1.5 text-sm font-mono rounded-lg border border-border/50 bg-card/50 hover:bg-muted hover:border-border transition-colors"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
