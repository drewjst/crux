'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useValuation } from '@/hooks/use-valuation';
import { ValuationHeroSection } from '@/components/valuation/valuation-hero-section';
import { KeyMetricsSection } from '@/components/valuation/key-metrics-section';
import { GrowthJustificationSection } from '@/components/valuation/growth-justification-section';
import { HistoricalChartSection } from '@/components/valuation/historical-chart-section';
import { PeerComparisonSection } from '@/components/valuation/peer-comparison-section';
import { DCFSection } from '@/components/valuation/dcf-section';
import { ScenariosSection } from './scenarios-section';

type ValuationSubTab = 'overview' | 'historical' | 'peers' | 'scenarios' | 'dcf';

const SUB_TABS: { id: ValuationSubTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'historical', label: 'Historical' },
  { id: 'peers', label: 'Peers' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'dcf', label: 'DCF' },
];

interface ValuationTabProps {
  ticker: string;
}

export function ValuationTab({ ticker }: ValuationTabProps) {
  const [subTab, setSubTab] = useState<ValuationSubTab>('overview');
  const { data, isLoading, error } = useValuation(ticker);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
          <span className="font-mono text-[10px] text-zinc-600">Loading valuation...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs text-zinc-600">
          {error ? 'Failed to load valuation data.' : 'No valuation data available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4">
        <div className="flex items-center gap-0">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-2 text-[11px] font-mono tracking-wider transition-colors relative ${
                subTab === tab.id
                  ? 'text-orange-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {subTab === tab.id && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <Link
          href={`/stock/${ticker}/valuation`}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-orange-400 transition-colors"
        >
          Open full valuation
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Sub-tab content — wrap existing components with console theme override */}
      <div className="flex-1 overflow-y-auto console-theme-override">
        <SubTabContent subTab={subTab} data={data} />
      </div>
    </div>
  );
}

function SubTabContent({ subTab, data }: { subTab: ValuationSubTab; data: NonNullable<ReturnType<typeof useValuation>['data']> }) {
  switch (subTab) {
    case 'overview':
      return (
        <div className="space-y-4 p-4">
          <ValuationHeroSection data={data} />
          <KeyMetricsSection data={data} />
          <GrowthJustificationSection data={data} />
        </div>
      );
    case 'historical':
      return (
        <div className="p-4">
          <HistoricalChartSection data={data} />
        </div>
      );
    case 'peers':
      return (
        <div className="p-4">
          <PeerComparisonSection data={data} />
        </div>
      );
    case 'scenarios':
      return <ScenariosSection data={data} />;
    case 'dcf':
      return (
        <div className="p-4">
          <DCFSection data={data} />
        </div>
      );
  }
}
