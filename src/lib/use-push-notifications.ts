'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { notificationApi } from '@/lib/notification';
import { useAuthStore } from '@/store/authStore';

/** Push notification permission state. */
type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushNotificationsReturn {
  /** Current permission state */
  permission: PushPermission;
  /** Whether push is supported in this browser */
  isSupported: boolean;
  /** Request permission and register the FCM token */
  requestPermission: () => Promise<void>;
  /** Whether a foreground message was just received */
  lastMessage: MessagePayload | null;
}

/**
 * Hook that manages Firebase Cloud Messaging push notifications.
 *
 * - Registers the service worker with Firebase config
 * - Requests notification permission
 * - Obtains FCM token and registers it with the backend
 * - Listens for foreground messages via `onMessage`
 *
 * @example
 * ```tsx
 * const { permission, requestPermission } = usePushNotifications();
 * ```
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuthStore();
  const [permission, setPermission] = useState<PushPermission>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [lastMessage, setLastMessage] = useState<MessagePayload | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const registeredTokenRef = useRef<string | null>(null);

  // Check browser support on mount
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      setIsSupported(false);
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermission);
  }, []);

  /**
   * Registers the Firebase Messaging service worker with config injected
   * via query string (since SW files can't access process.env).
   */
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;

    const params = new URLSearchParams({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    });

    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params.toString()}`
    );

    return registration;
  }, []);

  /**
   * Requests notification permission, obtains the FCM token,
   * and registers it with the backend.
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported || !user) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);

      if (result !== 'granted') return;

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const swRegistration = await registerServiceWorker();
      if (!swRegistration) return;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (token && token !== registeredTokenRef.current) {
        await notificationApi.registerDeviceToken(token, 'web');
        registeredTokenRef.current = token;
      }
    } catch (err) {
      console.error('Failed to setup push notifications:', err);
    }
  }, [isSupported, user, registerServiceWorker]);

  // Auto-register if permission is already granted
  useEffect(() => {
    if (permission === 'granted' && user) {
      requestPermission();
    }
  }, [permission, user, requestPermission]);

  // Listen for foreground messages
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    let cancelled = false;

    const setupListener = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;

      const unsubscribe = onMessage(messaging, (payload) => {
        setLastMessage(payload);

        // Show a browser notification for foreground messages too
        if (payload.notification) {
          const { title, body } = payload.notification;
          new Notification(title ?? 'Booking.go', {
            body: body ?? 'You have a new notification',
            icon: '/favicon.ico',
          });
        }
      });

      unsubscribeRef.current = unsubscribe;
    };

    setupListener();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
  }, [user, permission]);

  return { permission, isSupported, requestPermission, lastMessage };
};
