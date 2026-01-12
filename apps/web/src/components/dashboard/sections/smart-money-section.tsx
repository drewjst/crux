'use client';

import { SectionCard } from './section-card';
import { Badge } from '@/components/ui/badge';
import type { StockDetailResponse } from '@recon/shared';

interface SmartMoneySectionProps {
  data: StockDetailResponse;
}

export function SmartMoneySection({ data }: SmartMoneySectionProps) {
  const { holdings, insiderActivity } = data;

  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    if (absVal >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  const hasInsiderActivity = insiderActivity.buyCount90d > 0 || insiderActivity.sellCount90d > 0;

  return (
    <SectionCard title="Smart Money">
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Institutional Ownership</div>
          <div className="text-2xl font-bold">
            {holdings.totalInstitutionalOwnership > 0
              ? `${(holdings.totalInstitutionalOwnership * 100).toFixed(1)}%`
              : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Net Change (Qtrs)</div>
          <div className={`text-2xl font-bold ${holdings.netChangeShares >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {holdings.netChangeShares !== 0 ? (
              <>
                {holdings.netChangeShares >= 0 ? '+' : ''}
                {(holdings.netChangeShares / 1e6).toFixed(1)}M shares
              </>
            ) : (
              'N/A'
            )}
          </div>
        </div>
      </div>

      {holdings.topInstitutional.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Top Holders</div>
          <div className="space-y-2">
            {holdings.topInstitutional.slice(0, 3).map((holder) => (
              <div key={holder.fundCik} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm truncate max-w-[200px]">{holder.fundName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {(holder.shares / 1e6).toFixed(1)}M shares
                  </span>
                  <Badge
                    variant="outline"
                    className={holder.changePercent >= 0 ? 'text-green-600 border-green-600/30' : 'text-red-600 border-red-600/30'}
                  >
                    {holder.changePercent >= 0 ? '+' : ''}
                    {holder.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-dashed pt-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Insider Activity (90d)</div>
        {hasInsiderActivity ? (
          <>
            <div className="flex flex-wrap gap-4 md:gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">
                  {insiderActivity.buyCount90d} buys
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">
                  {insiderActivity.sellCount90d} sells
                </span>
              </div>
              <div className="ml-auto">
                <span className={`text-sm font-medium ${insiderActivity.netValue90d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net: {insiderActivity.netValue90d >= 0 ? '+' : ''}{formatValue(insiderActivity.netValue90d)}
                </span>
              </div>
            </div>
            {insiderActivity.trades.length > 0 && (
              <div className="space-y-2">
                {insiderActivity.trades.slice(0, 5).map((trade, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-t border-muted/50 first:border-t-0">
                    <span className="truncate max-w-[150px] md:max-w-[200px]">{trade.insiderName}</span>
                    <span className={trade.tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}>
                      {trade.tradeType === 'buy' ? 'Buy' : 'Sell'} {formatValue(trade.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No insider activity in last 90 days</div>
        )}
      </div>
    </SectionCard>
  );
}
