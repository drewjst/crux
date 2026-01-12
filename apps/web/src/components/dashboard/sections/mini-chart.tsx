'use client';

import { useEffect, useRef, memo } from 'react';

interface MiniChartProps {
  symbol: string;
  colorTheme?: 'light' | 'dark';
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL';
  width?: string | number;
  height?: string | number;
}

function MiniChartComponent({
  symbol,
  colorTheme = 'light',
  dateRange = '12M',
  width = '100%',
  height = 220,
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetContainer);

    // Create and configure the script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: width,
      height: height,
      locale: 'en',
      dateRange: dateRange,
      colorTheme: colorTheme,
      isTransparent: true,
      autosize: false,
      largeChartUrl: `https://www.tradingview.com/chart/?symbol=${symbol}`,
      noTimeScale: false,
      chartOnly: false,
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, colorTheme, dateRange, width, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export const MiniChart = memo(MiniChartComponent);
