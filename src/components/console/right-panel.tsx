'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { SectorStock } from '@/lib/api';
import { useStock } from '@/hooks/use-stock';
import { formatPercent, formatMarketCap } from '@/lib/utils';
import type { RightTab } from './console-view';
import { TradingViewChart } from './tradingview-chart';
import { OverlayChart } from './overlay-chart';

interface RightPanelProps {
  /** Stock from the sector table (null if ticker came from search and isn't in table) */
  stock: SectorStock | null;
  /** The currently selected ticker — always set when a stock is selected */
  selectedTicker: string;
  tab: RightTab;
  onTabChange: (tab: RightTab) => void;
  isLoading: boolean;
}

/** Normalized shape used by the header — works for both SectorStock and StockDetailResponse */
interface StockHeaderData {
  ticker: string;
  name: string;
  price: number;
  ytdChange: number | null;
  marketCap: number;
}

const TABS: { id: RightTab; label: string }[] = [
  { id: 'chart', label: 'Chart' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'ai', label: 'AI' },
];

function StockHeader({ stock }: { stock: StockHeaderData }) {
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

function PlaceholderTab({ label, ticker }: { label: string; ticker: string }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-sm text-zinc-500">
          {label} view for <span className="text-orange-400">{ticker}</span>
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-600">Coming soon</p>
      </div>
    </div>
  );
}

function TabContent({ tab, ticker }: { tab: RightTab; ticker: string }) {
  if (tab === 'chart') {
    return (
      <div className="flex-1 min-h-0">
        <TradingViewChart symbol={ticker} />
      </div>
    );
  }

  if (tab === 'overlay') {
    return (
      <div className="flex-1 min-h-0">
        <OverlayChart ticker={ticker} />
      </div>
    );
  }

  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
  return <PlaceholderTab label={label} ticker={ticker} />;
}

function normalizeFromTable(stock: SectorStock): StockHeaderData {
  return {
    ticker: stock.ticker,
    name: stock.name,
    price: stock.price,
    ytdChange: stock.ytdChange,
    marketCap: stock.marketCap,
  };
}

export function RightPanel({ stock, selectedTicker, tab, onTabChange, isLoading }: RightPanelProps) {
  // Fetch independently when the ticker isn't in the sector table
  const shouldFetch = !stock && Boolean(selectedTicker);
  const { data: fetchedStock, isLoading: isFetching } = useStock(
    shouldFetch ? selectedTicker : ''
  );

  const headerData: StockHeaderData | null = stock
    ? normalizeFromTable(stock)
    : fetchedStock
      ? {
          ticker: fetchedStock.company.ticker,
          name: fetchedStock.company.name,
          price: fetchedStock.quote.price,
          ytdChange: fetchedStock.performance.ytdChange,
          marketCap: fetchedStock.quote.marketCap,
        }
      : null;

  const showLoading = isLoading || (shouldFetch && isFetching);

  if (showLoading || !headerData) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0a0f]">
        {shouldFetch && isFetching ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
            <span className="font-mono text-[10px] text-zinc-600">Loading {selectedTicker}...</span>
          </div>
        ) : (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      <StockHeader stock={headerData} />
      <TabBar activeTab={tab} onTabChange={onTabChange} />
      <TabContent tab={tab} ticker={headerData.ticker} />
    </div>
  );
}
