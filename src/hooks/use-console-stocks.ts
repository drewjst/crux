import { useQuery } from '@tanstack/react-query';
import { fetchScreener, fetchScreenerFilterOptions } from '@/lib/api';
import type { ScreenerStock } from '@/lib/api';

const CONSOLE_STALE_TIME = 2 * 60 * 1000;

export interface ConsoleSummary {
  avgPe: number | null;
  avgPs: number | null;
  avgRoic: number | null;
  medianPe: number | null;
  totalMarketCap: number | null;
  stockCount: number;
}

export interface ConsoleData {
  stocks: ScreenerStock[];
  summary: ConsoleSummary;
  sectors: string[];
  total: number;
}

async function fetchConsoleStocks(
  sector: string,
  sort: string,
  order: 'asc' | 'desc',
  capFilter: string,
): Promise<ConsoleData> {
  // Fetch stocks and sector list in parallel (2 requests total)
  const capRange = CAP_RANGES[capFilter];

  const [screenerResult, filterOptions] = await Promise.all([
    fetchScreener({
      sectors: sector !== 'all' ? [sector] : undefined,
      marketCapMin: capRange?.[0],
      marketCapMax: capRange?.[1],
      sort,
      order,
      limit: 50,
    }),
    fetchScreenerFilterOptions(),
  ]);

  const summary = aggregateSummary(screenerResult.stocks);
  const sectors = filterOptions.sectors ?? [];

  return {
    stocks: screenerResult.stocks,
    summary,
    sectors,
    total: screenerResult.total,
  };
}

const CAP_RANGES: Record<string, [number, number] | undefined> = {
  all: undefined,
  mega: [200e9, 100e12],
  large: [10e9, 200e9],
  mid: [2e9, 10e9],
  small: [0, 2e9],
};

function aggregateSummary(stocks: ScreenerStock[]): ConsoleSummary {
  const peValues = stocks.map((s) => s.pe).filter((v): v is number => v !== null);
  const psValues = stocks.map((s) => s.ps).filter((v): v is number => v !== null);
  const roicValues = stocks.map((s) => s.roic).filter((v): v is number => v !== null);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const median = (arr: number[]) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    avgPe: avg(peValues),
    avgPs: avg(psValues),
    avgRoic: avg(roicValues),
    medianPe: median(peValues),
    totalMarketCap: stocks.reduce((sum, s) => sum + (s.marketCap ?? 0), 0),
    stockCount: stocks.length,
  };
}

export function useConsoleStocks(
  sector: string,
  sort: string,
  order: 'asc' | 'desc',
  capFilter: string,
) {
  return useQuery<ConsoleData>({
    queryKey: ['console-stocks', sector, sort, order, capFilter],
    queryFn: () => fetchConsoleStocks(sector, sort, order, capFilter),
    staleTime: CONSOLE_STALE_TIME,
    retry: 2,
  });
}
