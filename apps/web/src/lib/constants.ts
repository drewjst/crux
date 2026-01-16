export const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const EXAMPLE_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export const SCORE_THRESHOLDS = {
  piotroski: {
    strong: 7,
    moderate: 4,
  },
  altmanZ: {
    safe: 2.99,
    gray: 1.81,
  },
  ruleOf40: {
    passing: 40,
  },
};

export const SIGNAL_COLORS = {
  bullish: 'text-green-600 bg-green-50 border-green-200',
  bearish: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
} as const;

export const COMPARE_LIMITS = {
  MIN_TICKERS: 2,
  MAX_TICKERS: 4,
} as const;
