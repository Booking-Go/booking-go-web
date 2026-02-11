'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Global error boundary — catches unhandled errors across the app.
 * Next.js automatically wraps each route segment in an error boundary.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Error ID: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </div>
  );
}
