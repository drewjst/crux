import { useQuery } from '@tanstack/react-query';
import { fetchOverlay } from '@/lib/api';

const OVERLAY_STALE_TIME = 5 * 60 * 1000;

export interface OverlayDataPoint {
  fiscalYear: number;
  periodEnd: string;
  label: string;
  revenue: number;
  netIncome: number;
  freeCashFlow: number;
  epsDiluted: number;
  price: number;
}

export interface OverlayData {
  points: OverlayDataPoint[];
  ticker: string;
}

function parseFiscalYear(period: string): number {
  // "FY2024" → 2024, "Q3 2024" → 2024
  const match = period.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
}

async function fetchOverlayData(ticker: string): Promise<OverlayData> {
  const response = await fetchOverlay(ticker);

  const points: OverlayDataPoint[] = response.data.map((d) => ({
    fiscalYear: parseFiscalYear(d.period),
    periodEnd: d.date,
    label: d.period,
    revenue: d.revenue,
    netIncome: d.netIncome,
    freeCashFlow: d.freeCashFlow,
    epsDiluted: d.eps,
    price: d.price,
  }));

  return { points, ticker: response.ticker };
}

export function useOverlayData(ticker: string) {
  return useQuery<OverlayData>({
    queryKey: ['overlay', ticker.toUpperCase()],
    queryFn: () => fetchOverlayData(ticker),
    staleTime: OVERLAY_STALE_TIME,
    enabled: Boolean(ticker),
    retry: 2,
  });
}
