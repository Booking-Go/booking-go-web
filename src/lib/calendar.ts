/**
 * @module calendar
 *
 * Generates "Add to Calendar" links and ICS file downloads for bookings.
 * Supports Google Calendar (URL), Outlook Web (URL), and universal ICS
 * (Apple Calendar, Outlook Desktop, etc.).
 *
 * Conforms to RFC 5545 (iCalendar) including:
 * - Content line folding at 75 octets
 * - Proper text escaping (backslash, semicolon, comma, newline)
 * - CRLF line endings
 * - VALARM reminder component
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  /** Event title — e.g. "Haircut @ Glamour Studio" */
  title: string;
  /** ISO date string for the booking date (YYYY-MM-DD). */
  date: string;
  /** ISO datetime string for the start time. */
  startTime: string;
  /** ISO datetime string for the end time. */
  endTime: string;
  /** Optional event description. */
  description?: string;
  /** Optional location string. */
  location?: string;
}

/** Shape of the booking object accepted by `bookingToCalendarEvent`. */
interface BookingInput {
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  numberOfPeople?: number;
  business?: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  service?: {
    name: string;
    duration: number;
  } | null;
  customer?: {
    firstName: string;
    lastName: string;
  } | null;
}

/** Who is adding the event — determines the title/description perspective. */
export type CalendarPerspective = 'customer' | 'owner';

// ────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────

/** ISO date pattern: YYYY-MM-DD */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Validates that a string can be parsed to a finite Date.
 * Throws a descriptive error when validation fails.
 */
const assertValidDate = (value: string, label: string): void => {
  if (!value || !ISO_DATE_RE.test(value)) {
    throw new Error(`[calendar] Invalid ${label}: "${value}" — expected ISO date/datetime string.`);
  }
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) {
    throw new Error(`[calendar] Unparseable ${label}: "${value}".`);
  }
};

/**
 * Formats an ISO datetime string to the `YYYYMMDDTHHmmssZ` format
 * used by Google Calendar URLs and ICS DTSTART/DTEND properties.
 *
 * @param iso - ISO datetime string (e.g. "2026-02-15T10:30:00.000Z")
 * @returns UTC-normalized calendar timestamp
 */
const toCalendarDate = (iso: string): string => {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/**
 * Escapes special characters for ICS text values per RFC 5545 §3.3.11.
 * Characters that MUST be escaped: backslash, semicolon, comma, newline.
 */
const escapeIcsText = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/**
 * Folds a content line at 75 octets per RFC 5545 §3.1.
 * Continuation lines begin with a single space character.
 */
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;

  const parts: string[] = [];
  parts.push(line.slice(0, 75));
  let offset = 75;

  while (offset < line.length) {
    // Continuation lines: CRLF + space counts as part of the fold,
    // so subsequent chunks are max 74 chars (75 minus the leading space).
    parts.push(' ' + line.slice(offset, offset + 74));
    offset += 74;
  }

  return parts.join('\r\n');
};

/**
 * Sanitises a filename by replacing non-alphanumeric chars (except hyphens)
 * with hyphens, collapsing runs of hyphens, and trimming leading/trailing hyphens.
 */
const sanitizeFilename = (raw: string): string =>
  raw
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'event';

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

/**
 * Generates a Google Calendar "add event" URL.
 *
 * @param event - Calendar event details
 * @returns URL string that opens Google Calendar with a pre-filled event
 * @throws {Error} When startTime or endTime are invalid
 *
 * @example
 * ```ts
 * const url = googleCalendarUrl({
 *   title: 'Haircut',
 *   date: '2026-02-15',
 *   startTime: '2026-02-15T10:00:00Z',
 *   endTime: '2026-02-15T10:30:00Z',
 * });
 * window.open(url, '_blank');
 * ```
 */
