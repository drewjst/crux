'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ValuationDeepDive } from '@recon/shared';

interface ScenariosSectionProps {
  data: ValuationDeepDive;
}

interface ScenarioRow {
  growthRate: number;
  impliedFairPE: number;
  currentPE: number;
  verdict: 'undervalued' | 'fair' | 'overvalued';
  upside: number;
}

const GROWTH_RATES = [5, 10, 15, 20, 25, 30, 40, 50];
const FAIR_PEG = 1.0;
const FAIR_THRESHOLD = 0.15;

function buildScenarios(currentPE: number, growthRates: number[]): ScenarioRow[] {
  return growthRates.map((rate) => {
    const impliedFairPE = rate * FAIR_PEG;
    const upside = ((impliedFairPE - currentPE) / currentPE) * 100;
    const ratio = currentPE / impliedFairPE;

    let verdict: ScenarioRow['verdict'];
    if (ratio < 1 - FAIR_THRESHOLD) {
      verdict = 'undervalued';
    } else if (ratio > 1 + FAIR_THRESHOLD) {
      verdict = 'overvalued';
    } else {
      verdict = 'fair';
    }

    return { growthRate: rate, impliedFairPE, currentPE, verdict, upside };
  });
}

const VERDICT_STYLES = {
  undervalued: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  fair: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  overvalued: 'text-red-400 bg-red-500/10 border-red-500/30',
} as const;

const VERDICT_LABELS = {
  undervalued: 'Undervalued',
  fair: 'Fair Value',
  overvalued: 'Overvalued',
} as const;

function InsightCard({ scenarios, currentPE, epsGrowth }: { scenarios: ScenarioRow[]; currentPE: number; epsGrowth: number | null }) {
  const insight = useMemo(() => {
    const breakeven = scenarios.find((s) => s.verdict !== 'overvalued');
    const lines: string[] = [];

    if (epsGrowth !== null) {
      const currentScenario = scenarios.reduce((best, s) =>
        Math.abs(s.growthRate - epsGrowth) < Math.abs(best.growthRate - epsGrowth) ? s : best
      );
      lines.push(
        `At the current consensus EPS growth of ${epsGrowth.toFixed(0)}%, the implied fair P/E is ${currentScenario.impliedFairPE.toFixed(1)}x vs the actual ${currentPE.toFixed(1)}x.`
      );

      if (currentScenario.verdict === 'undervalued') {
        lines.push('Current valuation appears justified by growth expectations.');
      } else if (currentScenario.verdict === 'overvalued') {
        lines.push('Current valuation exceeds what growth expectations justify.');
      }
    }

    if (breakeven) {
      lines.push(
        `The stock needs at least ~${breakeven.growthRate}% EPS growth to justify its current P/E of ${currentPE.toFixed(1)}x.`
      );
    }

    return lines;
  }, [scenarios, currentPE, epsGrowth]);

  if (insight.length === 0) return null;

  return (
    <div className="rounded border border-orange-500/30 bg-orange-500/5 px-4 py-3">
      <div className="flex items-start gap-2">
        <TrendingUp className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-orange-400 mb-1">Key Takeaway</p>
          {insight.map((line, i) => (
            <p key={i} className="text-xs text-zinc-300 font-mono leading-relaxed">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScenariosSection({ data }: ScenariosSectionProps) {
  const currentPE = data.historicalContext?.currentPE;
  const epsGrowth = data.growthContext?.epsGrowth ?? null;

  if (!currentPE || currentPE <= 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-mono text-xs text-zinc-600">P/E data not available for scenario analysis.</p>
      </div>
    );
  }

  const scenarios = buildScenarios(currentPE, GROWTH_RATES);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          What if EPS growth changes? (PEG = 1.0 fair value framework)
        </p>
        <p className="text-[10px] font-mono text-zinc-600">Current P/E: {currentPE.toFixed(1)}x</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="py-2 px-3 text-left text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                EPS Growth
              </th>
              <th className="py-2 px-3 text-right text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Implied Fair P/E
              </th>
              <th className="py-2 px-3 text-right text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                vs Current
              </th>
              <th className="py-2 px-3 text-right text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => {
              const isNearActual = epsGrowth !== null && Math.abs(row.growthRate - epsGrowth) < 3;
              const VerdictIcon = row.verdict === 'undervalued' ? TrendingUp : row.verdict === 'overvalued' ? TrendingDown : Minus;

              return (
                <tr
                  key={row.growthRate}
                  className={`border-b border-zinc-800/40 transition-colors ${
                    isNearActual ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <td className="py-2 px-3">
                    <span className="text-xs font-mono text-zinc-200">
                      {row.growthRate}%
                      {isNearActual && (
                        <span className="ml-1.5 text-[9px] text-orange-400 uppercase">consensus</span>
                      )}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-xs font-mono text-zinc-300">{row.impliedFairPE.toFixed(1)}x</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`text-xs font-mono ${row.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.upside >= 0 ? '+' : ''}{row.upside.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono border ${VERDICT_STYLES[row.verdict]}`}>
                      <VerdictIcon className="h-2.5 w-2.5" />
                      {VERDICT_LABELS[row.verdict]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InsightCard scenarios={scenarios} currentPE={currentPE} epsGrowth={epsGrowth} />
    </div>
  );
}
