'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '@/lib/use-push-notifications';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

/**
 * Global push notification initializer.
 * - Auto-subscribes if permission was already granted.
 * - Shows a non-intrusive banner prompting the user to enable notifications
 *   if permission is still 'default'.
 * - Mount this inside an authenticated layout (e.g. dashboard layout).
 */
export function PushNotificationBanner() {
  const { user } = useAuthStore();
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Check if user previously dismissed the banner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('push-banner-dismissed');
      if (stored === 'true') setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  const handleEnable = async () => {
    await requestPermission();
    setDismissed(true);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  // Don't show if not supported, already granted/denied, dismissed, or not logged in
  if (!isSupported || permission !== 'default' || dismissed || !user) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Enable push notifications</p>
        <p className="text-xs text-muted-foreground">
          Get instant alerts for new bookings, confirmations, and updates.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Later
        </Button>
        <Button size="sm" onClick={handleEnable}>
          Enable
        </Button>
      </div>
    </div>
  );
}
