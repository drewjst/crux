'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, BarChart3, Wallet, PieChart } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useStock } from '@/hooks/use-stock';
import { useIncomeStatements } from '@/hooks/use-financials';
import { CruxAIInsight } from '@/components/cruxai';
import { DashboardDivider } from '@/components/dashboard/sections/section-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  IncomeStatementTab,
  FinancialsControls,
  type ViewMode,
  type PeriodCount,
} from '@/components/financials';
import type { FinancialsPeriodType } from '@/lib/api';

interface PageProps {
  params: { ticker: string };
}

export default function FinancialsPage({ params }: PageProps) {
  const { ticker } = params;
  const { data: stockData, isLoading: stockLoading, error: stockError } = useStock(ticker);

  // Controls state
  const [periodType, setPeriodType] = useState<FinancialsPeriodType>('annual');
  const [periodCount, setPeriodCount] = useState<PeriodCount>(5);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  // Compute limit based on period type and count
  const limit = periodType === 'quarterly'
    ? periodCount === 5 ? 4 : periodCount === 10 ? 8 : 12
    : periodCount;

  // Fetch income statements
  const {
    data: incomeData,
    isLoading: incomeLoading,
    error: incomeError,
  } = useIncomeStatements(ticker, { period: periodType, limit });

  // Set dynamic page title
  useEffect(() => {
    if (stockData?.company.name) {
      document.title = `${ticker.toUpperCase()} Financial Statements | Crux`;
    }
  }, [stockData, ticker]);

  // Export to CSV handler
  const handleExport = useCallback(() => {
    if (!incomeData?.periods) return;

    const headers = ['Metric', ...incomeData.periods.map(p =>
      p.fiscalQuarter ? `Q${p.fiscalQuarter} ${p.fiscalYear}` : `FY ${p.fiscalYear}`
    )];

    const rows = [
      ['Revenue', ...incomeData.periods.map(p => p.revenue.toString())],
      ['Gross Profit', ...incomeData.periods.map(p => p.grossProfit.toString())],
      ['Operating Income', ...incomeData.periods.map(p => p.operatingIncome.toString())],
      ['Net Income', ...incomeData.periods.map(p => p.netIncome.toString())],
      ['EPS Diluted', ...incomeData.periods.map(p => p.epsDiluted.toString())],
      ['Gross Margin %', ...incomeData.periods.map(p => p.grossMargin.toString())],
      ['Operating Margin %', ...incomeData.periods.map(p => p.operatingMargin.toString())],
      ['Net Margin %', ...incomeData.periods.map(p => p.netMargin.toString())],
    ];

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker.toUpperCase()}_income_statement_${periodType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [incomeData, ticker, periodType]);

  // Loading state
  if (stockLoading) {
    return (
      <div className="min-h-screen border-x border-border max-w-5xl mx-auto bg-background/50 shadow-sm px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (stockError || !stockData) {
    return (
      <div className="min-h-screen border-x border-border max-w-5xl mx-auto bg-background/50 shadow-sm px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">
            Error loading financial data
          </h2>
          <p className="text-muted-foreground mt-2">
            Could not load financial data for {ticker.toUpperCase()}
          </p>
          <Link
            href={`/stock/${ticker.toUpperCase()}`}
            className="text-primary hover:underline mt-4 inline-block"
          >
            Return to stock page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-x border-border max-w-5xl mx-auto bg-background/50 shadow-sm px-4 sm:px-6 lg:px-8">
      <div className="py-8 space-y-6">
        {/* Back Link */}
        <Link
          href={`/stock/${ticker.toUpperCase()}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {ticker.toUpperCase()}
        </Link>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Financial Statements
            </h1>
            <p className="text-muted-foreground">{stockData.company.name}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Currency: USD</div>
            {incomeData?.periods?.[0]?.filingDate && (
              <div>Last Filed: {new Date(incomeData.periods[0].filingDate).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* CruxAI Financial Summary */}
        <CruxAIInsight ticker={ticker} section="financial-summary" />

        <DashboardDivider />

        {/* Controls Bar */}
        <FinancialsControls
          periodType={periodType}
          onPeriodTypeChange={setPeriodType}
          periodCount={periodCount}
          onPeriodCountChange={setPeriodCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExport={handleExport}
        />

        {/* Tabbed Content */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="income" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Income Statement
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-1.5" disabled>
              <BarChart3 className="h-4 w-4" />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-1.5" disabled>
              <Wallet className="h-4 w-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-1.5" disabled>
              <PieChart className="h-4 w-4" />
              Segments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="mt-4">
            {incomeLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-64 bg-muted rounded" />
              </div>
            ) : incomeError ? (
              <div className="py-8 text-center text-muted-foreground">
                Error loading income statement data
              </div>
            ) : (
              <IncomeStatementTab
                periods={incomeData?.periods || []}
                viewMode={viewMode}
              />
            )}
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              Balance Sheet coming soon
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              Cash Flow Statement coming soon
            </div>
          </TabsContent>

          <TabsContent value="segments" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              Revenue Segments coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
