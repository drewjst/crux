'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchAISummary, type AISummaryResponse } from '@/lib/api';

const AI_STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours

interface AIInsightsProps {
  ticker: string;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
        <div className="space-y-1 text-center">
          <span className="block font-mono text-[10px] text-zinc-500">CRUX.AI</span>
          <span className="block font-mono text-[10px] text-zinc-600">Generating analysis...</span>
        </div>
        <div className="w-48 space-y-2 mt-2">
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-full" />
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-11/12" />
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-4/5" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-5 w-5 text-zinc-500" />
        <p className="font-mono text-xs text-zinc-500">Failed to generate analysis.</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-[11px] font-mono text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ data }: { data: AISummaryResponse }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-orange-500/10 via-zinc-900 to-purple-500/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-orange-400" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">
          CRUX.AI
        </span>
        <span className="text-[9px] font-mono text-zinc-600 ml-auto">
          powered by Gemini
        </span>
      </div>
      <p className="text-xs font-mono leading-relaxed text-zinc-300">{data.summary}</p>
    </div>
  );
}

function SignalList({ signals, type }: { signals: string[]; type: 'bullish' | 'bearish' }) {
  const isBullish = type === 'bullish';
  const Icon = isBullish ? TrendingUp : TrendingDown;
  const borderColor = isBullish ? 'border-emerald-500/30' : 'border-red-500/30';
  const iconColor = isBullish ? 'text-emerald-400' : 'text-red-400';
  const labelColor = isBullish ? 'text-emerald-400' : 'text-red-400';
  const dotColor = isBullish ? 'bg-emerald-400' : 'bg-red-400';
  const label = isBullish ? 'Bullish' : 'Bearish';

  return (
    <div className={`rounded-lg border ${borderColor} bg-zinc-900/50 p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${labelColor}`}>
          {label}
        </span>
      </div>
      <ul className="space-y-2">
        {signals.map((signal, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotColor} shrink-0`} />
            <span className="text-xs font-mono text-zinc-300 leading-relaxed">{signal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterBar({ data, onRefresh, isRefreshing }: { data: AISummaryResponse; onRefresh: () => void; isRefreshing: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-zinc-800/60 px-4 py-2">
      <span className="text-[10px] font-mono text-zinc-600">
        {data.cached ? `Cached · ${formatTimestamp(data.generatedAt)}` : `Generated · ${formatTimestamp(data.generatedAt)}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 hover:text-orange-400 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}

export function AIInsights({ ticker }: AIInsightsProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['ai-summary', ticker.toUpperCase()],
    queryFn: () => fetchAISummary(ticker),
    staleTime: AI_STALE_TIME,
    retry: 1,
    enabled: Boolean(ticker),
  });

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['ai-summary', ticker.toUpperCase()] });
    refetch();
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        <SummaryCard data={data} />
        <div className="grid grid-cols-2 gap-3">
          <SignalList signals={data.bullish} type="bullish" />
          <SignalList signals={data.bearish} type="bearish" />
        </div>
      </div>
      <FooterBar data={data} onRefresh={handleRefresh} isRefreshing={isFetching && !isLoading} />
    </div>
  );
}
