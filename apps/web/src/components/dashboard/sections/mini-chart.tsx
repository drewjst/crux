'use client';

import { useEffect, useRef, memo } from 'react';

interface MiniChartProps {
  symbol: string;
  exchange?: string;
  colorTheme?: 'light' | 'dark';
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL';
  width?: string | number;
  height?: string | number;
  chartOnly?: boolean;
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

/**
 * Formats a TradingView symbols page URL.
 * Returns URL like "https://www.tradingview.com/symbols/NASDAQ-AAPL/"
 */
function formatTradingViewSymbolsUrl(ticker: string, exchange?: string): string {
  const upperExchange = (exchange || '').toUpperCase();

  const exchangeMap: Record<string, string> = {
    NASDAQ: 'NASDAQ',
    'NASDAQ GLOBAL SELECT MARKET': 'NASDAQ',
    'NASDAQ GLOBAL MARKET': 'NASDAQ',
    'NASDAQ CAPITAL MARKET': 'NASDAQ',
    NGS: 'NASDAQ',
    NGM: 'NASDAQ',
    NMS: 'NASDAQ',
    NYSE: 'NYSE',
    'NEW YORK STOCK EXCHANGE': 'NYSE',
    NYQ: 'NYSE',
    AMEX: 'AMEX',
    'NYSE ARCA': 'AMEX',
    'NYSE MKT': 'AMEX',
    'NYSE AMERICAN': 'AMEX',
    ARCA: 'AMEX',
    PCX: 'AMEX',
    BATS: 'BATS',
    BZX: 'BATS',
  };

  let tvExchange = exchangeMap[upperExchange];
  if (!tvExchange) {
    if (upperExchange.includes('NASDAQ')) {
      tvExchange = 'NASDAQ';
    } else if (upperExchange.includes('NYSE') || upperExchange.includes('NEW YORK')) {
      tvExchange = 'NYSE';
    } else if (upperExchange.includes('AMEX') || upperExchange.includes('AMERICAN')) {
      tvExchange = 'AMEX';
    } else {
      tvExchange = 'NASDAQ';
    }
  }

  return `https://www.tradingview.com/symbols/${tvExchange}-${ticker}/`;
}

function MiniChartComponent({
  symbol,
  exchange,
  colorTheme = 'light',
  dateRange = '12M',
  width = '100%',
  height = 220,
  chartOnly = false,
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    const formattedSymbol = formatTradingViewSymbol(symbol, exchange);
    const symbolsUrl = formatTradingViewSymbolsUrl(symbol, exchange);

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
      symbol: formattedSymbol,
      width: '100%',
      height: height,
      locale: 'en',
      dateRange: dateRange,
      colorTheme: colorTheme,
      isTransparent: false,
      autosize: false,
      largeChartUrl: symbolsUrl,
      noTimeScale: false,
      chartOnly: chartOnly,
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol, exchange, colorTheme, dateRange, width, height, chartOnly]);

  return (
    <div
      className="tradingview-widget-container w-full h-full"
      ref={containerRef}
      style={{ minHeight: height }}
    >
      <div className="tradingview-widget-container__widget w-full h-full" />
    </div>
  );
}

export const MiniChart = memo(MiniChartComponent);
