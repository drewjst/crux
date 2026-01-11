import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Signal } from '@recon/shared';

interface SignalsBlockProps {
  signals: Signal[];
  isLoading?: boolean;
}

export function SignalsBlock({ signals, isLoading }: SignalsBlockProps) {
  if (isLoading) {
    return <SignalsBlockSkeleton />;
  }

  const bullish = signals.filter((s) => s.type === 'bullish');
  const bearish = signals.filter((s) => s.type === 'bearish');
  const warnings = signals.filter((s) => s.type === 'warning');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Key Signals
          <Badge variant="outline" className="font-normal">
            {signals.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bullish.length > 0 && (
          <SignalGroup
            title="Bullish"
            signals={bullish}
            icon={<TrendingUp className="h-4 w-4" />}
            colorClass="text-green-600 bg-green-50 border-green-200"
          />
        )}
        {warnings.length > 0 && (
          <SignalGroup
            title="Warnings"
            signals={warnings}
            icon={<AlertTriangle className="h-4 w-4" />}
            colorClass="text-amber-600 bg-amber-50 border-amber-200"
          />
        )}
        {bearish.length > 0 && (
          <SignalGroup
            title="Bearish"
            signals={bearish}
            icon={<TrendingDown className="h-4 w-4" />}
            colorClass="text-red-600 bg-red-50 border-red-200"
          />
        )}
        {signals.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Minus className="h-4 w-4" />
            <span>No significant signals detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SignalsBlockSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

interface SignalGroupProps {
  title: string;
  signals: Signal[];
  icon: React.ReactNode;
  colorClass: string;
}

function SignalGroup({ title, signals, icon, colorClass }: SignalGroupProps) {
  return (
    <div>
      <h4 className={cn('text-sm font-medium mb-2 flex items-center gap-1.5', colorClass.split(' ')[0])}>
        {icon}
        {title} ({signals.length})
      </h4>
      <ul className="space-y-2">
        {signals.map((signal, index) => (
          <li
            key={index}
            className={cn('text-sm p-3 rounded-md border', colorClass)}
          >
            <div className="flex items-start justify-between gap-2">
              <span>{signal.message}</span>
              <Badge variant="outline" className="shrink-0 text-xs">
                {signal.category}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
