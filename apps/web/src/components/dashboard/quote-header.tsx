import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import type { Company, Quote } from '@recon/shared';

interface QuoteHeaderProps {
  company: Company;
  quote: Quote;
}

export function QuoteHeader({ company, quote }: QuoteHeaderProps) {
  const isPositive = quote.changePercent >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{company.ticker}</h1>
        <span className="text-xl text-muted-foreground">{company.name}</span>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold">{formatCurrency(quote.price)}</span>
        <div
          className={cn(
            'flex items-center gap-1 text-lg font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isPositive ? (
            <ArrowUp className="h-5 w-5" />
          ) : (
            <ArrowDown className="h-5 w-5" />
          )}
          <span>{formatCurrency(Math.abs(quote.change))}</span>
          <span>({formatPercent(quote.changePercent)})</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">Sector:</span> {company.sector}
        </div>
        <div>
          <span className="font-medium">Industry:</span> {company.industry}
        </div>
        <div>
          <span className="font-medium">Market Cap:</span>{' '}
          {formatCurrency(quote.marketCap, true)}
        </div>
        <div>
          <span className="font-medium">52W Range:</span>{' '}
          {formatCurrency(quote.fiftyTwoWeekLow)} - {formatCurrency(quote.fiftyTwoWeekHigh)}
        </div>
      </div>
    </div>
  );
}
