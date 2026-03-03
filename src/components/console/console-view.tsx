'use client';

import { useState, useMemo } from 'react';
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
  search: string
): SectorStock[] {
  let filtered = stocks;

  if (search) {
    const q = search.toUpperCase();
    filtered = filtered.filter(
      (s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q)
    );
  }

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

export function ConsoleView() {
  const { data, isLoading, error } = useConsoleStocks();

  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [rightTab, setRightTab] = useState<RightTab>('chart');
  const [sector, setSector] = useState('all');
  const [capFilter, setCapFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortField>('rsRank');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const stocks = useMemo(() => {
    if (!data?.stocks) return [];
    return filterAndSort(data.stocks, sector, capFilter, sortBy, sortDir, search);
  }, [data?.stocks, sector, capFilter, sortBy, sortDir, search]);

  const selectedStock = useMemo(() => {
    if (!stocks.length) return null;
    const found = stocks.find((s) => s.ticker === selectedTicker);
    return found ?? stocks[0];
  }, [stocks, selectedTicker]);

  // Auto-select first stock when data loads
  if (selectedStock && !selectedTicker) {
    setSelectedTicker(selectedStock.ticker);
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

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#0a0a0f] text-zinc-300">
      {/* Desktop: side-by-side resizable panels */}
      <div className="hidden lg:block h-full">
        <Group orientation="horizontal" style={{ height: '100%' }}>
          <Panel id="left" defaultSize={520} minSize={400} maxSize={650}>
            <LeftPanel
              stocks={stocks}
              summary={data?.summary ?? null}
              sectors={data?.sectors ?? []}
              selectedTicker={selectedStock?.ticker ?? ''}
              onSelectTicker={setSelectedTicker}
              sector={sector}
              onSectorChange={setSector}
              capFilter={capFilter}
              onCapFilterChange={setCapFilter}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              search={search}
              onSearchChange={setSearch}
              isLoading={isLoading}
            />
          </Panel>
          <Separator
            className="w-1 bg-zinc-800 hover:bg-orange-500/40 transition-colors cursor-col-resize"
          />
          <Panel id="right">
            <RightPanel
              stock={selectedStock}
              tab={rightTab}
              onTabChange={setRightTab}
              isLoading={isLoading}
            />
          </Panel>
        </Group>
      </div>

      {/* Tablet: stacked vertically */}
      <div className="hidden md:block lg:hidden h-full overflow-auto">
        <div className="h-[55vh]">
          <LeftPanel
            stocks={stocks}
            summary={data?.summary ?? null}
            sectors={data?.sectors ?? []}
            selectedTicker={selectedStock?.ticker ?? ''}
            onSelectTicker={setSelectedTicker}
            sector={sector}
            onSectorChange={setSector}
            capFilter={capFilter}
            onCapFilterChange={setCapFilter}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            search={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
          />
        </div>
        <div className="border-t border-zinc-800">
          <RightPanel
            stock={selectedStock}
            tab={rightTab}
            onTabChange={setRightTab}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Mobile: full-width list only */}
      <div className="block md:hidden h-full">
        <LeftPanel
          stocks={stocks}
          summary={data?.summary ?? null}
          sectors={data?.sectors ?? []}
          selectedTicker={selectedStock?.ticker ?? ''}
          onSelectTicker={setSelectedTicker}
          sector={sector}
          onSectorChange={setSector}
          capFilter={capFilter}
          onCapFilterChange={setCapFilter}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          search={search}
          onSearchChange={setSearch}
          isLoading={isLoading}
          isMobile
        />
      </div>
    </div>
  );
}
