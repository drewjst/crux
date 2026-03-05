'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useOverlayData, type OverlayDataPoint } from '@/hooks/use-overlay-data';
import { formatCompactCurrency } from '@/lib/utils';

interface OverlayChartProps {
  ticker: string;
}

type MetricKey = 'revenue' | 'netIncome' | 'freeCashFlow' | 'epsDiluted';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  defaultOn: boolean;
  formatValue: (v: number) => string;
  yAxisId: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'revenue',
    label: 'Revenue',
    color: '#f97316',
    defaultOn: true,
    formatValue: (v) => formatCompactCurrency(v),
    yAxisId: 'dollars',
  },
  {
    key: 'netIncome',
    label: 'Net Income',
    color: '#8b5cf6',
    defaultOn: true,
    formatValue: (v) => formatCompactCurrency(v),
    yAxisId: 'dollars',
  },
  {
    key: 'freeCashFlow',
    label: 'FCF',
    color: '#3b82f6',
    defaultOn: false,
    formatValue: (v) => formatCompactCurrency(v),
    yAxisId: 'dollars',
  },
  {
    key: 'epsDiluted',
    label: 'EPS',
    color: '#14b8a6',
    defaultOn: false,
    formatValue: (v) => `$${v.toFixed(2)}`,
    yAxisId: 'eps',
  },
];

function calculateCagr(startValue: number, endValue: number, years: number): number | null {
  if (years <= 0 || startValue <= 0 || endValue <= 0) return null;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

function MetricToggle({
  config,
  isActive,
  onToggle,
}: {
  config: MetricConfig;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-mono transition-colors border ${
        isActive
          ? 'border-zinc-600 bg-zinc-800 text-zinc-200'
          : 'border-zinc-800 bg-transparent text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
      }`}
    >
      <span
        className="h-2 w-2 rounded-sm shrink-0"
        style={{ backgroundColor: isActive ? config.color : 'transparent', border: `1px solid ${config.color}` }}
      />
      {config.label}
    </button>
  );
}

function InsightCard({ points, ticker }: { points: OverlayDataPoint[]; ticker: string }) {
  const insight = useMemo(() => {
    if (points.length < 2) return null;

    const first = points[0];
    const last = points[points.length - 1];
    const years = last.fiscalYear - first.fiscalYear;

    if (years <= 0) return null;

    const revenueCagr = calculateCagr(first.revenue, last.revenue, years);
    const netIncomeCagr = calculateCagr(first.netIncome, last.netIncome, years);

    if (revenueCagr === null) return null;

    const lines: string[] = [];
    lines.push(
      `Revenue grew at a ${revenueCagr.toFixed(1)}% CAGR over ${years} years (FY${first.fiscalYear}–FY${last.fiscalYear}).`
    );

    if (netIncomeCagr !== null) {
      lines.push(
        `Net income grew at a ${netIncomeCagr.toFixed(1)}% CAGR over the same period.`
      );

      const gap = netIncomeCagr - revenueCagr;
      if (gap > 5) {
        lines.push('Margins have expanded — net income is growing faster than revenue.');
      } else if (gap < -5) {
        lines.push('Margins have compressed — revenue is growing faster than net income.');
      }
    }

    const divergence = revenueCagr > 0 ? 'growing' : 'declining';
    return { lines, divergence };
  }, [points, ticker]);

  if (!insight) return null;

  const Icon = insight.divergence === 'growing' ? TrendingUp : insight.divergence === 'declining' ? TrendingDown : Minus;

  return (
    <div className="mx-4 mb-4 rounded border border-orange-500/30 bg-orange-500/5 px-4 py-3">
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          {insight.lines.map((line, i) => (
            <p key={i} className="text-xs text-zinc-300 font-mono leading-relaxed">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRICE_COLOR = '#22c55e';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
      <p className="text-[10px] font-mono text-zinc-400 mb-1">{label}</p>
      {payload.map((entry) => {
        if (entry.name === 'price') {
          return (
            <p key="price" className="text-xs font-mono" style={{ color: PRICE_COLOR }}>
              Price: ${entry.value.toFixed(2)}
            </p>
          );
        }
        const config = METRICS.find((m) => m.key === entry.name);
        return (
          <p key={entry.name} className="text-xs font-mono" style={{ color: entry.color }}>
            {config?.label ?? entry.name}: {config?.formatValue(entry.value) ?? entry.value}
          </p>
        );
      })}
    </div>
  );
}

export function OverlayChart({ ticker }: OverlayChartProps) {
  const { data, isLoading, error } = useOverlayData(ticker);

  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(() => {
    const defaults = new Set<MetricKey>();
    for (const m of METRICS) {
      if (m.defaultOn) defaults.add(m.key);
    }
    return defaults;
  });

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const showEpsAxis = activeMetrics.has('epsDiluted');
  const showDollarAxis = activeMetrics.has('revenue') || activeMetrics.has('netIncome') || activeMetrics.has('freeCashFlow');
  const hasPriceData = data?.points.some((p) => p.price > 0) ?? false;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
          <span className="font-mono text-[10px] text-zinc-600">Loading fundamentals...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.points.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs text-zinc-600">
          {error ? 'Failed to load fundamental data.' : 'No fundamental data available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Metric toggles */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/50">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1">Metrics</span>
        {METRICS.map((config) => (
          <MetricToggle
            key={config.key}
            config={config}
            isActive={activeMetrics.has(config.key)}
            onToggle={() => toggleMetric(config.key)}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.points} margin={{ top: 10, right: hasPriceData ? 50 : 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            {showDollarAxis && (
              <YAxis
                yAxisId="dollars"
                tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompactCurrency(v)}
                width={55}
              />
            )}
            {showEpsAxis && (
              <YAxis
                yAxisId="eps"
                orientation="right"
                tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(1)}`}
                width={45}
              />
            )}
            {hasPriceData && (
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fontSize: 10, fill: PRICE_COLOR, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                width={45}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={0}
              content={() => null}
            />
            {METRICS.filter((m) => activeMetrics.has(m.key)).map((config) => (
              <Bar
                key={config.key}
                dataKey={config.key}
                name={config.key}
                yAxisId={config.yAxisId}
                fill={config.color}
                fillOpacity={0.8}
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
            ))}
            {hasPriceData && (
              <Line
                type="monotone"
                dataKey="price"
                name="price"
                yAxisId="price"
                stroke={PRICE_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: PRICE_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: PRICE_COLOR, strokeWidth: 0 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insight card */}
      <InsightCard points={data.points} ticker={ticker} />
    </div>
  );
}
