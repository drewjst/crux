'use client';

import type { RefObject } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { SectorStock, SectorSummary } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import { MiniSparkline } from './mini-sparkline';
import { ConsoleSearch } from './console-search';
import type { SortField, SortDir } from './console-view';

interface LeftPanelProps {
  stocks: SectorStock[];
  summary: SectorSummary | null;
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
}

function SortHeader({
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

function SummaryBar({ summary }: { summary: SectorSummary | null }) {
  if (!summary) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-zinc-800/80 text-[10px]">
      <div className="flex items-center gap-3 text-zinc-400">
        <span>P/E <span className="text-zinc-200 font-mono">{summary.avgPe?.toFixed(1) ?? '—'}</span></span>
        <span>P/S <span className="text-zinc-200 font-mono">{summary.avgPs?.toFixed(1) ?? '—'}</span></span>
        <span>ROIC <span className="text-zinc-200 font-mono">{summary.avgRoic?.toFixed(1) ?? '—'}%</span></span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-zinc-500">
        <BreadthDot label="20d" value={summary.pctAboveSma20} />
        <BreadthDot label="50d" value={summary.pctAboveSma50} />
        <BreadthDot label="200d" value={summary.pctAboveSma200} />
      </div>
    </div>
  );
}

function BreadthDot({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const color = value >= 60 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label} <span className="text-zinc-300 font-mono">{value}%</span>
    </span>
  );
}

function SignalDots({ sma20, sma50, sma200 }: { sma20: boolean | null; sma50: boolean | null; sma200: boolean | null }) {
  if (sma20 === null && sma50 === null && sma200 === null) return null;
  return (
    <span className="flex items-center gap-[2px] ml-0.5">
      {[sma20, sma50, sma200].map((above, i) => (
        <span
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${
            above === null ? 'bg-zinc-700' : above ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
      ))}
    </span>
  );
}

function RsRankBadge({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-xs font-mono text-zinc-400 text-right">—</span>;
  let color = 'text-zinc-400';
  if (rank >= 80) color = 'text-emerald-400';
  else if (rank <= 20) color = 'text-red-400';
  else if (rank >= 60) color = 'text-emerald-400/60';
  else if (rank <= 40) color = 'text-red-400/60';
  return <span className={`text-xs font-mono text-right ${color}`}>{rank}</span>;
}

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
}: LeftPanelProps) {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0f]">
      {/* Search + filters */}
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

      {/* Summary stats */}
      <SummaryBar summary={summary} />

      {/* Table header */}
      <div className="grid grid-cols-[72px_68px_56px_56px_60px_64px_56px_60px] gap-0 px-3 py-1.5 border-b border-zinc-800/60">
        <SortHeader label="Ticker" field="ticker" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
        <SortHeader label="Price" field="price" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <SortHeader label="P/E" field="pe" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <SortHeader label="ROIC" field="roic" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <SortHeader label="YTD" field="ytdChange" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <SortHeader label="% 52W Hi" field="from52wHigh" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <SortHeader label="RS" field="rsRank" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="justify-end" />
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-right">1Y</span>
      </div>

      {/* Stock rows */}
      <div ref={tableRef} className="flex-1 overflow-y-auto">
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

      {/* Footer count */}
      <div className="border-t border-zinc-800/60 px-3 py-1 text-[10px] text-zinc-600 font-mono">
        {stocks.length} stocks
      </div>
    </div>
  );
}

function StockRow({
  stock,
  isSelected,
  onSelect,
  isMobile,
}: {
  stock: SectorStock;
  isSelected: boolean;
  onSelect: (ticker: string) => void;
  isMobile: boolean;
}) {
  const ytdColor = (stock.ytdChange ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
  const from52Color = (stock.from52wHigh ?? 0) >= -10 ? 'text-emerald-400' : 'text-red-400';

  const row = (
    <div
      data-ticker={stock.ticker}
      onClick={() => onSelect(stock.ticker)}
      className={`grid grid-cols-[72px_68px_56px_56px_60px_64px_56px_60px] gap-0 px-3 py-1.5 cursor-pointer border-b border-zinc-800/30 transition-colors ${
        isSelected
          ? 'bg-orange-500/10 border-l-2 border-l-orange-500'
          : 'hover:bg-zinc-800/40 border-l-2 border-l-transparent'
      }`}
    >
      <span className="text-xs font-mono font-medium text-zinc-100 truncate flex items-center gap-1">
        {stock.ticker}
        <SignalDots sma20={stock.sma20} sma50={stock.sma50} sma200={stock.sma200} />
      </span>
      <span className="text-xs font-mono text-zinc-300 text-right">${stock.price.toFixed(2)}</span>
      <span className="text-xs font-mono text-zinc-400 text-right">{stock.pe?.toFixed(1) ?? '—'}</span>
      <span className="text-xs font-mono text-zinc-400 text-right">{stock.roic != null ? `${stock.roic.toFixed(0)}%` : '—'}</span>
      <span className={`text-xs font-mono text-right ${ytdColor}`}>
        {stock.ytdChange != null ? formatPercent(stock.ytdChange, 1) : '—'}
      </span>
      <span className={`text-xs font-mono text-right ${from52Color}`}>
        {stock.from52wHigh != null ? formatPercent(stock.from52wHigh, 1) : '—'}
      </span>
      <RsRankBadge rank={stock.rsRank} />
      <div className="flex items-center justify-end">
        <MiniSparkline data={stock.sparkline} positive={(stock.ytdChange ?? 0) >= 0} />
      </div>
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
