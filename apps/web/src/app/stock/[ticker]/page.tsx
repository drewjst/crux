'use client';

import { useParams } from 'next/navigation';
import { useStock } from '@/hooks/use-stock';
import { QuoteHeader } from '@/components/dashboard/quote-header';
import { ScoreCards } from '@/components/dashboard/score-cards';
import { SignalsBlock } from '@/components/dashboard/signals-block';
import { ValuationTable } from '@/components/dashboard/valuation-table';
import { HoldingsTable } from '@/components/dashboard/holdings-table';
import { InsiderTable } from '@/components/dashboard/insider-table';
import { FinancialsChart } from '@/components/dashboard/financials-chart';
import { TickerSearch } from '@/components/search/ticker-search';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default function StockPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const { data, isLoading, error } = useStock(ticker);

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Error Loading {ticker.toUpperCase()}</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load stock data'}
          </p>
          <div className="pt-4">
            <TickerSearch className="max-w-sm mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <StockPageSkeleton ticker={ticker} />;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <QuoteHeader company={data.company} quote={data.quote} />
        <TickerSearch className="lg:w-80" />
      </div>

      <ScoreCards scores={data.scores} />

      <SignalsBlock signals={data.signals} />

      <div className="grid lg:grid-cols-2 gap-6">
        <ValuationTable valuation={data.valuation} />
        <HoldingsTable holdings={data.holdings} />
      </div>

      <FinancialsChart financials={data.financials} />

      <InsiderTable trades={data.insiderTrades} />

      <footer className="pt-4 border-t text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            Quote: {formatRelativeTime(data.meta.priceAsOf)}
          </span>
          <span>
            Financials: {data.meta.fundamentalsAsOf}
          </span>
          <span>
            Holdings: {data.meta.holdingsAsOf}
          </span>
        </div>
      </footer>
    </div>
  );
}

function StockPageSkeleton({ ticker }: { ticker: string }) {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <Skeleton className="h-48" />

      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>

      <Skeleton className="h-80" />

      <Skeleton className="h-64" />
    </div>
  );
}
