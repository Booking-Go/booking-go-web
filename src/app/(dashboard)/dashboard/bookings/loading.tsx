import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton, ListItemSkeleton } from '@/components/shared/skeletons';

/**
 * Bookings list page skeleton — filter bar + table.
 */
export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Booking list */}
      <div className="rounded-2xl border border-border/60 bg-card">
        <div className="divide-y divide-border/40">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
