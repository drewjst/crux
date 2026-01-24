'use client';

import { memo } from 'react';
import type { StockDetailResponse } from '@recon/shared';
import {
  HeaderSection,
  DashboardDivider,
  ETFOverviewSection,
  ETFPerformanceSection,
  ETFMarketCapSection,
  ETFRegionsSection,
  ETFValuationsSection,
  HoldingsTableSection,
  SectorBreakdownSection,
} from './sections';

interface ETFViewProps {
  data: StockDetailResponse;
}

function ETFViewComponent({ data }: ETFViewProps) {
  const { etfData } = data;
  const hasRegions = etfData?.regions && etfData.regions.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeaderSection data={data} />

      {/* Performance section - only show if performance data is available */}
      {etfData?.performance && (
        <>
          <DashboardDivider />
          <ETFPerformanceSection data={data} />
        </>
      )}

      {/* Fund Overview (left) + Top Holdings (right) - side by side on desktop */}
      <DashboardDivider />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ETFOverviewSection data={data} />
        <HoldingsTableSection data={data} />
      </div>

      {/* Sector Allocation (left) + Geographic Allocation (right) - side by side on desktop */}
      <DashboardDivider />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectorBreakdownSection data={data} />
        {hasRegions && <ETFRegionsSection data={data} />}
      </div>

      {/* Market cap breakdown - only show if data is available */}
      {etfData?.marketCapBreakdown && (
        <>
          <DashboardDivider />
          <ETFMarketCapSection data={data} />
        </>
      )}

      {/* Portfolio valuations - only show if data is available */}
      {etfData?.valuations && (
        <>
          <DashboardDivider />
          <ETFValuationsSection data={data} />
        </>
      )}
    </div>
  );
}

export const ETFView = memo(ETFViewComponent);