export const googleCalendarUrl = (event: CalendarEvent): string => {
  assertValidDate(event.startTime, 'startTime');
  assertValidDate(event.endTime, 'endTime');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarDate(event.startTime)}/${toCalendarDate(event.endTime)}`,
  });

  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an Outlook Web "add event" URL.
 *
 * @param event - Calendar event details
 * @returns URL string that opens Outlook Web with a pre-filled event
 * @throws {Error} When startTime or endTime are invalid
 */
export const outlookCalendarUrl = (event: CalendarEvent): string => {
  assertValidDate(event.startTime, 'startTime');
  assertValidDate(event.endTime, 'endTime');

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.startTime).toISOString(),
    enddt: new Date(event.endTime).toISOString(),
  });

  if (event.description) params.set('body', event.description);
  if (event.location) params.set('location', event.location);

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
};

/**
 * Generates ICS file content per RFC 5545.
 * Works with Apple Calendar, Outlook Desktop, and any standards-compliant app.
 *
 * Features:
 * - Content line folding at 75 octets (RFC 5545 §3.1)
 * - Proper text escaping (RFC 5545 §3.3.11)
 * - VALARM component with 30-minute reminder
 * - Unique UID per event
 *
 * @param event - Calendar event details
 * @returns ICS file content as a string with CRLF line endings
 * @throws {Error} When startTime or endTime are invalid
 */
export const generateIcs = (event: CalendarEvent): string => {
  assertValidDate(event.startTime, 'startTime');
  assertValidDate(event.endTime, 'endTime');

  const uid = `${Date.now()}-${crypto.randomUUID()}@bookinggo`;
  const now = toCalendarDate(new Date().toISOString());

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Booking.go//Booking.go//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toCalendarDate(event.startTime)}`,
    `DTEND:${toCalendarDate(event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  if (event.description) {
    rawLines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  if (event.location) {
    rawLines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  rawLines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return rawLines.map(foldLine).join('\r\n');
};

/**
 * Triggers a browser download of an ICS file for the given event.
 * Cleans up the temporary object URL and DOM node after download.
 *
 * @param event - Calendar event details
 * @throws {Error} When called in a non-browser environment
 */
export const downloadIcs = (event: CalendarEvent): void => {
  if (typeof document === 'undefined') {
    throw new Error('[calendar] downloadIcs requires a browser environment.');
  }

  const content = generateIcs(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeFilename(event.title)}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Builds a CalendarEvent from a Booking object.
 * Adapts the title and description based on the viewer's perspective:
 *
 * - **customer**: "Haircut @ Glamour Studio" with service/price details
 * - **owner**: "Haircut — John Doe" with customer contact info
 *
 * @param booking - Booking data with optional business/service/customer joins
 * @param perspective - Who is adding the event: `'customer'` (default) or `'owner'`
 * @returns CalendarEvent ready for Google Calendar, Outlook, or ICS generation
 *
 * @example
 * ```ts
 * // Customer perspective (default)
 * const calEvent = bookingToCalendarEvent(booking);
 *
 * // Business owner perspective
 * const calEvent = bookingToCalendarEvent(booking, 'owner');
 * ```
 */
export const bookingToCalendarEvent = (
  booking: BookingInput,
  perspective: CalendarPerspective = 'customer'
): CalendarEvent => {
  const serviceName = booking.service?.name || 'Appointment';
  const businessName = booking.business?.name || '';

  // Build location from business address fields
  const locationParts: string[] = [];
  if (booking.business?.address) locationParts.push(booking.business.address);
  if (booking.business?.city) locationParts.push(booking.business.city);
  if (booking.business?.state) locationParts.push(booking.business.state);
  if (booking.business?.zipCode) locationParts.push(booking.business.zipCode);
  const location = locationParts.length > 0 ? locationParts.join(', ') : undefined;

  if (perspective === 'owner') {
    return buildOwnerEvent(booking, serviceName, location);
  }

  return buildCustomerEvent(booking, serviceName, businessName, location);
};

/** Calendar event from the customer's perspective — focuses on the business & service. */
const buildCustomerEvent = (
  booking: BookingInput,
  serviceName: string,
  businessName: string,
  location?: string
): CalendarEvent => {
  const title = businessName ? `${serviceName} @ ${businessName}` : serviceName;

  const descParts = ['Booking via Booking.go'];
  if (booking.service?.name) descParts.push(`Service: ${booking.service.name}`);
  if (booking.service?.duration) descParts.push(`Duration: ${booking.service.duration} min`);
  if (Number.isFinite(booking.totalPrice)) {
    descParts.push(`Total: \u20B9${booking.totalPrice.toFixed(2)}`);
  }
  if (booking.notes) descParts.push(`Notes: ${booking.notes}`);

  return {
    title,
    date: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    description: descParts.join('\n'),
    location,
  };
};

/** Calendar event from the business owner's perspective — focuses on the customer. */
const buildOwnerEvent = (
  booking: BookingInput,
  serviceName: string,
  location?: string
): CalendarEvent => {
  // Resolve customer display name
  const customerFullName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`.trim()
    : booking.customerName || 'Customer';

  const title = `${serviceName} — ${customerFullName}`;

  const descParts = ['Booking via Booking.go'];
  descParts.push(`Customer: ${customerFullName}`);
  if (booking.customerEmail) descParts.push(`Email: ${booking.customerEmail}`);
  if (booking.customerPhone) descParts.push(`Phone: ${booking.customerPhone}`);
  if (booking.numberOfPeople && booking.numberOfPeople > 1) {
    descParts.push(`Party size: ${booking.numberOfPeople}`);
  }
  descParts.push(''); // blank line separator
  if (booking.service?.name) descParts.push(`Service: ${booking.service.name}`);
  if (booking.service?.duration) descParts.push(`Duration: ${booking.service.duration} min`);
  if (Number.isFinite(booking.totalPrice)) {
    descParts.push(`Total: \u20B9${booking.totalPrice.toFixed(2)}`);
  }
  if (booking.notes) descParts.push(`Notes: ${booking.notes}`);

  return {
    title,
    date: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    description: descParts.join('\n'),
    location,
  };
};
