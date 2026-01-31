'use client';

import { memo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CashFlowPeriod } from '@/lib/api';

interface CashFlowTabProps {
  periods: CashFlowPeriod[];
  viewMode: 'standard' | 'common-size' | 'growth';
}

interface RowData {
  label: string;
  key: keyof CashFlowPeriod | string;
  isSubtotal?: boolean;
  indent?: number;
}

interface SectionConfig {
  title: string;
  rows: RowData[];
}

const sections: SectionConfig[] = [
  {
    title: 'Operating Activities',
    rows: [
      { label: 'Operating Cash Flow', key: 'operatingCashFlow', isSubtotal: true },
    ],
  },
  {
    title: 'Investing Activities',
    rows: [
      { label: 'Capital Expenditures', key: 'capitalExpenditures', indent: 1 },
      { label: 'Investing Cash Flow', key: 'investingCashFlow', isSubtotal: true },
    ],
  },
  {
    title: 'Financing Activities',
    rows: [
      { label: 'Dividends Paid', key: 'dividendsPaid', indent: 1 },
      { label: 'Stock Buybacks', key: 'stockBuybacks', indent: 1 },
      { label: 'Financing Cash Flow', key: 'financingCashFlow', isSubtotal: true },
    ],
  },
  {
    title: 'Free Cash Flow',
    rows: [
      { label: 'Free Cash Flow', key: 'freeCashFlow', isSubtotal: true },
    ],
  },
];

