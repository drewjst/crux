'use client';

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RankingResult } from '@recon/shared';

interface RankingSummaryProps {
  rankings: RankingResult[];
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
  2: 'bg-gray-200/50 border-gray-400/30 text-gray-700',
  3: 'bg-orange-400/10 border-orange-400/30 text-orange-700',
  4: 'bg-muted border-border text-muted-foreground',
};

export const RankingSummary = memo(function RankingSummary({ rankings }: RankingSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase text-primary font-semibold tracking-widest flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Overall Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'grid gap-3',
            rankings.length === 2 && 'grid-cols-2',
            rankings.length === 3 && 'grid-cols-3',
            rankings.length === 4 && 'grid-cols-2 md:grid-cols-4'
          )}
        >
          {rankings.map((result) => (
            <div
              key={result.ticker}
              className={cn(
                'p-4 rounded-lg border text-center transition-all',
                RANK_STYLES[result.rank] || RANK_STYLES[4]
              )}
            >
              <div className="text-2xl font-bold mb-1">#{result.rank}</div>
              <div className="font-semibold">{result.ticker}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {result.wins} metric {result.wins === 1 ? 'win' : 'wins'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
