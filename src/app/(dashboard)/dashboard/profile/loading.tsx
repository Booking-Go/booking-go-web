import { PageHeaderSkeleton, FormFieldSkeleton } from '@/components/shared/skeletons';

/**
 * Profile page skeleton — form layout.
 */
export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card p-8">
        {/* Avatar skeleton */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <FormFieldSkeleton count={4} />
        <div className="mt-8 h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
