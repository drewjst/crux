import type { SectorSummary } from '@/lib/api';
import { formatMarketCap } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SummaryBarProps {
  summary: SectorSummary;
  stockCount: number;
}

function formatPct(value: number | null): string {
  if (value == null) return '--';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function pctColor(value: number | null): string {
  if (value == null) return 'text-muted-foreground';
  if (value > 0) return 'text-positive';
  if (value < 0) return 'text-negative';
  return 'text-muted-foreground';
}

function BreadthBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ?? 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-8 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 60 ? 'bg-positive' : pct >= 40 ? 'bg-yellow-500' : 'bg-negative'
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="tabular-nums font-medium w-9 text-right">
        {value != null ? `${Math.round(pct)}%` : '--'}
      </span>
    </div>
  );
}

function StatCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card px-4 py-3', className)}>
      {children}
    </div>
  );
}

function StatItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={cn('text-sm font-semibold tabular-nums mt-0.5', className)}>{value}</div>
    </div>
  );
}

export function SummaryBar({ summary, stockCount }: SummaryBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Overview */}
      <StatCard>
        <div className="flex items-baseline justify-between gap-4">
          <StatItem label="Stocks" value={stockCount.toString()} />
          <StatItem
            label="Total Mkt Cap"
            value={summary.totalMarketCap != null ? formatMarketCap(summary.totalMarketCap) : '--'}
          />
        </div>
      </StatCard>

      {/* Valuation */}
      <StatCard>
        <div className="flex items-baseline justify-between gap-4">
          <StatItem
            label="Med P/S"
            value={summary.medianPs != null ? summary.medianPs.toFixed(1) + 'x' : '--'}
          />
          <StatItem
            label="Med P/E"
            value={summary.medianPe != null ? summary.medianPe.toFixed(1) + 'x' : '--'}
          />
          <StatItem
            label="ROIC"
            value={summary.avgRoic != null ? summary.avgRoic.toFixed(1) + '%' : '--'}
          />
        </div>
      </StatCard>

      {/* Performance */}
      <StatCard>
        <div className="flex items-baseline justify-between gap-4">
          <StatItem label="1M" value={formatPct(summary.median1m)} className={pctColor(summary.median1m)} />
          <StatItem label="YTD" value={formatPct(summary.medianYtd)} className={pctColor(summary.medianYtd)} />
          <StatItem label="1Y" value={formatPct(summary.median1y)} className={pctColor(summary.median1y)} />
          <StatItem
            label="52W Hi"
            value={formatPct(summary.medianFrom52wHigh)}
            className={pctColor(summary.medianFrom52wHigh)}
          />
        </div>
      </StatCard>

      {/* SMA Breadth */}
      <StatCard>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5">Breadth</div>
        <div className="space-y-1.5">
          <BreadthBar label="20d" value={summary.pctAboveSma20} />
          <BreadthBar label="50d" value={summary.pctAboveSma50} />
          <BreadthBar label="200d" value={summary.pctAboveSma200} />
        </div>
      </StatCard>
    </div>
  );
}
