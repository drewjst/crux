'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { SectorStock } from '@/lib/api';
import { formatPercent, formatMarketCap } from '@/lib/utils';
import type { RightTab } from './console-view';

interface RightPanelProps {
  stock: SectorStock | null;
  tab: RightTab;
  onTabChange: (tab: RightTab) => void;
  isLoading: boolean;
}

const TABS: { id: RightTab; label: string }[] = [
  { id: 'chart', label: 'Chart' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'ai', label: 'AI' },
];

function StockHeader({ stock }: { stock: SectorStock }) {
  const ytdColor = (stock.ytdChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
      <div className="flex items-center gap-3">
        <span className="text-lg font-mono font-bold text-orange-400">{stock.ticker}</span>
        <span className="text-sm text-zinc-400 truncate max-w-48">{stock.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-zinc-200">${stock.price.toFixed(2)}</span>
        <span className={`text-xs font-mono ${ytdColor}`}>
          {stock.ytdChange != null ? formatPercent(stock.ytdChange, 1) : '—'} YTD
        </span>
        <span className="text-xs font-mono text-zinc-500">
          {formatMarketCap(stock.marketCap)}
        </span>
        <Link
          href={`/stock/${stock.ticker}`}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-orange-400 transition-colors"
        >
          Open full page
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b border-zinc-800/80 px-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors relative ${
            activeTab === tab.id
              ? 'text-orange-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute inset-x-0 bottom-0 h-[2px] bg-orange-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, stock }: { tab: RightTab; stock: SectorStock }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm text-zinc-500">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} view for{' '}
          <span className="text-orange-400">{stock.ticker}</span>
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          Coming soon
        </p>
      </div>
    </div>
  );
}

export function RightPanel({ stock, tab, onTabChange, isLoading }: RightPanelProps) {
  if (isLoading || !stock) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0a0f]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      <StockHeader stock={stock} />
      <TabBar activeTab={tab} onTabChange={onTabChange} />
      <TabContent tab={tab} stock={stock} />
    </div>
  );
}
