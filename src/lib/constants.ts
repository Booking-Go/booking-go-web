/**
 * Application-wide constants — single source of truth for status values, roles, and UI config.
 * These mirror the CHECK constraints in PostgreSQL and the backend enums in
 * `booking-go-engine/src/core/constants/enums.ts`.
 */

// ─── User Roles ─────────────────────────────────────────────────────────────

export const UserRole = {
  CUSTOMER: 'customer',
  BUSINESS_OWNER: 'business_owner',
  ADMIN: 'admin',
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

/** Human-readable labels for each user role. */
export const USER_ROLE_LABELS: Record<UserRoleValue, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.BUSINESS_OWNER]: 'Business Owner',
  [UserRole.ADMIN]: 'Admin',
};

// ─── Booking Status ─────────────────────────────────────────────────────────

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

export type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus];

/** All booking status values as an array — useful for filters / selects. */
export const BOOKING_STATUS_VALUES = Object.values(BookingStatus);

/** Human-readable labels for each booking status. */
export const BOOKING_STATUS_LABELS: Record<BookingStatusValue, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.NO_SHOW]: 'No Show',
};

/** Descriptions for tooltip / accessibility text. */
export const BOOKING_STATUS_DESCRIPTIONS: Record<BookingStatusValue, string> = {
  [BookingStatus.PENDING]: 'Awaiting confirmation from the business',
  [BookingStatus.CONFIRMED]: 'Booking has been confirmed',
  [BookingStatus.CANCELLED]: 'Booking was cancelled',
  [BookingStatus.COMPLETED]: 'Service was delivered successfully',
  [BookingStatus.NO_SHOW]: 'Customer did not show up',
};

/** Badge variant to use for each booking status (shadcn Badge `variant` prop). */
export const BOOKING_STATUS_VARIANTS: Record<
  BookingStatusValue,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [BookingStatus.PENDING]: 'outline',
  [BookingStatus.CONFIRMED]: 'default',
  [BookingStatus.CANCELLED]: 'destructive',
  [BookingStatus.COMPLETED]: 'secondary',
  [BookingStatus.NO_SHOW]: 'destructive',
};

/** Tailwind class strings for full-custom status badges (bg + text + dark mode). */
export const BOOKING_STATUS_STYLES: Record<BookingStatusValue, string> = {
  [BookingStatus.PENDING]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [BookingStatus.NO_SHOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

/** Filter options for status select dropdowns (includes "all"). */
export const BOOKING_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Bookings' },
  ...BOOKING_STATUS_VALUES.filter((s) => s !== BookingStatus.NO_SHOW).map((s) => ({
    value: s,
    label: BOOKING_STATUS_LABELS[s],
  })),
];

// ─── Slot Status ────────────────────────────────────────────────────────────

export const SlotStatus = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BLOCKED: 'blocked',
} as const;

export type SlotStatusValue = (typeof SlotStatus)[keyof typeof SlotStatus];

export const SLOT_STATUS_LABELS: Record<SlotStatusValue, string> = {
  [SlotStatus.AVAILABLE]: 'Available',
  [SlotStatus.BOOKED]: 'Booked',
  [SlotStatus.BLOCKED]: 'Blocked',
};

// ─── Notification Type ──────────────────────────────────────────────────────

export const NotificationType = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_REMINDER: 'booking_reminder',
  REVIEW_RECEIVED: 'review_received',
  BUSINESS_UPDATE: 'business_update',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

// ─── Sender Role (Chat Messages) ───────────────────────────────────────────

export const SenderRole = {
  CUSTOMER: 'customer',
  BUSINESS_OWNER: 'business_owner',
} as const;

export type SenderRoleValue = (typeof SenderRole)[keyof typeof SenderRole];

// ─── Cancel Source ──────────────────────────────────────────────────────────

export const CancelledBy = {
  CUSTOMER: 'customer',
  BUSINESS: 'business',
  SYSTEM: 'system',
} as const;

export type CancelledByValue = (typeof CancelledBy)[keyof typeof CancelledBy];