function formatValue(value: number | undefined | null): string {
  if (value === undefined || value === null) return '--';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatGrowth(value: number | undefined | null): string {
  if (value === undefined || value === null) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function getPeriodLabel(period: CashFlowPeriod): string {
  if (period.fiscalQuarter) {
    return `Q${period.fiscalQuarter} ${period.fiscalYear}`;
  }
  return `FY ${period.fiscalYear}`;
}

const CollapsibleSection = memo(function CollapsibleSection({
  title,
  rows,
  periods,
  viewMode,
  defaultOpen = true,
}: {
  title: string;
  rows: RowData[];
  periods: CashFlowPeriod[];
  viewMode: 'standard' | 'common-size' | 'growth';
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {title}
      </button>

      {isOpen && (
        <div>
          {rows.map((row) => (
            <div
              key={row.key}
              className={cn(
                'flex items-center border-b border-border/20 last:border-0',
                'hover:bg-muted/20 transition-colors',
                row.isSubtotal && 'bg-muted/10 font-medium'
              )}
            >
              <div
                className={cn(
                  'sticky left-0 z-10 bg-background',
                  'min-w-[180px] w-[180px] py-2 px-3 text-sm',
                  row.isSubtotal && 'font-semibold',
                  row.indent && 'pl-6'
                )}
              >
                {row.label}
              </div>

              {periods.map((period) => {
                const key = row.key as keyof CashFlowPeriod;
                const value = period[key] as number | undefined;

                let displayValue: string;
                let colorClass = '';

                if (viewMode === 'growth') {
                  const growthKey = `${row.key}Growth` as keyof CashFlowPeriod;
                  const growth = period[growthKey] as number | undefined;
                  displayValue = formatGrowth(growth);
                  if (growth !== undefined && growth !== null) {
                    colorClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-destructive' : '';
                  }
                } else if (viewMode === 'common-size' && period.operatingCashFlow !== 0 && value !== undefined) {
                  // Show as % of CFO
                  const pctOfCFO = (value / Math.abs(period.operatingCashFlow)) * 100;
                  displayValue = `${pctOfCFO.toFixed(1)}%`;
                } else {
                  displayValue = formatValue(value);
                  // Color: positive CFO/FCF is good, negative capex/dividends/buybacks is normal (outflow)
                  if (value !== undefined) {
                    if (['operatingCashFlow', 'freeCashFlow'].includes(row.key)) {
                      colorClass = value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : '';
                    } else if (value < 0) {
                      // Outflows shown in red
                      colorClass = 'text-destructive';
                    }
                  }
                }

                return (
                  <div
                    key={period.periodEnd}
                    className={cn(
                      'min-w-[100px] w-[100px] py-2 px-2 text-sm text-right font-mono',
                      colorClass,
                      row.isSubtotal && 'font-semibold'
                    )}
                  >
                    {displayValue}
                  </div>
                );
              })}

              {viewMode === 'standard' && (
                <div className="min-w-[80px] w-[80px] py-2 px-2 text-sm text-right font-mono">
                  {(() => {
                    const growthKey = `${row.key}Growth` as keyof CashFlowPeriod;
                    const growth = periods[0]?.[growthKey] as number | undefined;
                    if (growth === undefined || growth === null) return '--';
                    const colorClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-destructive' : '';
                    return <span className={colorClass}>{formatGrowth(growth)}</span>;
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Cash Flow Waterfall Visualization
const CashFlowWaterfall = memo(function CashFlowWaterfall({
  period,
}: {
  period: CashFlowPeriod;
}) {
  const cfo = period.operatingCashFlow;
  const capex = Math.abs(period.capitalExpenditures);
  const fcf = period.freeCashFlow;
  const buybacks = Math.abs(period.stockBuybacks);
  const dividends = Math.abs(period.dividendsPaid);
  const retained = fcf - buybacks - dividends;

  // Find max for scaling
  const maxValue = Math.max(Math.abs(cfo), Math.abs(fcf), capex, buybacks, dividends, Math.abs(retained));
  const scale = (val: number) => (Math.abs(val) / maxValue) * 100;

  const items = [
    { label: 'CFO', value: cfo, color: 'bg-success', width: scale(cfo) },
    { label: 'CapEx', value: -capex, color: 'bg-amber-500', width: scale(capex) },
    { label: 'FCF', value: fcf, color: 'bg-primary', width: scale(fcf) },
    { label: 'Buybacks', value: -buybacks, color: 'bg-destructive/70', width: scale(buybacks) },
    { label: 'Dividends', value: -dividends, color: 'bg-destructive/50', width: scale(dividends) },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-20 text-xs text-muted-foreground text-right">{item.label}</div>
          <div className="flex-1 h-6 bg-muted/30 rounded relative overflow-hidden">
            <div
              className={cn('h-full rounded transition-all', item.color)}
              style={{ width: `${item.width}%` }}
            />
          </div>
          <div className={cn(
            'w-20 text-xs font-mono text-right',
            item.value >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {formatValue(item.value)}
          </div>
        </div>
      ))}
    </div>
  );
});

export const CashFlowTab = memo(function CashFlowTab({
  periods,
  viewMode,
}: CashFlowTabProps) {
  if (!periods || periods.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No cash flow data available
      </div>
    );
  }

  const latestPeriod = periods[0];

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header Row */}
          <div className="flex items-center border-b border-border bg-muted/30 sticky top-0 z-20">
            <div className="sticky left-0 z-30 bg-muted/30 min-w-[180px] w-[180px] py-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Metric
            </div>
            {periods.map((period) => (
              <div
                key={period.periodEnd}
                className="min-w-[100px] w-[100px] py-3 px-2 text-xs font-semibold text-center text-muted-foreground"
              >
                {getPeriodLabel(period)}
              </div>
            ))}
            {viewMode === 'standard' && (
              <div className="min-w-[80px] w-[80px] py-3 px-2 text-xs font-semibold text-center text-muted-foreground">
                YoY %
              </div>
            )}
          </div>

          {/* Data Sections */}
          {sections.map((section) => (
            <CollapsibleSection
              key={section.title}
              title={section.title}
              rows={section.rows}
              periods={periods}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>

      {/* Cash Flow Waterfall */}
      <div className="bg-card/30 rounded-lg p-4 border border-border/30">
        <h4 className="text-sm font-semibold mb-4">Cash Flow Waterfall ({getPeriodLabel(latestPeriod)})</h4>
        <CashFlowWaterfall period={latestPeriod} />
      </div>

      {/* Key Metrics Summary Card */}
      <div className="bg-card/30 rounded-lg p-4 border border-border/30">
        <h4 className="text-sm font-semibold mb-3">Key Metrics (Latest Period)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Operating CF</div>
            <div className={cn(
              'text-lg font-mono font-semibold',
              latestPeriod.operatingCashFlow > 0 ? 'text-success' : 'text-destructive'
            )}>
              {latestPeriod.operatingCashFlowFormatted || '--'}
            </div>
            {latestPeriod.operatingCashFlowGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                latestPeriod.operatingCashFlowGrowth > 0 ? 'text-success' : latestPeriod.operatingCashFlowGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(latestPeriod.operatingCashFlowGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Free Cash Flow</div>
            <div className={cn(
              'text-lg font-mono font-semibold',
              latestPeriod.freeCashFlow > 0 ? 'text-success' : 'text-destructive'
            )}>
              {latestPeriod.freeCashFlowFormatted || '--'}
            </div>
            {latestPeriod.freeCashFlowGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                latestPeriod.freeCashFlowGrowth > 0 ? 'text-success' : latestPeriod.freeCashFlowGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(latestPeriod.freeCashFlowGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">CapEx</div>
            <div className="text-lg font-mono font-semibold text-destructive">
              {formatValue(latestPeriod.capitalExpenditures)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Shareholder Returns</div>
            <div className="text-lg font-mono font-semibold">
              {formatValue(Math.abs(latestPeriod.dividendsPaid) + Math.abs(latestPeriod.stockBuybacks))}
            </div>
            <div className="text-xs text-muted-foreground">
              Div + Buybacks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
