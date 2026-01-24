'use client';

import { memo } from 'react';
import { SectionCard } from '@/components/dashboard/sections/section-card';
import { cn } from '@/lib/utils';
import type { ValuationDeepDive } from '@recon/shared';

interface PeerComparisonSectionProps {
  data: ValuationDeepDive;
}

function PeerComparisonSectionComponent({ data }: PeerComparisonSectionProps) {
  const { sectorContext, historicalContext } = data;

  if (!sectorContext) {
    return (
      <SectionCard title="Sector Comparison">
        <p className="text-sm text-muted-foreground">
          Peer comparison data not available for this stock.
        </p>
      </SectionCard>
    );
  }

  const currentPE = historicalContext?.currentPE;
  const { peerMedianPE, percentile, peers } = sectorContext;

  const sortedPeers = [...peers].sort((a, b) => {
    if (a.pe === null) return 1;
    if (b.pe === null) return -1;
    return (a.pe as number) - (b.pe as number);
  });

  return (
    <SectionCard title="Sector Comparison">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Your P/E
            </div>
            <div className="text-lg font-bold font-mono">
              {currentPE ? `${currentPE.toFixed(1)}x` : 'N/A'}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Peer Median
            </div>
            <div className="text-lg font-bold font-mono">
              {peerMedianPE.toFixed(1)}x
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center md:col-span-1 col-span-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Percentile
            </div>
            <div className={cn(
              'text-lg font-bold font-mono',
              percentile <= 30 && 'text-success',
              percentile > 30 && percentile <= 70 && 'text-warning',
              percentile > 70 && 'text-destructive'
            )}>
              {percentile.toFixed(0)}th
            </div>
            <div className="text-xs text-muted-foreground">
              {percentile <= 30 ? 'Cheaper than most peers' : percentile > 70 ? 'More expensive than most peers' : 'Similar to peers'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Peer P/E Comparison ({peers.length} peers)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Ticker
                  </th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Company
                  </th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    P/E
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 bg-primary/5">
                  <td className="py-2 px-3 font-mono font-bold">{data.ticker}</td>
                  <td className="py-2 px-3 text-muted-foreground truncate max-w-[200px]">
                    {data.companyName}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    {currentPE ? `${currentPE.toFixed(1)}x` : 'N/A'}
                  </td>
                </tr>
                {sortedPeers.map((peer) => (
                  <tr key={peer.ticker} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-mono">{peer.ticker}</td>
                    <td className="py-2 px-3 text-muted-foreground truncate max-w-[200px]">
                      {peer.name}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {peer.pe !== null ? `${peer.pe.toFixed(1)}x` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export const PeerComparisonSection = memo(PeerComparisonSectionComponent);
