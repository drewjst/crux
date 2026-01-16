/**
 * Compare domain types for the Recon multi-stock comparison feature.
 *
 * These interfaces define the contract for comparing 2-4 stocks side-by-side.
 */

/**
 * Result of ranking stocks across multiple metrics.
 * Used to display the overall winner summary.
 */
export interface RankingResult {
  /** Stock ticker symbol */
  ticker: string;
  /** Overall rank (1 = best) */
  rank: number;
  /** Number of metrics where this stock was the winner */
  wins: number;
}

/**
 * Layout mode for comparison view.
 * - 'side-by-side': 2 stocks with center labels
 * - 'table': 3-4 stocks in table format with Best column
 */
export type CompareLayout = 'side-by-side' | 'table';
