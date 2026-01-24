'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { SectionCard } from '@/components/dashboard/sections/section-card';
import { cn } from '@/lib/utils';
import type { ValuationDeepDive } from '@recon/shared';

interface DCFSectionProps {
  data: ValuationDeepDive;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function DCFSectionComponent({ data }: DCFSectionProps) {
  const { dcfAnalysis } = data;

  if (!dcfAnalysis) {
    return (
      <SectionCard title="DCF & Intrinsic Value">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            DCF analysis not available for this stock. This may be due to negative cash flows or insufficient data.
          </p>
        </div>
      </SectionCard>
    );
  }

  const { intrinsicValue, currentPrice, differencePercent, marginOfSafety, impliedGrowthRate, assessment } = dcfAnalysis;

  const assessmentConfig = {
    Undervalued: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: <TrendingDown className="h-5 w-5" />,
    },
    'Fairly Valued': {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: <Minus className="h-5 w-5" />,
    },
    Overvalued: {
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    'N/A': {
      color: 'text-muted-foreground',
      bg: 'bg-muted/30',
      border: 'border-border/30',
      icon: <Minus className="h-5 w-5" />,
    },
  };

  const config = assessmentConfig[assessment as keyof typeof assessmentConfig] || assessmentConfig['N/A'];

  return (
    <SectionCard title="DCF & Intrinsic Value">
      <div className="space-y-6">
        {/* Assessment Banner */}
        <div className={cn('p-4 rounded-lg border-2', config.bg, config.border)}>
          <div className="flex items-center gap-3">
            <div className={config.color}>{config.icon}</div>
            <div>
              <div className={cn('font-semibold uppercase tracking-wider', config.color)}>
                {assessment}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {assessment === 'Undervalued' && `Trading ${Math.abs(differencePercent).toFixed(0)}% below intrinsic value`}
                {assessment === 'Fairly Valued' && 'Price approximately reflects intrinsic value'}
                {assessment === 'Overvalued' && `Trading ${Math.abs(differencePercent).toFixed(0)}% above intrinsic value`}
              </p>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Current Price
            </div>
            <div className="text-lg font-bold font-mono">
              {formatCurrency(currentPrice)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Intrinsic Value
            </div>
            <div className={cn('text-lg font-bold font-mono', config.color)}>
              {formatCurrency(intrinsicValue)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Margin of Safety
            </div>
            <div className={cn(
              'text-lg font-bold font-mono',
              marginOfSafety > 0 ? 'text-success' : 'text-destructive'
            )}>
              {formatPercent(marginOfSafety)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Implied Growth
            </div>
            <div className="text-lg font-bold font-mono">
              {impliedGrowthRate !== null && impliedGrowthRate !== undefined
                ? formatPercent(impliedGrowthRate * 100)
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Current Price</span>
            <span>Intrinsic Value</span>
          </div>
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'absolute h-full rounded-full transition-all',
                marginOfSafety > 0 ? 'bg-success' : 'bg-destructive'
              )}
              style={{
                width: `${Math.min(100, Math.max(0, (currentPrice / intrinsicValue) * 100))}%`,
              }}
            />
            {/* Intrinsic value marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style={{ left: '100%', transform: 'translateX(-1px)' }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-mono">{formatCurrency(currentPrice)}</span>
            <span className={cn('font-mono', config.color)}>{formatCurrency(intrinsicValue)}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">About DCF Valuation</h4>
          <p className="text-sm text-muted-foreground">
            Discounted Cash Flow (DCF) estimates intrinsic value by projecting future cash flows and discounting them to present value.
            A positive margin of safety suggests the stock trades below calculated fair value.
            Note: DCF models are sensitive to growth and discount rate assumptions.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export const DCFSection = memo(DCFSectionComponent);
