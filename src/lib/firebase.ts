import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

/**
 * Firebase client configuration.
 * All values come from NEXT_PUBLIC_ env vars set in .env / docker-compose.
 *
 * These are **public** keys (safe to expose in client bundles).
 * The private service account key lives only on the engine.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Initialize Firebase app (singleton). */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Returns the Firebase Messaging instance if the browser supports it.
 * Returns null on the server or in unsupported browsers.
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
};

export default app;
