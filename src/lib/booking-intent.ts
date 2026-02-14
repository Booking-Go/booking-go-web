/**
 * Booking intent — persists the user's selected service + slot to sessionStorage
 * so they can pick up exactly where they left off after signing in / signing up.
 *
 * Uses sessionStorage (auto-clears when tab closes — no stale intents).
 */

const STORAGE_KEY = 'booking-intent';

/** Shape of a saved booking intent. */
export interface BookingIntent {
  /** Business slug used in the URL */
  businessSlug: string;
  /** Selected service ID */
  serviceId: string;
  /** Selected date (YYYY-MM-DD) */
  date: string;
  /** Selected slot ID */
  slotId: string;
  /** Timestamp when the intent was saved (for optional staleness checks) */
  savedAt: number;
}

/**
 * Save a booking intent to sessionStorage.
 * @param intent - The booking details to persist
 */
export const saveBookingIntent = (intent: Omit<BookingIntent, 'savedAt'>): void => {
  try {
    const payload: BookingIntent = { ...intent, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable (SSR, private browsing quota)
  }
};

/**
 * Read and clear the saved booking intent.
 * Returns `null` if none exists or if it's older than 30 minutes.
 */
export const consumeBookingIntent = (businessSlug: string): BookingIntent | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const intent: BookingIntent = JSON.parse(raw);

    // Only consume if it matches the current business page
    if (intent.businessSlug !== businessSlug) return null;

    // Discard intents older than 30 minutes
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (Date.now() - intent.savedAt > THIRTY_MINUTES) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Clear after reading (one-time use)
    sessionStorage.removeItem(STORAGE_KEY);
    return intent;
  } catch {
    return null;
  }
};

/**
 * Clear any saved booking intent without returning it.
 */
export const clearBookingIntent = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};
