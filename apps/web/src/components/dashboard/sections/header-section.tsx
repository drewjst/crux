'use client';

import Link from 'next/link';
import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MiniChart } from './mini-chart';
import type { StockDetailResponse } from '@recon/shared';

interface HeaderSectionProps {
  data: StockDetailResponse;
}

export function HeaderSection({ data }: HeaderSectionProps) {
  const { company, quote, performance } = data;
  const isPositive = quote.changePercent >= 0;

  const performanceMetrics = [
    { label: '1D', value: performance.day1Change },
    { label: '1W', value: performance.week1Change },
    { label: '1M', value: performance.month1Change },
    { label: 'YTD', value: performance.ytdChange },
    { label: '1Y', value: performance.year1Change },
  ];

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(0)}`;
  };

  // Calculate 52-week range position (0-100%)
  const rangePosition = Math.max(0, Math.min(100,
    ((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100
  ));

  return (
    <Card className="border border-border bg-card shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-8">
          {/* Left side: Header content - clickable to overview */}
          <Link
            href={`/stock/${company.ticker}/overview`}
            className="flex-1 group"
          >
            <div className="space-y-4 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer h-full p-2 -m-2">
              {/* Row 1: Ticker & Company Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold text-xl tracking-tight">{company.ticker}</span>
                  <span className="text-muted-foreground text-sm truncate max-w-[200px]">{company.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity lg:hidden" />
              </div>

              {/* Row 2: Price & Change - Fintech style with pill badge */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold font-mono tracking-tight">
                  ${quote.price.toFixed(2)}
                </span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-medium ${
                  isPositive
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                  <span className="font-mono">
                    {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Row 3: Middle Rail - Market Cap, Sector, Industry */}
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                <span className="font-mono">{formatMarketCap(quote.marketCap)}</span>
                <span>•</span>
                <span>{company.sector}</span>
                <span>•</span>
                <span>{company.industry}</span>
              </div>

              {/* Row 4: Performance Metrics */}
              <div className="flex items-center gap-1 pt-1">
                {performanceMetrics.map(({ label, value }, index) => (
                  <div key={label} className="flex items-center">
                    {index > 0 && <span className="text-muted-foreground/40 mx-2">|</span>}
                    <span className="text-xs text-muted-foreground mr-1">{label}</span>
                    <span className={`text-xs font-medium font-mono ${value >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {value > 0 ? '+' : ''}{value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 5: 52-Week Range Slider */}
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">
                  52-Week Range
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-14">
                    ${quote.fiftyTwoWeekLow.toFixed(0)}
                  </span>
                  {/* Custom slider track */}
                  <div className="flex-1 relative h-1.5">
                    {/* Track background */}
                    <div className="absolute inset-0 bg-muted rounded-full" />
                    {/* Filled portion up to marker */}
                    <div
                      className="absolute left-0 top-0 h-full bg-primary/30 rounded-full"
                      style={{ width: `${rangePosition}%` }}
                    />
                    {/* Current price marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm transition-all duration-300"
                      style={{ left: `calc(${rangePosition}% - 6px)` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-14 text-right">
                    ${quote.fiftyTwoWeekHigh.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Right side: TradingView Lightweight Chart */}
          <Link
            href={`/stock/${company.ticker}/overview`}
            className="block group mt-4 lg:mt-0"
          >
            <div className="w-full lg:w-[380px] h-[180px] rounded-lg border border-border bg-card hover:border-muted-foreground/30 transition-colors relative overflow-hidden">
              <MiniChart
                symbol={company.ticker}
                exchange={company.exchange}
                height={180}
                dateRange="12M"
                colorTheme="light"
              />
              <ChevronRight className="absolute top-3 right-3 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
