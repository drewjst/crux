import Link from 'next/link';
import { TickerSearch } from '@/components/search/ticker-search';
import { EXAMPLE_TICKERS } from '@/lib/constants';

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <div className="mx-auto max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Recon
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter a ticker. Get the crux in 30 seconds.
          </p>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <TickerSearch size="lg" autoFocus />
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_TICKERS.map((ticker) => (
              <Link
                key={ticker.symbol}
                href={`/stock/${ticker.symbol}`}
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {ticker.symbol}
                <span className="ml-1.5 text-muted-foreground">{ticker.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-8 text-sm text-muted-foreground max-w-md mx-auto">
          <p>
            Recon distills fundamental data into actionable signals. We analyze
            Piotroski scores, Altman Z-scores, institutional holdings, and insider
            activity to surface what matters.
          </p>
        </div>
      </div>
    </div>
  );
}
