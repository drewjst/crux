'use client';

import { memo } from 'react';
import { SectionCard } from './section-card';
import { Card } from '@/components/ui/card';
import type { StockDetailResponse } from '@recon/shared';

interface ETFValuationsSectionProps {
  data: StockDetailResponse;
}

function formatValue(value: number | undefined, suffix: string = ''): string {
  if (value === undefined || value === null || value === 0) return 'N/A';
  return `${value.toFixed(2)}${suffix}`;
}

interface ValuationMetricProps {
  label: string;
  value: string;
  description?: string;
}

function ValuationMetric({ label, value, description }: ValuationMetricProps) {
  return (
    <Card className="p-4 text-center">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono mb-1">{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </Card>
  );
}

function ETFValuationsSectionComponent({ data }: ETFValuationsSectionProps) {
  const valuations = data.etfData?.valuations;
  if (!valuations) return null;

  const metrics = [
    {
      label: 'P/E Ratio',
      value: formatValue(valuations.pe, 'x'),
      description: 'Price to Earnings',
    },
    {
      label: 'P/B Ratio',
      value: formatValue(valuations.pb, 'x'),
      description: 'Price to Book',
    },
    {
      label: 'P/S Ratio',
      value: formatValue(valuations.ps, 'x'),
      description: 'Price to Sales',
    },
    {
      label: 'P/CF Ratio',
      value: formatValue(valuations.pcf, 'x'),
      description: 'Price to Cash Flow',
    },
  ];

  return (
    <SectionCard title="Portfolio Valuations">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <ValuationMetric
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

export const ETFValuationsSection = memo(ETFValuationsSectionComponent);
