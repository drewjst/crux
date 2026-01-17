'use client';

import { memo } from 'react';
import { SectionCard } from './section-card';
import { Card } from '@/components/ui/card';
import type { StockDetailResponse } from '@recon/shared';

interface ETFOverviewSectionProps {
  data: StockDetailResponse;
}

function formatAUM(aum: number): string {
  if (aum >= 1e12) return `$${(aum / 1e12).toFixed(2)}T`;
  if (aum >= 1e9) return `$${(aum / 1e9).toFixed(2)}B`;
  if (aum >= 1e6) return `$${(aum / 1e6).toFixed(0)}M`;
  return `$${aum.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function getExpenseRatioAssessment(ratio: number): string {
  if (ratio <= 0.1) return 'Very Low';
  if (ratio <= 0.3) return 'Low';
  if (ratio <= 0.75) return 'Moderate';
  return 'High';
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
}

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <Card className="p-4 text-center">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </Card>
  );
}

function ETFOverviewSectionComponent({ data }: ETFOverviewSectionProps) {
  const { etfData } = data;
  if (!etfData) return null;

  const metrics = [
    {
      label: 'Expense Ratio',
      value: `${(etfData.expenseRatio * 100).toFixed(2)}%`,
      description: getExpenseRatioAssessment(etfData.expenseRatio),
    },
    {
      label: 'AUM',
      value: formatAUM(etfData.aum),
      description: 'Assets Under Management',
    },
    {
      label: 'Yield',
      value: etfData.yield ? `${etfData.yield.toFixed(2)}%` : 'N/A',
      description: 'Distribution Yield',
    },
    {
      label: 'Inception',
      value: formatDate(etfData.inceptionDate),
      description: 'Fund Start Date',
    },
  ];

  return (
    <SectionCard title="Fund Overview">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>
    </SectionCard>
  );
}

export const ETFOverviewSection = memo(ETFOverviewSectionComponent);
