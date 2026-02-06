'use client';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface SmaIndicatorProps {
  sma20: boolean | null;
  sma50: boolean | null;
  sma200: boolean | null;
}

const SMA_PERIODS = [
  { key: 'sma20' as const, period: '20' },
  { key: 'sma50' as const, period: '50' },
  { key: 'sma200' as const, period: '200' },
];

function getSmaColor(value: boolean | null): string {
  if (value === true) return 'text-positive';
  if (value === false) return 'text-negative';
  return 'text-muted-foreground/40';
}

function getSmaStatus(value: boolean | null): string {
  if (value === true) return 'Above';
  if (value === false) return 'Below';
  return 'N/A';
}

export function SmaIndicator({ sma20, sma50, sma200 }: SmaIndicatorProps) {
  const values = { sma20, sma50, sma200 };

  const tooltipText = SMA_PERIODS.map(
    ({ key, period }) => `SMA ${period}: ${getSmaStatus(values[key])}`
  ).join(' · ');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 justify-end">
          {SMA_PERIODS.map(({ key, period }) => (
            <span
              key={key}
              className={`text-xs tabular-nums font-medium ${getSmaColor(values[key])}`}
            >
              {period}
            </span>
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
