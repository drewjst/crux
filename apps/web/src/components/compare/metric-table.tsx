'use client';

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { SectionCard } from '@/components/dashboard/sections/section-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getNestedValue, findWinner, type MetricConfig } from '@/lib/compare-utils';
import { cn } from '@/lib/utils';
import type { StockDetailResponse, CompareLayout } from '@recon/shared';

interface MetricTableProps {
  title: string;
  stocks: StockDetailResponse[];
  metrics: MetricConfig[];
  layout: CompareLayout;
}

export const MetricTable = memo(function MetricTable({ title, stocks, metrics, layout }: MetricTableProps) {
  const tickers = stocks.map((s) => s.company.ticker);

  return (
    <SectionCard title={title}>
      <div className={cn('overflow-x-auto', layout === 'table' && '-mx-4 px-4')}>
        <Table className={cn(layout === 'table' && 'min-w-[600px]')}>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[140px] text-muted-foreground">Metric</TableHead>
              {tickers.map((ticker) => (
                <TableHead key={ticker} className="text-center text-muted-foreground">
                  {ticker}
                </TableHead>
              ))}
              {layout === 'table' && (
                <TableHead className="text-center text-muted-foreground w-[80px]">
                  Best
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const values = stocks.map((s) => getNestedValue(s, metric.path));
              const winnerIdx = findWinner(values, metric.higherIsBetter);

              return (
                <TableRow key={metric.key} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  {values.map((value, idx) => (
                    <TableCell
                      key={tickers[idx]}
                      className={cn(
                        'text-center font-mono',
                        winnerIdx === idx && 'text-green-600 font-semibold'
                      )}
                    >
                      {value !== null ? metric.format(value) : '-'}
                      {winnerIdx === idx && layout === 'side-by-side' && (
                        <Trophy className="inline-block ml-1 h-3 w-3 text-amber-500" />
                      )}
                    </TableCell>
                  ))}
                  {layout === 'table' && (
                    <TableCell className="text-center">
                      {winnerIdx !== null && (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                          <Trophy className="h-3 w-3 text-amber-500" />
                          {tickers[winnerIdx]}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
});
