'use client';

import { memo } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinancialsPeriodType } from '@/lib/api';

export type ViewMode = 'standard' | 'common-size' | 'growth';
export type PeriodCount = 5 | 10 | 3;

interface FinancialsControlsProps {
  periodType: FinancialsPeriodType;
  onPeriodTypeChange: (type: FinancialsPeriodType) => void;
  periodCount: PeriodCount;
  onPeriodCountChange: (count: PeriodCount) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExport?: () => void;
}

export const FinancialsControls = memo(function FinancialsControls({
  periodType,
  onPeriodTypeChange,
  periodCount,
  onPeriodCountChange,
  viewMode,
  onViewModeChange,
  onExport,
}: FinancialsControlsProps) {
  const periodTypeOptions: { value: FinancialsPeriodType; label: string }[] = [
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  const periodCountOptions: { value: PeriodCount; label: string }[] = periodType === 'quarterly'
    ? [
        { value: 5, label: '4Q' },
        { value: 10, label: '8Q' },
        { value: 3, label: '12Q' },
      ]
    : [
        { value: 3, label: '3Y' },
        { value: 5, label: '5Y' },
        { value: 10, label: '10Y' },
      ];

  const viewModeOptions: { value: ViewMode; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'common-size', label: '% Revenue' },
    { value: 'growth', label: 'Growth' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-muted/30 rounded-lg border border-border/30">
      {/* Period Type Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Period:</span>
        <div className="flex rounded-md border border-border/50 overflow-hidden">
          {periodTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPeriodTypeChange(option.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                periodType === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Count Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Range:</span>
        <div className="flex rounded-md border border-border/50 overflow-hidden">
          {periodCountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPeriodCountChange(option.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                periodCount === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">View:</span>
        <div className="flex rounded-md border border-border/50 overflow-hidden">
          {viewModeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onViewModeChange(option.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Button */}
      {onExport && (
        <button
          onClick={onExport}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
            'rounded-md border border-border/50 bg-background',
            'hover:bg-muted text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      )}
    </div>
  );
});
