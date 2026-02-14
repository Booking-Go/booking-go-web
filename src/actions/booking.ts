'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Booking, PaginationMeta } from '@/types';

interface BookingsResult {
  bookings: Booking[];
  meta: PaginationMeta;
}

/**
 * Fetches bookings for the authenticated user (server-side).
 * Role-aware: customer sees own, owner sees business bookings.
 */
export async function getBookings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<BookingsResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<Booking[]>(`/bookings${qs ? `?${qs}` : ''}`);
    return { success: true, data: { bookings: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch bookings',
    };
  }
}

/** Get a single booking by ID. */
export async function getBooking(id: string): Promise<ActionResult<Booking>> {
  try {
    const data = await serverFetch<Booking>(`/bookings/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch booking',
    };
  }
}

/** Create a new booking. */
export async function createBooking(payload: {
  slotId: string;
  numberOfPeople?: number;
  notes?: string;
}): Promise<ActionResult<Booking>> {
  try {
    const data = await serverFetch<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/bookings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create booking',
    };
  }
}

/** Confirm a booking (owner). */
export async function confirmBooking(id: string): Promise<ActionResult<Booking>> {
  try {
    const data = await serverFetch<Booking>(`/bookings/${id}/confirm`, { method: 'POST' });
    revalidatePath('/dashboard/bookings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to confirm booking',
    };
  }
}

/** Cancel a booking. */
export async function cancelBooking(
  id: string,
  payload?: { reason?: string }
): Promise<ActionResult<Booking>> {
  try {
    const data = await serverFetch<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
    revalidatePath('/dashboard/bookings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to cancel booking',
    };
  }
}

/** Complete a booking (owner). */
export async function completeBooking(id: string): Promise<ActionResult<Booking>> {
  try {
    const data = await serverFetch<Booking>(`/bookings/${id}/complete`, { method: 'POST' });
    revalidatePath('/dashboard/bookings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to complete booking',
    };
  }
}

/** Submit a review for a completed booking. */
export async function createReview(
  bookingId: string,
  payload: { rating: number; comment?: string }
): Promise<ActionResult<unknown>> {
  try {
    const data = await serverFetch(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/bookings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit review',
    };
  }
}
