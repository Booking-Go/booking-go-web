import { PageHeaderSkeleton, FormFieldSkeleton } from '@/components/shared/skeletons';

/**
 * New business form page skeleton.
 */
export default function NewBusinessLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card p-8">
        <FormFieldSkeleton count={5} />
        <div className="mt-8 h-10 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
