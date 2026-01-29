'use client';

import { memo } from 'react';
import { CollapsibleMetricSection, type Metric } from './collapsible-metric-section';
import { toMetric } from '@/lib/metric-helpers';
import type { StockDetailResponse } from '@recon/shared';

interface GrowthCompactProps {
  data: StockDetailResponse;
  defaultOpen?: boolean;
}

function GrowthCompactComponent({ data, defaultOpen = false }: GrowthCompactProps) {
  const { company, growth } = data;

  if (!growth) return null;

  const metrics: Metric[] = [
    toMetric('revenueGrowthYoY', 'Revenue Growth (YoY)', growth.revenueGrowthYoY, {
      format: 'percent',
      higherIsBetter: true,
      info: "Year-over-year revenue growth shows how much the company's top line has grown.",
    }),
    toMetric('epsGrowthYoY', 'EPS Growth (YoY)', growth.epsGrowthYoY, {
      format: 'percent',
      higherIsBetter: true,
      info: 'Year-over-year EPS growth shows how much earnings per share have grown.',
    }),
  ];

  if (growth.projectedEpsGrowth) {
    metrics.push(
      toMetric('projectedEpsGrowth', 'Projected EPS Growth', growth.projectedEpsGrowth, {
        format: 'percent',
        higherIsBetter: true,
        info: 'Projected EPS growth based on analyst estimates.',
      })
    );
  }

  if (growth.freeCashFlowTTM) {
    metrics.push(
      toMetric('freeCashFlowTTM', 'Free Cash Flow (TTM)', growth.freeCashFlowTTM, {
        format: 'currencyMillions',
        higherIsBetter: true,
        info: 'Free Cash Flow represents the cash a company generates after capital expenditures.',
      })
    );
  }

  if (growth.cashFlowGrowthYoY) {
    metrics.push(
      toMetric('cashFlowGrowthYoY', 'Cash Flow Growth (YoY)', growth.cashFlowGrowthYoY, {
        format: 'percent',
        higherIsBetter: true,
        info: "Year-over-year growth in free cash flow.",
      })
    );
  }

  return (
    <CollapsibleMetricSection
      title="Growth"
      ticker={company.ticker}
      metrics={metrics}
      defaultOpen={defaultOpen}
    />
  );
}

export const GrowthCompact = memo(GrowthCompactComponent);
