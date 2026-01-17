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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeaderSection data={data} />

      <DashboardDivider />
      <ETFOverviewSection data={data} />

      {/* Performance section - only show if performance data is available */}
      {etfData?.performance && (
        <>
          <DashboardDivider />
          <ETFPerformanceSection data={data} />
        </>
      )}

      <DashboardDivider />
      <HoldingsTableSection data={data} />

      <DashboardDivider />
      <SectorBreakdownSection data={data} />

      {/* Regions section - only show if region data is available */}
      {etfData?.regions && etfData.regions.length > 0 && (
        <>
          <DashboardDivider />
          <ETFRegionsSection data={data} />
        </>
      )}

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
