'use client';

import { SectionCard } from './section-card';
import type { StockDetailResponse, EfficiencyMetric } from '@recon/shared';

interface EfficiencySectionProps {
  data: StockDetailResponse;
}

type Assessment = 'Excellent' | 'Good' | 'Average' | 'Below Avg' | 'Caution';
type AssessmentType = 'positive' | 'neutral' | 'negative';

interface MetricConfig {
  label: string;
  metric: EfficiencyMetric | null;
  formatValue: (value: number) => string;
  formatRange: (value: number) => string;
}

function getAssessment(percentile: number): { text: Assessment; type: AssessmentType } {
  if (percentile >= 75) return { text: 'Excellent', type: 'positive' };
  if (percentile >= 50) return { text: 'Good', type: 'positive' };
  if (percentile >= 25) return { text: 'Average', type: 'neutral' };
  if (percentile >= 10) return { text: 'Below Avg', type: 'negative' };
  return { text: 'Caution', type: 'negative' };
}

function AssessmentBadge({ assessment }: { assessment: { text: Assessment; type: AssessmentType } }) {
  const colors = {
    positive: 'bg-success/10 text-success',
    neutral: 'bg-muted text-muted-foreground',
    negative: 'bg-destructive/10 text-destructive',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[assessment.type]}`}>
      {assessment.text}
    </span>
  );
}

function PositionBar({ metric }: { metric: EfficiencyMetric }) {
  const { percentile, sectorMin, sectorMedian, sectorMax } = metric;

  // Determine dot color based on percentile
  const getDotColor = () => {
    if (percentile >= 75) return 'bg-success';
    if (percentile >= 25) return 'bg-amber-500';
    return 'bg-destructive';
  };

  // Calculate median position on the bar (as percentage of the range)
  const medianPosition = ((sectorMedian - sectorMin) / (sectorMax - sectorMin)) * 100;

  return (
    <div className="mt-2">
      {/* Position bar */}
      <div className="relative h-2 bg-muted rounded-full">
        {/* Median marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-border"
          style={{ left: `${medianPosition}%` }}
        />

        {/* Stock position dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${getDotColor()} border-2 border-background shadow-sm transition-all duration-300`}
          style={{ left: `calc(${Math.max(0, Math.min(100, percentile))}% - 6px)` }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span className="font-mono">{formatRangeValue(metric, sectorMin)}</span>
        <span>Median</span>
        <span className="font-mono">{formatRangeValue(metric, sectorMax)}</span>
      </div>
    </div>
  );
}

function formatRangeValue(metric: EfficiencyMetric, value: number): string {
  // For percentages (ROIC, FCF Yield)
  if (metric.sectorMax > 10) {
    return `${value.toFixed(0)}%`;
  }
  // For ratios (Debt/Equity)
  if (metric.sectorMax <= 10) {
    return value.toFixed(1);
  }
  return value.toFixed(1);
}

function EfficiencyMetricRow({
  label,
  metric,
  formatValue,
}: MetricConfig) {
  if (!metric) return null;

  const assessment = getAssessment(metric.percentile);

  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm">{label}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm">{formatValue(metric.value)}</span>
          <AssessmentBadge assessment={assessment} />
        </div>
      </div>

      <PositionBar metric={metric} />
    </div>
  );
}

export function EfficiencySection({ data }: EfficiencySectionProps) {
  const { efficiency } = data;
  if (!efficiency) return null;

  const metrics: MetricConfig[] = [
    {
      label: 'ROIC',
      metric: efficiency.roic,
      formatValue: (v) => `${v.toFixed(1)}%`,
      formatRange: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: 'ROE',
      metric: efficiency.roe,
      formatValue: (v) => `${v.toFixed(1)}%`,
      formatRange: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: 'Operating Margin',
      metric: efficiency.operatingMargin,
      formatValue: (v) => `${v.toFixed(1)}%`,
      formatRange: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: 'FCF Yield',
      metric: efficiency.fcfYield,
      formatValue: (v) => `${v.toFixed(2)}%`,
      formatRange: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Debt/Equity',
      metric: efficiency.debtToEquity,
      formatValue: (v) => v.toFixed(2),
      formatRange: (v) => v.toFixed(1),
    },
    {
      label: 'Current Ratio',
      metric: efficiency.currentRatio,
      formatValue: (v) => `${v.toFixed(2)}x`,
      formatRange: (v) => `${v.toFixed(1)}x`,
    },
  ];

  // Filter out null metrics
  const validMetrics = metrics.filter((m) => m.metric !== null);

  return (
    <SectionCard title="Efficiency">
      {validMetrics.length === 0 ? (
        <p className="text-sm text-muted-foreground">Efficiency data not available.</p>
      ) : (
        <div>
          {validMetrics.map((config) => (
            <EfficiencyMetricRow key={config.label} {...config} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
