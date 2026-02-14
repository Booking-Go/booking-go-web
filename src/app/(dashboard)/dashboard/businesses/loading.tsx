import { PageHeaderSkeleton, BusinessCardSkeleton } from '@/components/shared/skeletons';

/**
 * Businesses list page skeleton.
 */
export default function BusinessesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BusinessCardSkeleton />
        <BusinessCardSkeleton />
        <BusinessCardSkeleton />
      </div>
    </div>
  );
}
