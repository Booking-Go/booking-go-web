import { Skeleton } from '@/components/ui/skeleton';

/**
 * Marketing group loading skeleton — hero + content.
 */
export default function MarketingLoading() {
  return (
    <div className="min-h-[60vh] space-y-12 px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-96" />
        <Skeleton className="mx-auto h-5 w-80" />
        <Skeleton className="mx-auto h-5 w-64" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
