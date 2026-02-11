'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Auth error boundary — catches errors in login/register/forgot-password pages.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">An error occurred. Please try again.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
