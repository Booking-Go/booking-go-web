import { Skeleton } from '@/components/ui/skeleton';
import { BusinessDetailSkeleton } from '@/components/shared/skeletons';

/**
 * Explore business detail page skeleton.
 */
export default function ExploreDetailLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <BusinessDetailSkeleton />
    </div>
  );
}
