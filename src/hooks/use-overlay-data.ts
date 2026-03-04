import { useQuery } from '@tanstack/react-query';
import {
  fetchIncomeStatements,
  fetchCashFlowStatements,
  type IncomeStatementPeriod,
  type CashFlowPeriod,
} from '@/lib/api';

const OVERLAY_STALE_TIME = 5 * 60 * 1000;
const ANNUAL_LIMIT = 10;

export interface OverlayDataPoint {
  fiscalYear: number;
  periodEnd: string;
  label: string;
  revenue: number;
  netIncome: number;
  freeCashFlow: number;
  epsDiluted: number;
}

export interface OverlayData {
  points: OverlayDataPoint[];
  ticker: string;
}

function joinByFiscalYear(
  income: IncomeStatementPeriod[],
  cashFlow: CashFlowPeriod[]
): OverlayDataPoint[] {
  const cfByYear = new Map<number, CashFlowPeriod>();
  for (const cf of cashFlow) {
    cfByYear.set(cf.fiscalYear, cf);
  }

  return income
    .map((inc) => {
      const cf = cfByYear.get(inc.fiscalYear);
      return {
        fiscalYear: inc.fiscalYear,
        periodEnd: inc.periodEnd,
        label: `FY${inc.fiscalYear}`,
        revenue: inc.revenue,
        netIncome: inc.netIncome,
        freeCashFlow: cf?.freeCashFlow ?? 0,
        epsDiluted: inc.epsDiluted,
      };
    })
    .sort((a, b) => a.fiscalYear - b.fiscalYear);
}

async function fetchOverlayData(ticker: string): Promise<OverlayData> {
  const [incomeRes, cashFlowRes] = await Promise.all([
    fetchIncomeStatements(ticker, { period: 'annual', limit: ANNUAL_LIMIT }),
    fetchCashFlowStatements(ticker, { period: 'annual', limit: ANNUAL_LIMIT }),
  ]);

  const points = joinByFiscalYear(incomeRes.periods, cashFlowRes.periods);

  return { points, ticker: ticker.toUpperCase() };
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
