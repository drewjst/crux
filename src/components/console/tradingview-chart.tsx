'use client';

import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

const WIDGET_SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

const WIDGET_LOAD_TIMEOUT_MS = 3000;

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    wrapper.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#0a0a0f',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      details: true,
      calendar: true,
      backgroundColor: '#0a0a0f',
      gridColor: 'rgba(255,255,255,0.04)',
      studies: ['MASimple@tv-basicstudies'],
    });

    // Hide loading once the widget iframe appears or after a timeout
    const observer = new MutationObserver(() => {
      if (wrapper.querySelector('iframe')) {
        setIsLoading(false);
        observer.disconnect();
      }
    });
    observer.observe(wrapper, { childList: true, subtree: true });

    const timeout = setTimeout(() => {
      setIsLoading(false);
      observer.disconnect();
    }, WIDGET_LOAD_TIMEOUT_MS);

    wrapper.appendChild(script);
    container.appendChild(wrapper);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      container.innerHTML = '';
    };
  }, [symbol]);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
            <span className="font-mono text-[10px] text-zinc-600">Loading chart...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
