import { PageHeaderSkeleton, StatCardSkeleton, ChartSkeleton } from '@/components/shared/skeletons';

/**
 * Analytics page skeleton — KPI cards + charts layout.
 */
export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <ChartSkeleton className="w-full" />
    </div>
  );
}
