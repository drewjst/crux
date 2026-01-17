'use client';

import { memo } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { SectionCard } from './section-card';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { StockDetailResponse } from '@recon/shared';

interface ConvictionScoresSectionProps {
  data: StockDetailResponse;
}

interface ScoreBoxProps {
  label: string;
  value: string;
  description: string;
  status: 'positive' | 'neutral' | 'negative';
  tooltip: string;
  learnMoreUrl?: string;
}

const statusColors = {
  positive: 'border-success/30 bg-success/5',
  neutral: 'border-border/50',
  negative: 'border-destructive/30 bg-destructive/5',
};

const valueColors = {
  positive: 'text-success',
  neutral: 'text-foreground',
  negative: 'text-destructive',
};

const ScoreBox = memo(function ScoreBox({ label, value, description, status, tooltip, learnMoreUrl }: ScoreBoxProps) {
  return (
    <Card className={`p-4 text-center transition-all duration-300 ${statusColors[status]}`}>
      <div className="flex items-center justify-center gap-1 mb-2">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">{label}</div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted/50 active:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-ring touch-manipulation"
              aria-label={`Info about ${label}`}
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-64 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{tooltip}</p>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
              >
                Learn more
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className={`text-2xl font-bold font-mono mb-1 ${valueColors[status]}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </Card>
  );
});

const getPiotroskiStatus = (score: number): 'positive' | 'neutral' | 'negative' => {
  if (score >= 7) return 'positive';
  if (score >= 4) return 'neutral';
  return 'negative';
};

const getAltmanStatus = (zone: string): 'positive' | 'neutral' | 'negative' => {
  if (zone === 'safe') return 'positive';
  if (zone === 'gray') return 'neutral';
  return 'negative';
};

const getDCFStatus = (assessment: string): 'positive' | 'neutral' | 'negative' => {
  if (assessment === 'Undervalued') return 'positive';
  if (assessment === 'Fairly Valued') return 'neutral';
  return 'negative';
};

function ConvictionScoresSectionComponent({ data }: ConvictionScoresSectionProps) {
  const { company, scores } = data;
  if (!scores) return null;

  const ruleOf40Emoji = scores.ruleOf40.passed ? '✓' : '✗';
  const shareText = `${company.ticker} Piotroski: ${scores.piotroski.score}/9, Rule of 40: ${scores.ruleOf40.score.toFixed(0)}% ${ruleOf40Emoji}`;

  return (
    <SectionCard
      title="Financial Health Scores"
      shareTicker={company.ticker}
      shareText={shareText}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreBox
          label="Piotroski"
          value={`${scores.piotroski.score}/9`}
          description={scores.piotroski.score >= 7 ? 'Strong' : scores.piotroski.score >= 4 ? 'Moderate' : 'Weak'}
          status={getPiotroskiStatus(scores.piotroski.score)}
          tooltip="9-point fundamental strength score based on profitability, leverage, and efficiency. 7-9 is strong, 0-3 is weak."
          learnMoreUrl="https://www.investopedia.com/terms/p/piotroski-score.asp"
        />
        <ScoreBox
          label="Rule of 40"
          value={`${scores.ruleOf40.score.toFixed(0)}%`}
          description={scores.ruleOf40.passed ? 'Passed' : 'Failed'}
          status={scores.ruleOf40.passed ? 'positive' : 'negative'}
          tooltip="Revenue growth % + profit margin % should exceed 40% for healthy growth companies. Balances growth against profitability."
          learnMoreUrl="https://www.wallstreetprep.com/knowledge/rule-of-40/"
        />
        <ScoreBox
          label="Altman Z"
          value={scores.altmanZ.score.toFixed(2)}
          description={scores.altmanZ.zone === 'safe' ? 'Safe Zone' : scores.altmanZ.zone === 'gray' ? 'Gray Zone' : 'Distress'}
          status={getAltmanStatus(scores.altmanZ.zone)}
          tooltip="Bankruptcy risk predictor. Above 2.99 is safe, 1.81-2.99 is gray zone, below 1.81 indicates distress."
          learnMoreUrl="https://www.investopedia.com/terms/a/altman.asp"
        />
        <ScoreBox
          label="DCF Value"
          value={scores.dcfValuation.intrinsicValue ? `$${scores.dcfValuation.intrinsicValue.toFixed(0)}` : 'N/A'}
          description={
            scores.dcfValuation.differencePercent
              ? `${scores.dcfValuation.differencePercent > 0 ? '+' : ''}${scores.dcfValuation.differencePercent.toFixed(0)}% vs price`
              : scores.dcfValuation.assessment
          }
          status={getDCFStatus(scores.dcfValuation.assessment)}
          tooltip="Discounted Cash Flow intrinsic value vs current price. Undervalued if DCF is 15%+ above price, Overvalued if 15%+ below."
          learnMoreUrl="https://www.investopedia.com/terms/d/dcf.asp"
        />
      </div>
    </SectionCard>
  );
}

export const ConvictionScoresSection = memo(ConvictionScoresSectionComponent);
