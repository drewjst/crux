'use client';

const SPARKLINE_WIDTH = 52;
const SPARKLINE_HEIGHT = 16;

export function MiniSparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  if (!data || data.length < 2) {
    return <div style={{ width: SPARKLINE_WIDTH, height: SPARKLINE_HEIGHT }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * SPARKLINE_WIDTH;
      const y = SPARKLINE_HEIGHT - ((v - min) / range) * (SPARKLINE_HEIGHT - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');

  const stroke = positive ? '#34d399' : '#f87171';

  return (
    <svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT} className="block">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
