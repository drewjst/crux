'use client';

import { memo, useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BalanceSheetPeriod } from '@/lib/api';

interface BalanceSheetTabProps {
  periods: BalanceSheetPeriod[];
  viewMode: 'standard' | 'common-size' | 'growth';
}

interface RowData {
  label: string;
  key: keyof BalanceSheetPeriod | string;
  isSubtotal?: boolean;
  indent?: number;
}

interface SectionConfig {
  title: string;
  rows: RowData[];
}

const assetSections: SectionConfig[] = [
  {
    title: 'Current Assets',
    rows: [
      { label: 'Cash & Equivalents', key: 'cashAndEquivalents', indent: 1 },
      { label: 'Total Current Assets', key: 'totalCurrentAssets', isSubtotal: true },
    ],
  },
  {
    title: 'Non-Current Assets',
    rows: [
      { label: 'Total Non-Current Assets', key: 'totalNonCurrentAssets', isSubtotal: true },
    ],
  },
  {
    title: 'Total Assets',
    rows: [
      { label: 'Total Assets', key: 'totalAssets', isSubtotal: true },
    ],
  },
];

const liabilitySections: SectionConfig[] = [
  {
    title: 'Current Liabilities',
    rows: [
      { label: 'Total Current Liabilities', key: 'totalCurrentLiabilities', isSubtotal: true },
    ],
  },
  {
    title: 'Non-Current Liabilities',
    rows: [
      { label: 'Long-Term Debt', key: 'totalDebt', indent: 1 },
      { label: 'Total Non-Current Liabilities', key: 'totalNonCurrentLiabilities', isSubtotal: true },
    ],
  },
  {
    title: 'Total Liabilities',
    rows: [
      { label: 'Total Liabilities', key: 'totalLiabilities', isSubtotal: true },
    ],
  },
];

const equitySections: SectionConfig[] = [
  {
    title: 'Shareholders\' Equity',
    rows: [
      { label: 'Total Equity', key: 'totalEquity', isSubtotal: true },
    ],
  },
];

const ratioRows: RowData[] = [
  { label: 'Current Ratio', key: 'currentRatio' },
  { label: 'Debt / Equity', key: 'debtToEquity' },
  { label: 'Debt / Assets', key: 'debtToAssets' },
  { label: 'Net Debt', key: 'netDebt' },
];

