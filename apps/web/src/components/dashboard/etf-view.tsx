'use client';

import { memo } from 'react';
import type { StockDetailResponse } from '@recon/shared';
import {
  HeaderSection,
  DashboardDivider,
  ETFOverviewSection,
  HoldingsTableSection,
  SectorBreakdownSection,
} from './sections';

interface ETFViewProps {
  data: StockDetailResponse;
}

function ETFViewComponent({ data }: ETFViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeaderSection data={data} />

      <DashboardDivider />
      <ETFOverviewSection data={data} />

      <DashboardDivider />
      <HoldingsTableSection data={data} />

      <DashboardDivider />
      <SectorBreakdownSection data={data} />
    </div>
  );
}

export const ETFView = memo(ETFViewComponent);
