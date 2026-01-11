import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Valuation, ValuationMetric } from '@recon/shared';

interface ValuationTableProps {
  valuation: Valuation;
  isLoading?: boolean;
}

export function ValuationTable({ valuation, isLoading }: ValuationTableProps) {
  if (isLoading) {
    return <ValuationTableSkeleton />;
  }

  const metrics: { label: string; metric: ValuationMetric }[] = [
    { label: 'P/E Ratio', metric: valuation.pe },
    { label: 'Forward P/E', metric: valuation.forwardPe },
    { label: 'PEG Ratio', metric: valuation.peg },
    { label: 'EV/EBITDA', metric: valuation.evToEbitda },
    { label: 'P/FCF', metric: valuation.priceToFcf },
    { label: 'P/B Ratio', metric: valuation.priceToBook },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Sector Median</TableHead>
              <TableHead className="text-right">vs Sector</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map(({ label, metric }) => {
              const diff = metric.value !== null && metric.sectorMedian !== null
                ? ((metric.value - metric.sectorMedian) / metric.sectorMedian) * 100
                : null;

              return (
                <TableRow key={label}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell className="text-right">
                    {metric.value?.toFixed(2) ?? '-'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {metric.sectorMedian?.toFixed(2) ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {diff !== null ? (
                      <Badge
                        variant={diff < -10 ? 'success' : diff > 10 ? 'destructive' : 'secondary'}
                        className="font-normal"
                      >
                        {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ValuationTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
