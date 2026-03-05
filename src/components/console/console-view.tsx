'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useConsoleStocks } from '@/hooks/use-console-stocks';
import type { SectorStock } from '@/lib/api';
import { LeftPanel } from './left-panel';
import { RightPanel } from './right-panel';

export type SortField = 'ticker' | 'price' | 'pe' | 'roic' | 'ytdChange' | 'from52wHigh' | 'rsRank';
export type SortDir = 'asc' | 'desc';
export type RightTab = 'chart' | 'overlay' | 'valuation' | 'ai';

const CAP_FILTERS: Record<string, [number, number]> = {
  mega: [200e9, Infinity],
  large: [10e9, 200e9],
  mid: [2e9, 10e9],
  small: [0, 2e9],
};

function filterAndSort(
  stocks: SectorStock[],
  sector: string,
  capFilter: string,
  sortBy: SortField,
  sortDir: SortDir,
): SectorStock[] {
  let filtered = stocks;

  if (sector && sector !== 'all') {
    // Sector filtering would require sector info on stock - skip for now
    // The API groups by sector but SectorStock doesn't carry its sector name
  }

  if (capFilter && capFilter !== 'all') {
    const range = CAP_FILTERS[capFilter];
    if (range) {
      filtered = filtered.filter(
        (s) => s.marketCap >= range[0] && s.marketCap < range[1]
      );
    }
  }

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc'
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });

  return sorted;
}

const VALID_TABS: RightTab[] = ['chart', 'overlay', 'valuation', 'ai'];
const VALID_CAPS = ['all', 'mega', 'large', 'mid', 'small'];

export function ConsoleView() {
  const { data, isLoading, error } = useConsoleStocks();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params
  const [selectedTicker, setSelectedTicker] = useState<string>(
    () => searchParams.get('ticker')?.toUpperCase() ?? ''
  );
  const [rightTab, setRightTab] = useState<RightTab>(() => {
    const t = searchParams.get('tab') as RightTab;
    return VALID_TABS.includes(t) ? t : 'chart';
  });
  const [sector, setSector] = useState(
    () => searchParams.get('sector') ?? 'all'
  );
  const [capFilter, setCapFilter] = useState(() => {
    const c = searchParams.get('cap') ?? 'all';
    return VALID_CAPS.includes(c) ? c : 'all';
  });
  const [sortBy, setSortBy] = useState<SortField>('rsRank');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const tableRef = useRef<HTMLDivElement>(null);

  // Sync state → URL (replaceState to avoid history pollution)
  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(params)) {
        if (!v || v === 'all' || (k === 'tab' && v === 'chart')) {
          sp.delete(k);
        } else {
          sp.set(k, v);
        }
      }
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const stocks = useMemo(() => {
    if (!data?.stocks) return [];
    return filterAndSort(data.stocks, sector, capFilter, sortBy, sortDir);
  }, [data?.stocks, sector, capFilter, sortBy, sortDir]);

  // The selected stock from the table (may be null if ticker came from search)
  const tableStock = useMemo(() => {
    if (!stocks.length) return null;
    return stocks.find((s) => s.ticker === selectedTicker) ?? null;
  }, [stocks, selectedTicker]);

  // Auto-select first stock when data loads and nothing is selected yet
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (stocks.length > 0 && !selectedTicker && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      setSelectedTicker(stocks[0].ticker);
    }
  }, [stocks, selectedTicker]);

  function handleSelectTicker(ticker: string) {
    setSelectedTicker(ticker);
    updateUrl({ ticker });

    // Scroll to the row if it exists in the table
    if (tableRef.current) {
      const row = tableRef.current.querySelector(`[data-ticker="${ticker}"]`);
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function handleTabChange(tab: RightTab) {
    setRightTab(tab);
    updateUrl({ tab });
  }

  function handleSectorChange(s: string) {
    setSector(s);
    updateUrl({ sector: s });
  }

  function handleCapFilterChange(c: string) {
    setCapFilter(c);
    updateUrl({ cap: c });
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0f]">
        <p className="font-mono text-sm text-red-400">Failed to load console data.</p>
      </div>
    );
  }

  const leftPanelProps = {
    stocks,
    summary: data?.summary ?? null,
    sectors: data?.sectors ?? [],
    selectedTicker,
    onSelectTicker: handleSelectTicker,
    sector,
    onSectorChange: handleSectorChange,
    capFilter,
    onCapFilterChange: handleCapFilterChange,
    sortBy,
    sortDir,
    onSort: handleSort,
    isLoading,
    tableRef,
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#0a0a0f] text-zinc-300">
      {/* Desktop: side-by-side resizable panels */}
      <div className="hidden lg:block h-full">
        <Group orientation="horizontal" style={{ height: '100%' }}>
          <Panel id="left" defaultSize={520} minSize={400} maxSize={650}>
            <LeftPanel {...leftPanelProps} />
          </Panel>
          <Separator
            className="w-1 bg-zinc-800 hover:bg-orange-500/40 transition-colors cursor-col-resize"
          />
          <Panel id="right">
            <RightPanel
              stock={tableStock}
              selectedTicker={selectedTicker}
              tab={rightTab}
              onTabChange={handleTabChange}
              isLoading={isLoading}
            />
          </Panel>
        </Group>
      </div>

      {/* Tablet: stacked vertically */}
      <div className="hidden md:block lg:hidden h-full overflow-auto">
        <div className="h-[55vh]">
          <LeftPanel {...leftPanelProps} />
        </div>
        <div className="border-t border-zinc-800">
          <RightPanel
            stock={tableStock}
            selectedTicker={selectedTicker}
            tab={rightTab}
            onTabChange={handleTabChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Mobile: full-width list only */}
      <div className="block md:hidden h-full">
        <LeftPanel {...leftPanelProps} isMobile />
      </div>
    </div>
  );
}
