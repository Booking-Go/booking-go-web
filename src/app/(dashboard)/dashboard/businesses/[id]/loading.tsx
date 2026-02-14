import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton, FormFieldSkeleton, CardSkeleton } from '@/components/shared/skeletons';

/**
 * Business detail/edit page skeleton — tabs with content areas.
 */
export default function BusinessDetailLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border/40">
        {['Details', 'Services', 'Business Hours', 'Slots'].map((tab) => (
          <Skeleton key={tab} className="h-9 w-24 rounded-t-lg" />
        ))}
      </div>

      {/* Tab content area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <FormFieldSkeleton count={4} />
        </div>
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
