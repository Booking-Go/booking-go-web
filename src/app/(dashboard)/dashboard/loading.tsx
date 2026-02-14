import {
  PageHeaderSkeleton,
  StatCardSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  MetricTileSkeleton,
} from '@/components/shared/skeletons';

/**
 * Dashboard overview page skeleton — matches the full KPI + sections layout.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderSkeleton />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Middle row: Today's bookings + Pending actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="border-b border-border/40 px-6 py-4">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          </div>
          <div className="divide-y divide-border/40">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="border-b border-border/40 px-6 py-4">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="divide-y divide-border/40">
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>
      </div>

      {/* Bottom row: Performance + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricTileSkeleton />
            <MetricTileSkeleton />
            <MetricTileSkeleton />
          </div>
        </div>
        <CardSkeleton lines={5} />
      </div>
    </div>
  );
}
