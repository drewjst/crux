'use client';

import { memo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IncomeStatementPeriod } from '@/lib/api';

interface IncomeStatementTabProps {
  periods: IncomeStatementPeriod[];
  viewMode: 'standard' | 'common-size' | 'growth';
}

interface RowData {
  label: string;
  key: keyof IncomeStatementPeriod | string;
  isSubtotal?: boolean;
  indent?: number;
  commonSizeKey?: keyof IncomeStatementPeriod;
  growthKey?: keyof IncomeStatementPeriod;
}

interface SectionConfig {
  title: string;
  rows: RowData[];
}

const sections: SectionConfig[] = [
  {
    title: 'Revenue',
    rows: [
      { label: 'Total Revenue', key: 'revenue', isSubtotal: true },
    ],
  },
  {
    title: 'Costs & Expenses',
    rows: [
      { label: 'Cost of Revenue', key: 'costOfRevenue' },
      { label: 'Gross Profit', key: 'grossProfit', isSubtotal: true },
      { label: 'Operating Expenses', key: 'operatingExpenses' },
    ],
  },
  {
    title: 'Operating Income',
    rows: [
      { label: 'Operating Income', key: 'operatingIncome', isSubtotal: true },
      { label: 'EBITDA', key: 'ebitda' },
    ],
  },
  {
    title: 'Net Income',
    rows: [
      { label: 'Net Income', key: 'netIncome', isSubtotal: true },
    ],
  },
  {
    title: 'Per Share',
    rows: [
      { label: 'Diluted EPS', key: 'epsDiluted' },
    ],
  },
  {
    title: 'Margins',
    rows: [
      { label: 'Gross Margin', key: 'grossMargin' },
      { label: 'Operating Margin', key: 'operatingMargin' },
      { label: 'EBITDA Margin', key: 'ebitdaMargin' },
      { label: 'Net Margin', key: 'netMargin' },
    ],
  },
];

// Format a number for display
function formatValue(value: number | undefined | null, isPercent = false, isEPS = false): string {
  if (value === undefined || value === null) return '--';

  if (isPercent) {
    return `${value.toFixed(1)}%`;
  }

  if (isEPS) {
    return `$${value.toFixed(2)}`;
  }

  // Format as currency with B/M/K suffix
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

// Format growth rate
function formatGrowth(value: number | undefined | null): string {
  if (value === undefined || value === null) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Get period label from period data
function getPeriodLabel(period: IncomeStatementPeriod): string {
  if (period.fiscalQuarter) {
    return `Q${period.fiscalQuarter} ${period.fiscalYear}`;
  }
  return `FY ${period.fiscalYear}`;
}

// Check if a key represents a margin/percent value
function isPercentKey(key: string): boolean {
  return key.includes('Margin') || key.includes('Growth');
}

// Check if a key is EPS
function isEPSKey(key: string): boolean {
  return key.toLowerCase().includes('eps');
}

// Collapsible section component
const CollapsibleSection = memo(function CollapsibleSection({
  title,
  rows,
  periods,
  viewMode,
  defaultOpen = true,
}: {
  title: string;
  rows: RowData[];
  periods: IncomeStatementPeriod[];
  viewMode: 'standard' | 'common-size' | 'growth';
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/30 last:border-0">
      {/* Section Header */}
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

      {/* Section Rows */}
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
              {/* Row Label - Sticky */}
              <div
                className={cn(
                  'sticky left-0 z-10 bg-background',
                  'min-w-[180px] w-[180px] py-2 px-3 text-sm',
                  row.isSubtotal && 'font-semibold',
                  row.indent && `pl-${4 + row.indent * 2}`
                )}
              >
                {row.label}
              </div>

              {/* Period Values */}
              {periods.map((period) => {
                const key = row.key as keyof IncomeStatementPeriod;
                const value = period[key] as number | undefined;
                const isPercent = isPercentKey(row.key);
                const isEPS = isEPSKey(row.key);

                let displayValue: string;
                let colorClass = '';

                if (viewMode === 'growth' && !isPercent) {
                  // Show growth rate
                  const growthKey = `${row.key}Growth` as keyof IncomeStatementPeriod;
                  const growth = period[growthKey] as number | undefined;
                  displayValue = formatGrowth(growth);
                  if (growth !== undefined && growth !== null) {
                    colorClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-destructive' : '';
                  }
                } else if (viewMode === 'common-size' && !isPercent && !isEPS) {
                  // Show as % of revenue
                  if (period.revenue && period.revenue > 0 && value !== undefined) {
                    const pctOfRevenue = (value / period.revenue) * 100;
                    displayValue = `${pctOfRevenue.toFixed(1)}%`;
                  } else {
                    displayValue = '--';
                  }
                } else {
                  displayValue = formatValue(value, isPercent, isEPS);
                  // Color negative values
                  if (value !== undefined && value < 0 && !isPercent) {
                    colorClass = 'text-destructive';
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

              {/* YoY % Column (only for last period in standard view) */}
              {viewMode === 'standard' && !isPercentKey(row.key) && (
                <div className="min-w-[80px] w-[80px] py-2 px-2 text-sm text-right font-mono">
                  {(() => {
                    const growthKey = `${row.key}Growth` as keyof IncomeStatementPeriod;
                    const growth = periods[0]?.[growthKey] as number | undefined;
                    if (growth === undefined || growth === null) return '--';
                    const colorClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-destructive' : '';
                    return (
                      <span className={colorClass}>
                        {formatGrowth(growth)}
                      </span>
                    );
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

export const IncomeStatementTab = memo(function IncomeStatementTab({
  periods,
  viewMode,
}: IncomeStatementTabProps) {
  if (!periods || periods.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No income statement data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
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
          <div>
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
      </div>

      {/* Key Metrics Summary Card */}
      <div className="bg-card/30 rounded-lg p-4 border border-border/30">
        <h4 className="text-sm font-semibold mb-3">Key Metrics (Latest Period)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.revenueFormatted || '--'}
            </div>
            {periods[0]?.revenueGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                periods[0].revenueGrowth > 0 ? 'text-success' : periods[0].revenueGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(periods[0].revenueGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Net Income</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.netIncomeFormatted || '--'}
            </div>
            {periods[0]?.netIncomeGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                periods[0].netIncomeGrowth > 0 ? 'text-success' : periods[0].netIncomeGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(periods[0].netIncomeGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Gross Margin</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.grossMargin !== undefined ? `${periods[0].grossMargin.toFixed(1)}%` : '--'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Net Margin</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.netMargin !== undefined ? `${periods[0].netMargin.toFixed(1)}%` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
