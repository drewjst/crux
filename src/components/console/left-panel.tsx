'use client';

import { useState, type RefObject } from 'react';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ScreenerStock } from '@/lib/api';
import type { ConsoleSummary } from '@/hooks/use-console-stocks';
import { formatPercent, formatMarketCap } from '@/lib/utils';
import { ConsoleSearch } from './console-search';
import type { SortField, SortDir } from './console-view';

interface LeftPanelProps {
  stocks: ScreenerStock[];
  summary: ConsoleSummary | null;
  sectors: string[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  sector: string;
  onSectorChange: (sector: string) => void;
  capFilter: string;
  onCapFilterChange: (cap: string) => void;
  sortBy: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  isLoading: boolean;
  isMobile?: boolean;
  tableRef?: RefObject<HTMLDivElement | null>;
  total: number;
}

// ---------------------------------------------------------------------------
// Shared accordion section header
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  isOpen,
  onToggle,
  badge,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2 px-3 py-2 border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
    >
      <ChevronRight
        className={`h-3 w-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
      />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </span>
      {badge && (
        <span className="ml-auto text-[10px] font-mono text-zinc-600">{badge}</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tickers section internals
// ---------------------------------------------------------------------------

function SortHeaderButton({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  className = '',
}: {
  label: string;
  field: SortField;
  sortBy: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  const isActive = sortBy === field;
  return (
    <button
      onClick={() => onSort(field)}
      aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
      className={`flex items-center gap-0.5 text-[10px] uppercase tracking-wider transition-colors ${
        isActive ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
      } ${className}`}
    >
      {label}
      {isActive && (
        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );
}

function SummaryBar({ summary }: { summary: ConsoleSummary | null }) {
  if (!summary) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-zinc-800/80 text-[10px]">
      <div className="flex items-center gap-3 text-zinc-400">
        <span>P/E <span className="text-zinc-200 font-mono">{summary.avgPe?.toFixed(1) ?? '—'}</span></span>
        <span>P/S <span className="text-zinc-200 font-mono">{summary.avgPs?.toFixed(1) ?? '—'}</span></span>
        <span>ROIC <span className="text-zinc-200 font-mono">{summary.avgRoic?.toFixed(1) ?? '—'}%</span></span>
      </div>
      <span className="ml-auto text-zinc-500 font-mono">{summary.stockCount} stocks</span>
    </div>
  );
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs font-mono text-zinc-600 text-right">—</span>;
  const color = value >= 0 ? 'text-emerald-400' : 'text-red-400';
  return <span className={`text-xs font-mono text-right ${color}`}>{formatPercent(value, 0)}</span>;
}

function StockRow({
  stock,
  isSelected,
  onSelect,
  isMobile,
}: {
  stock: ScreenerStock;
  isSelected: boolean;
  onSelect: (ticker: string) => void;
  isMobile: boolean;
}) {
  const row = (
    <div
      data-ticker={stock.ticker}
      onClick={() => onSelect(stock.ticker)}
      className={`grid grid-cols-[72px_68px_56px_56px_60px_60px_72px] gap-0 px-3 py-1.5 cursor-pointer border-b border-zinc-800/30 transition-colors ${
        isSelected
          ? 'bg-orange-500/10 border-l-2 border-l-orange-500'
          : 'hover:bg-zinc-800/40 border-l-2 border-l-transparent'
      }`}
    >
      <span className="text-xs font-mono font-medium text-zinc-100 truncate">{stock.ticker}</span>
      <span className="text-xs font-mono text-zinc-300 text-right">
        {stock.price != null ? `$${stock.price.toFixed(2)}` : '—'}
      </span>
      <span className="text-xs font-mono text-zinc-400 text-right">{stock.pe?.toFixed(1) ?? '—'}</span>
      <span className="text-xs font-mono text-zinc-400 text-right">
        {stock.roic != null ? `${stock.roic.toFixed(0)}%` : '—'}
      </span>
      <GrowthBadge value={stock.revenueGrowth} />
      <GrowthBadge value={stock.epsGrowth} />
      <span className="text-xs font-mono text-zinc-400 text-right">
        {stock.marketCap != null ? formatMarketCap(stock.marketCap) : '—'}
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <Link href={`/stock/${stock.ticker}`} className="block">
        {row}
      </Link>
    );
  }

  return row;
}

// ---------------------------------------------------------------------------
// Placeholder sections
// ---------------------------------------------------------------------------

function NewsSection() {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-[10px] text-zinc-600 font-mono">Market news coming soon</p>
    </div>
  );
}

function EconomicCalendarSection() {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-[10px] text-zinc-600 font-mono">Economic calendar coming soon</p>
    </div>
  );
}

function WatchlistSection() {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-[10px] text-zinc-600 font-mono">Watchlist coming soon</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main left panel
// ---------------------------------------------------------------------------

export function LeftPanel({
  stocks,
  summary,
  sectors,
  selectedTicker,
  onSelectTicker,
  sector,
  onSectorChange,
  capFilter,
  onCapFilterChange,
  sortBy,
  sortDir,
  onSort,
  isLoading,
  isMobile = false,
  tableRef,
  total,
}: LeftPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tickers: true,
    news: false,
    calendar: false,
    watchlist: false,
  });

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* Search + filters — always visible */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/80">
        <ConsoleSearch onSelect={onSelectTicker} />
        <select
          value={sector}
          onChange={(e) => onSectorChange(e.target.value)}
          className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-orange-500/50 cursor-pointer"
        >
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={capFilter}
          onChange={(e) => onCapFilterChange(e.target.value)}
          className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-orange-500/50 cursor-pointer"
        >
          <option value="all">All caps</option>
          <option value="mega">Mega</option>
          <option value="large">Large</option>
          <option value="mid">Mid</option>
          <option value="small">Small</option>
        </select>
      </div>

      {/* Scrollable accordion sections */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Tickers ── */}
        <SectionHeader
          title="Tickers"
          isOpen={openSections.tickers}
          onToggle={() => toggleSection('tickers')}
          badge={`${stocks.length} of ${total}`}
        />
        {openSections.tickers && (
          <div>
            <SummaryBar summary={summary} />
            <div className="grid grid-cols-[72px_68px_56px_56px_60px_60px_72px] gap-0 px-3 py-1.5 border-b border-zinc-800/60">
              <SortHeaderButton label="Ticker" field="ticker" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeaderButton label="Price" field="price" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
              <SortHeaderButton label="P/E" field="pe" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
              <SortHeaderButton label="ROIC" field="roic" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
              <SortHeaderButton label="Rev Gr" field="revenueGrowth" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
              <SortHeaderButton label="EPS Gr" field="epsGrowth" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
              <SortHeaderButton label="Mkt Cap" field="marketCap" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
            </div>
            <div ref={tableRef}>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
                </div>
              ) : stocks.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="font-mono text-xs text-zinc-600">No stocks match filters</p>
                </div>
              ) : (
                stocks.map((stock) => (
                  <StockRow
                    key={stock.ticker}
                    stock={stock}
                    isSelected={stock.ticker === selectedTicker}
                    onSelect={onSelectTicker}
                    isMobile={isMobile}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── News ── */}
        <SectionHeader
          title="News"
          isOpen={openSections.news}
          onToggle={() => toggleSection('news')}
        />
        {openSections.news && <NewsSection />}

        {/* ── Economic Calendar ── */}
        <SectionHeader
          title="Economic Calendar"
          isOpen={openSections.calendar}
          onToggle={() => toggleSection('calendar')}
        />
        {openSections.calendar && <EconomicCalendarSection />}

        {/* ── Watchlist ── */}
        <SectionHeader
          title="Watchlist"
          isOpen={openSections.watchlist}
          onToggle={() => toggleSection('watchlist')}
        />
        {openSections.watchlist && <WatchlistSection />}
      </div>
    </div>
  );
}
