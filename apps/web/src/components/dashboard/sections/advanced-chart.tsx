'use client';

import { useEffect, useRef, memo } from 'react';

interface AdvancedChartProps {
  symbol: string;
  exchange?: string;
  colorTheme?: 'light' | 'dark';
  height?: number;
}

/**
 * Formats a ticker symbol for TradingView.
 * TradingView expects format like "NASDAQ:AAPL" or "NYSE:IBM".
 */
function formatTradingViewSymbol(ticker: string, exchange?: string): string {
  const upperExchange = (exchange || '').toUpperCase();

  // Map various exchange names to TradingView format
  const exchangeMap: Record<string, string> = {
    // NASDAQ variants
    NASDAQ: 'NASDAQ',
    'NASDAQ GLOBAL SELECT MARKET': 'NASDAQ',
    'NASDAQ GLOBAL MARKET': 'NASDAQ',
    'NASDAQ CAPITAL MARKET': 'NASDAQ',
    NGS: 'NASDAQ',
    NGM: 'NASDAQ',
    NMS: 'NASDAQ',
    // NYSE variants
    NYSE: 'NYSE',
    'NEW YORK STOCK EXCHANGE': 'NYSE',
    NYQ: 'NYSE',
    // AMEX variants
    AMEX: 'AMEX',
    'NYSE ARCA': 'AMEX',
    'NYSE MKT': 'AMEX',
    'NYSE AMERICAN': 'AMEX',
    ARCA: 'AMEX',
    PCX: 'AMEX',
    // BATS
    BATS: 'BATS',
    BZX: 'BATS',
  };

  // Try to find a matching exchange
  let tvExchange = exchangeMap[upperExchange];

  // If no exact match, try partial matching for common patterns
  if (!tvExchange) {
    if (upperExchange.includes('NASDAQ')) {
      tvExchange = 'NASDAQ';
    } else if (upperExchange.includes('NYSE') || upperExchange.includes('NEW YORK')) {
      tvExchange = 'NYSE';
    } else if (upperExchange.includes('AMEX') || upperExchange.includes('AMERICAN')) {
      tvExchange = 'AMEX';
    } else {
      // Default to NASDAQ for unknown US exchanges
      tvExchange = 'NASDAQ';
    }
  }

  return `${tvExchange}:${ticker}`;
}

function AdvancedChartComponent({
  symbol,
  exchange,
  colorTheme = 'light',
  height = 450,
}: AdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    const formattedSymbol = formatTradingViewSymbol(symbol, exchange);

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = `${height}px`;
    container.appendChild(widgetContainer);

    // Create and configure the script for advanced chart
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: false,
      symbol: formattedSymbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: colorTheme,
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      width: '100%',
      height: height,
      hide_side_toolbar: false,
      withdateranges: true,
      hide_volume: false,
      studies: [],
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, exchange, colorTheme, height]);

  return (
    <div
      className="tradingview-widget-container w-full rounded-lg overflow-hidden border border-border"
      ref={containerRef}
      style={{ height: height }}
    >
      <div className="tradingview-widget-container__widget w-full h-full" />
    </div>
  );
}

export const AdvancedChart = memo(AdvancedChartComponent);