function formatValue(value: number | undefined | null, isRatio = false): string {
  if (value === undefined || value === null) return '--';

  if (isRatio) {
    return value.toFixed(2);
  }

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

function getPeriodLabel(period: BalanceSheetPeriod): string {
  if (period.fiscalQuarter) {
    return `Q${period.fiscalQuarter} ${period.fiscalYear}`;
  }
  return `FY ${period.fiscalYear}`;
}

function isRatioKey(key: string): boolean {
  return ['currentRatio', 'debtToEquity', 'debtToAssets'].includes(key);
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
  periods: BalanceSheetPeriod[];
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
                const key = row.key as keyof BalanceSheetPeriod;
                const value = period[key] as number | undefined;
                const isRatio = isRatioKey(row.key);

                let displayValue: string;
                let colorClass = '';

                if (viewMode === 'growth' && !isRatio) {
                  const growthKey = `${row.key}Growth` as keyof BalanceSheetPeriod;
                  const growth = period[growthKey] as number | undefined;
                  displayValue = formatGrowth(growth);
                  if (growth !== undefined && growth !== null) {
                    colorClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-destructive' : '';
                  }
                } else if (viewMode === 'common-size' && !isRatio && period.totalAssets > 0 && value !== undefined) {
                  const pctOfAssets = (value / period.totalAssets) * 100;
                  displayValue = `${pctOfAssets.toFixed(1)}%`;
                } else {
                  displayValue = formatValue(value, isRatio);
                  if (value !== undefined && value < 0 && !isRatio) {
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

              {viewMode === 'standard' && !isRatioKey(row.key) && (
                <div className="min-w-[80px] w-[80px] py-2 px-2 text-sm text-right font-mono">
                  {(() => {
                    const growthKey = `${row.key}Growth` as keyof BalanceSheetPeriod;
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

export const BalanceSheetTab = memo(function BalanceSheetTab({
  periods,
  viewMode,
}: BalanceSheetTabProps) {
  if (!periods || periods.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No balance sheet data available
      </div>
    );
  }

  // Check if balance sheet balances (L+E = A)
  const latestPeriod = periods[0];
  const totalLiabPlusEquity = latestPeriod.totalLiabilities + latestPeriod.totalEquity;
  const isBalanced = Math.abs(totalLiabPlusEquity - latestPeriod.totalAssets) < 1000; // Allow small rounding

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

          {/* Assets */}
          {assetSections.map((section) => (
            <CollapsibleSection
              key={section.title}
              title={section.title}
              rows={section.rows}
              periods={periods}
              viewMode={viewMode}
            />
          ))}

          {/* Liabilities */}
          {liabilitySections.map((section) => (
            <CollapsibleSection
              key={section.title}
              title={section.title}
              rows={section.rows}
              periods={periods}
              viewMode={viewMode}
            />
          ))}

          {/* Equity */}
          {equitySections.map((section) => (
            <CollapsibleSection
              key={section.title}
              title={section.title}
              rows={section.rows}
              periods={periods}
              viewMode={viewMode}
            />
          ))}

          {/* Balance Verification Row */}
          <div className="flex items-center border-t border-border bg-muted/20">
            <div className="sticky left-0 z-10 bg-muted/20 min-w-[180px] w-[180px] py-2 px-3 text-xs text-muted-foreground flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              L + E = Assets
            </div>
            {periods.map((period) => {
              const sum = period.totalLiabilities + period.totalEquity;
              const balanced = Math.abs(sum - period.totalAssets) < 1000;
              return (
                <div
                  key={period.periodEnd}
                  className={cn(
                    'min-w-[100px] w-[100px] py-2 px-2 text-xs text-right font-mono',
                    balanced ? 'text-success' : 'text-amber-500'
                  )}
                >
                  {balanced ? '✓' : '≈'}
                </div>
              );
            })}
            {viewMode === 'standard' && <div className="min-w-[80px] w-[80px]" />}
          </div>

          {/* Ratios Section */}
          <CollapsibleSection
            title="Key Ratios"
            rows={ratioRows}
            periods={periods}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Key Metrics Summary Card */}
      <div className="bg-card/30 rounded-lg p-4 border border-border/30">
        <h4 className="text-sm font-semibold mb-3">Key Metrics (Latest Period)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Assets</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.totalAssetsFormatted || '--'}
            </div>
            {periods[0]?.totalAssetsGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                periods[0].totalAssetsGrowth > 0 ? 'text-success' : periods[0].totalAssetsGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(periods[0].totalAssetsGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Equity</div>
            <div className="text-lg font-mono font-semibold">
              {periods[0]?.totalEquityFormatted || '--'}
            </div>
            {periods[0]?.totalEquityGrowth !== undefined && (
              <div className={cn(
                'text-xs font-mono',
                periods[0].totalEquityGrowth > 0 ? 'text-success' : periods[0].totalEquityGrowth < 0 ? 'text-destructive' : ''
              )}>
                {formatGrowth(periods[0].totalEquityGrowth)} YoY
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Ratio</div>
            <div className={cn(
              'text-lg font-mono font-semibold',
              periods[0]?.currentRatio >= 1.5 ? 'text-success' : periods[0]?.currentRatio < 1 ? 'text-destructive' : ''
            )}>
              {periods[0]?.currentRatio?.toFixed(2) || '--'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Debt / Equity</div>
            <div className={cn(
              'text-lg font-mono font-semibold',
              periods[0]?.debtToEquity <= 0.5 ? 'text-success' : periods[0]?.debtToEquity > 2 ? 'text-destructive' : ''
            )}>
              {periods[0]?.debtToEquity?.toFixed(2) || '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
