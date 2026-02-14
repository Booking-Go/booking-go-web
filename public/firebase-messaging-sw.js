// Firebase Messaging Service Worker
// This file MUST be at the public root to intercept push events.
// It's loaded by the browser, NOT by Next.js bundling.

/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

// Firebase config is injected at runtime via the query string
// when the service worker is registered. Fallback to empty object.
const urlParams = new URL(location.href).searchParams;
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || '',
  authDomain: urlParams.get('authDomain') || '',
  projectId: urlParams.get('projectId') || '',
  storageBucket: urlParams.get('storageBucket') || '',
  messagingSenderId: urlParams.get('messagingSenderId') || '',
  appId: urlParams.get('appId') || '',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const notificationTitle = title || 'Booking.go';
  const notificationOptions = {
    body: body || 'You have a new notification',
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: payload.data?.notificationId || 'default',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/dashboard/notifications';

  // Route based on notification type
  if (data.type === 'booking_created' || data.type === 'booking_confirmed') {
    url = '/dashboard/bookings';
  } else if (data.type === 'review_received') {
    url = '/dashboard/analytics';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    }),
  );
});
