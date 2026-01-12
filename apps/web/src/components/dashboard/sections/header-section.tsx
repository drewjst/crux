'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MiniChart } from './mini-chart';
import type { StockDetailResponse } from '@recon/shared';

interface HeaderSectionProps {
  data: StockDetailResponse;
}

export function HeaderSection({ data }: HeaderSectionProps) {
  const { company, quote, performance } = data;
  const isPositive = quote.changePercent >= 0;

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(0)}`;
  };

  // Get exchange prefix for TradingView symbol
  const getTradingViewSymbol = (ticker: string) => {
    // Common US exchanges - TradingView typically needs exchange prefix
    return `${ticker}`;
  };

  const performanceMetrics = [
    { label: '1D', value: performance.day1Change },
    { label: '1W', value: performance.week1Change },
    { label: '1M', value: performance.month1Change },
    { label: 'YTD', value: performance.ytdChange },
    { label: '1Y', value: performance.year1Change },
  ];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
          {/* Left side: Company info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-2xl">{company.ticker}</span>
              <span className="text-muted-foreground text-lg truncate">{company.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">${quote.price.toFixed(2)}</span>
              <span className={`flex items-center gap-1 text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                ${Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
              </span>
            </div>

            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2">
              <span>{company.sector}</span>
              <span>•</span>
              <span>{company.industry}</span>
              <span>•</span>
              <span>{formatMarketCap(quote.marketCap)}</span>
            </div>

            {/* Condensed performance metrics */}
            <div className="flex items-center gap-1 pt-2">
              {performanceMetrics.map(({ label, value }, index) => (
                <div key={label} className="flex items-center">
                  {index > 0 && <span className="text-muted-foreground/40 mx-1">|</span>}
                  <span className="text-xs text-muted-foreground mr-1">{label}</span>
                  <span className={`text-xs font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value > 0 ? '+' : ''}{value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            {/* 52-week range - compact version */}
            <div className="pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>${quote.fiftyTwoWeekLow.toFixed(0)}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{
                      width: `${Math.max(5, Math.min(100, ((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100))}%`
                    }}
                  />
                </div>
                <span>${quote.fiftyTwoWeekHigh.toFixed(0)}</span>
                <span className="text-muted-foreground/60">52W</span>
              </div>
            </div>
          </div>

          {/* Right side: Mini chart */}
          <div className="lg:w-[350px] h-[180px] mt-4 lg:mt-0 rounded-lg overflow-hidden">
            <MiniChart
              symbol={getTradingViewSymbol(company.ticker)}
              height={180}
              dateRange="12M"
              colorTheme="light"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
