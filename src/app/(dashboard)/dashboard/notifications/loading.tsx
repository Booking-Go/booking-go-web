import { PageHeaderSkeleton, NotificationSkeleton } from '@/components/shared/skeletons';

/**
 * Notifications page skeleton.
 */
export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="rounded-2xl border border-border/60 bg-card">
        <div className="divide-y divide-border/40">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      </div>
    </div>
  );
}
