'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TickerSearch } from '@/components/search/ticker-search';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Stock page error:', error);
  }, [error]);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            {error.message || 'Failed to load stock data. Please try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>

        <div className="pt-6">
          <p className="text-sm text-muted-foreground mb-3">Or search for another ticker:</p>
          <TickerSearch className="max-w-sm mx-auto" />
        </div>
      </div>
    </div>
  );
}
