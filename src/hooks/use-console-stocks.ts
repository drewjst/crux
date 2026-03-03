import { useQuery } from '@tanstack/react-query';
import { fetchSectors, fetchSectorOverview } from '@/lib/api';
import type { SectorStock, SectorSummary } from '@/lib/api';

const CONSOLE_STALE_TIME = 2 * 60 * 1000;

export interface ConsoleData {
  stocks: SectorStock[];
  summary: SectorSummary;
  sectors: string[];
}

async function fetchConsoleStocks(): Promise<ConsoleData> {
  const { sectors } = await fetchSectors();

  const overviews = await Promise.all(
    sectors.map((sector) => fetchSectorOverview(sector, '52whigh', 100))
  );

  const allStocks: SectorStock[] = [];
  const seen = new Set<string>();

  for (const overview of overviews) {
    for (const stock of overview.stocks) {
      if (!seen.has(stock.ticker)) {
        seen.add(stock.ticker);
        allStocks.push(stock);
      }
    }
  }

  const summary = aggregateSummary(allStocks);

  return { stocks: allStocks, summary, sectors };
}

function aggregateSummary(stocks: SectorStock[]): SectorSummary {
  const peValues = stocks.map((s) => s.pe).filter((v): v is number => v !== null);
  const psValues = stocks.map((s) => s.ps).filter((v): v is number => v !== null);
  const roicValues = stocks.map((s) => s.roic).filter((v): v is number => v !== null);
  const ytdValues = stocks.map((s) => s.ytdChange).filter((v): v is number => v !== null);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const median = (arr: number[]) => {
    if (!arr.length) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const sma20Count = stocks.filter((s) => s.sma20 === true).length;
  const sma50Count = stocks.filter((s) => s.sma50 === true).length;
  const sma200Count = stocks.filter((s) => s.sma200 === true).length;
  const total = stocks.length || 1;

  return {
    avgPe: avg(peValues),
    avgPs: avg(psValues),
    avgRoic: avg(roicValues),
    medianPe: median(peValues),
    medianPs: median(psValues),
    medianYtd: median(ytdValues),
    median1y: null,
    median1m: null,
    totalMarketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
    medianFrom52wHigh: null,
    pctAboveSma20: Math.round((sma20Count / total) * 100),
    pctAboveSma50: Math.round((sma50Count / total) * 100),
    pctAboveSma200: Math.round((sma200Count / total) * 100),
  };
}

export function useConsoleStocks() {
  return useQuery<ConsoleData>({
    queryKey: ['console-stocks'],
    queryFn: fetchConsoleStocks,
    staleTime: CONSOLE_STALE_TIME,
    retry: 2,
  });
}
