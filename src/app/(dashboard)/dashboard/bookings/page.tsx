import type { Metadata } from 'next';
import { serverFetchPaginated } from '@/lib/server-api';
import { BookingList } from './_components/list';
import type { Booking, PaginationMeta } from '@/types';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Bookings',
};

/**
 * Bookings page — Server Component.
 * Fetches the initial booking list server-side so data is available on first render.
 */
export default async function BookingsPage() {
  let bookings: Booking[] = [];
  let meta: PaginationMeta = { total: 0, page: 1, limit: 20, totalPages: 0 };
  let userRole = 'customer';

  try {
    const result = await serverFetchPaginated<Booking[]>('/bookings?page=1&limit=20');
    bookings = result.data;
    meta = result.meta;
  } catch {
    // Fallback to empty — client component can retry
  }

  // Read user role from the auth cookie payload (Zustand persists user in localStorage,
  // but for SSR we decode the JWT to get the role)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role || 'customer';
    }
  } catch {
    // Fallback to customer role
  }

  return <BookingList initialBookings={bookings} initialMeta={meta} userRole={userRole} />;
}
