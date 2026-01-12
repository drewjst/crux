'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow cursor-default', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DashboardDivider() {
  return (
    <div className="relative py-4">
      <div
        className="absolute left-1/2 -translate-x-1/2 w-screen border-t border-dashed border-border"
        style={{ maxWidth: 'calc(100vw - 2px)' }}
      />
    </div>
  );
}
