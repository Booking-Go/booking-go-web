import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

/**
 * Global 404 page — shown when a route doesn't match any page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">404</h1>
      <h2 className="mt-2 text-lg font-medium text-muted-foreground">Page not found</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/explore">
          <Button variant="outline">Explore businesses</Button>
        </Link>
      </div>
    </div>
  );
}
