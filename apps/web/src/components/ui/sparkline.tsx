'use client';

import { memo, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: (number | null | undefined)[];
  width?: number;
  height?: number;
  color?: 'default' | 'positive' | 'negative' | 'auto';
  type?: 'line' | 'bar';
}

/**
 * Minimal sparkline chart for inline trend visualization.
 * Shows the shape of data without axes, labels, or grid.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 70,
  height = 24,
  color = 'auto',
  type = 'line',
}: SparklineProps) {
  // Filter out null/undefined values and check if we have enough data
  const validData = useMemo(() => {
    const filtered = data
      .map((value, index) => ({ index, value: value ?? null }))
      .filter((d): d is { index: number; value: number } => d.value !== null);
    return filtered;
  }, [data]);

  // Determine color based on trend (first vs last value)
  const strokeColor = useMemo(() => {
    if (color === 'positive') return 'hsl(var(--success))';
    if (color === 'negative') return 'hsl(var(--destructive))';
    if (color === 'default') return 'hsl(var(--muted-foreground))';

    // Auto: compare first vs last (data is oldest→newest)
    if (validData.length < 2) return 'hsl(var(--muted-foreground))';
    const first = validData[0].value;
    const last = validData[validData.length - 1].value;
    if (last > first) return 'hsl(var(--success))';
    if (last < first) return 'hsl(var(--destructive))';
    return 'hsl(var(--muted-foreground))';
  }, [color, validData]);

  // Skip rendering if insufficient data
  if (validData.length < 2) {
    return <div style={{ width, height }} />;
  }

  if (type === 'bar') {
    return (
      <div style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={validData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <Bar
              dataKey="value"
              fill={strokeColor}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={validData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
