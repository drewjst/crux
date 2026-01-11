'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarList } from '@tremor/react';
import { formatPercent } from '@/lib/utils';
import type { Financials } from '@recon/shared';

interface FinancialsChartProps {
  financials: Financials;
  isLoading?: boolean;
}

export function FinancialsChart({ financials, isLoading }: FinancialsChartProps) {
  if (isLoading) {
    return <FinancialsChartSkeleton />;
  }

  const marginData = [
    { name: 'Gross Margin', value: financials.grossMargin * 100 },
    { name: 'Operating Margin', value: financials.operatingMargin * 100 },
    { name: 'Net Margin', value: financials.netMargin * 100 },
    { name: 'FCF Margin', value: financials.fcfMargin * 100 },
  ];

  const returnData = [
    { name: 'Return on Equity (ROE)', value: financials.roe * 100 },
    { name: 'Return on Invested Capital (ROIC)', value: financials.roic * 100 },
  ];

  const ratioData = [
    { name: 'Debt to Equity', value: financials.debtToEquity },
    { name: 'Current Ratio', value: financials.currentRatio },
    ...(financials.interestCoverage !== null
      ? [{ name: 'Interest Coverage', value: financials.interestCoverage }]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Margins</h4>
            <BarList
              data={marginData}
              valueFormatter={(value: number) => `${value.toFixed(1)}%`}
              color="blue"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Returns</h4>
            <BarList
              data={returnData}
              valueFormatter={(value: number) => `${value.toFixed(1)}%`}
              color="emerald"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Ratios</h4>
            <BarList
              data={ratioData}
              valueFormatter={(value: number) => value.toFixed(2)}
              color="violet"
            />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Revenue Growth YoY:{' '}
            <span className={financials.revenueGrowthYoY >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercent(financials.revenueGrowthYoY * 100)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
