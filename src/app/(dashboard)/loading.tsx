import { Loading } from '@/components/shared';

/**
 * Route-level loading UI for the (dashboard) group.
 * Automatically shown by Next.js via Suspense boundaries while
 * navigating between dashboard pages.
 */
export default function DashboardLoading() {
  return <Loading text="Loading..." />;
}
