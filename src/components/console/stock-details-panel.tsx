'use client';

import { useStock } from '@/hooks/use-stock';
import { formatMarketCap, formatPercent } from '@/lib/utils';

interface StockDetailsPanelProps {
  ticker: string;
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-mono ${color ?? 'text-zinc-200'}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-3 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{title}</span>
    </div>
  );
}

function fmtNum(value: number | undefined | null, decimals = 1, suffix = ''): string {
  if (value == null) return '—';
  return `${value.toFixed(decimals)}${suffix}`;
}

function fmtPct(value: number | undefined | null, decimals = 1): string {
  if (value == null) return '—';
  return formatPercent(value, decimals);
}

function fmtPrice(value: number | undefined | null): string {
  if (value == null) return '—';
  return `$${value.toFixed(2)}`;
}

function pctColor(value: number | undefined | null): string {
  if (value == null) return 'text-zinc-400';
  return value >= 0 ? 'text-emerald-400' : 'text-red-400';
}

export function StockDetailsPanel({ ticker }: StockDetailsPanelProps) {
  const { data: stock, isLoading } = useStock(ticker);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-[10px] text-zinc-600 font-mono">No data</span>
      </div>
    );
  }

  const { quote, valuation, financials, analystEstimates, performance, growth, earningsQuality } = stock;

  return (
    <div className="h-full overflow-y-auto px-3 py-2 bg-[#0a0a0f] border-l border-zinc-800/60">
      {/* Quote */}
      <SectionHeader title="Quote" />
      <MetricRow label="Price" value={fmtPrice(quote.price)} />
      <MetricRow label="Change" value={fmtPct(quote.changePercent)} color={pctColor(quote.changePercent)} />
      <MetricRow label="Volume" value={quote.volume ? `${(quote.volume / 1e6).toFixed(1)}M` : '—'} />
      <MetricRow label="Mkt Cap" value={formatMarketCap(quote.marketCap)} />
      <MetricRow label="52W High" value={fmtPrice(quote.fiftyTwoWeekHigh)} />
      <MetricRow label="52W Low" value={fmtPrice(quote.fiftyTwoWeekLow)} />

      {/* Performance */}
      <SectionHeader title="Performance" />
      <MetricRow label="YTD" value={fmtPct(performance.ytdChange)} color={pctColor(performance.ytdChange)} />
      <MetricRow label="1 Month" value={fmtPct(performance.month1Change)} color={pctColor(performance.month1Change)} />
      <MetricRow label="1 Year" value={fmtPct(performance.year1Change)} color={pctColor(performance.year1Change)} />

      {/* Valuation */}
      {valuation && (
        <>
          <SectionHeader title="Valuation" />
          <MetricRow label="P/E" value={fmtNum(valuation.pe.value)} />
          <MetricRow label="Fwd P/E" value={fmtNum(valuation.forwardPe.value)} />
          <MetricRow label="P/S (NTM)" value={fmtNum(valuation.ntmPs.value)} />
          <MetricRow label="EV/EBITDA" value={fmtNum(valuation.evToEbitda.value)} />
          <MetricRow label="PEG" value={fmtNum(valuation.peg.value)} />
        </>
      )}

      {/* Financials */}
      {financials && (
        <>
          <SectionHeader title="Financials" />
          <MetricRow label="Rev Growth" value={fmtPct(financials.revenueGrowthYoY)} color={pctColor(financials.revenueGrowthYoY)} />
          <MetricRow label="Gross Margin" value={fmtPct(financials.grossMargin)} />
          <MetricRow label="Op Margin" value={fmtPct(financials.operatingMargin)} />
          <MetricRow label="Net Margin" value={fmtPct(financials.netMargin)} />
          <MetricRow label="ROIC" value={fmtPct(financials.roic)} />
          <MetricRow label="ROE" value={fmtPct(financials.roe)} />
        </>
      )}

      {/* Growth */}
      {growth && (
        <>
          <SectionHeader title="Growth" />
          <MetricRow label="Rev YoY" value={fmtPct(growth.revenueGrowthYoY?.value)} color={pctColor(growth.revenueGrowthYoY?.value)} />
          <MetricRow label="EPS YoY" value={fmtPct(growth.epsGrowthYoY?.value)} color={pctColor(growth.epsGrowthYoY?.value)} />
        </>
      )}

      {/* Earnings Quality */}
      {earningsQuality && (
        <>
          <SectionHeader title="Earnings Quality" />
          <MetricRow label="Accrual Ratio" value={fmtNum(earningsQuality.accrualRatio?.value, 2)} />
        </>
      )}

      {/* Analyst Estimates */}
      {analystEstimates && (
        <>
          <SectionHeader title="Analyst Estimates" />
          <MetricRow label="Rating" value={analystEstimates.rating} />
          <MetricRow label="Analysts" value={String(analystEstimates.analystCount)} />
          <MetricRow label="Target Avg" value={fmtPrice(analystEstimates.priceTargetAverage)} />
          <MetricRow label="Target High" value={fmtPrice(analystEstimates.priceTargetHigh)} />
          <MetricRow label="Target Low" value={fmtPrice(analystEstimates.priceTargetLow)} />
          <MetricRow label="EPS Est (CY)" value={fmtNum(analystEstimates.epsEstimateCurrentYear, 2)} />
          <MetricRow label="EPS Est (NY)" value={fmtNum(analystEstimates.epsEstimateNextYear, 2)} />
          <MetricRow
            label="EPS Growth"
            value={fmtPct(analystEstimates.epsGrowthNextYear)}
            color={pctColor(analystEstimates.epsGrowthNextYear)}
          />
        </>
      )}
    </div>
  );
}
