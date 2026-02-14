'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Slot, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for creating a single slot. */
export interface CreateSlotPayload {
  businessId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  price: number;
  notes?: string;
}

/** Payload for bulk-creating slots across a date range. */
export interface BulkCreateSlotsPayload {
  businessId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  timeSlots?: { startTime: string; endTime: string }[];
  daysOfWeek?: number[];
  capacity?: number;
  price: number;
}

/** Partial update payload for an existing slot. */
export interface UpdateSlotPayload {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  price?: number;
  isAvailable?: boolean;
  notes?: string;
}

interface SlotsResult {
  slots: Slot[];
  meta: PaginationMeta;
}

interface BulkCreateResult {
  created: number;
  message: string;
}

// ─── Read operations ────────────────────────────────────────────────────────

/** Get available slots (public). */
export async function getAvailableSlots(params: {
  businessId: string;
  serviceId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<Slot[]>> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('businessId', params.businessId);
    if (params.serviceId) searchParams.set('serviceId', params.serviceId);
    if (params.date) searchParams.set('date', params.date);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const data = await serverFetch<Slot[]>(`/slots/available?${searchParams.toString()}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch available slots',
    };
  }
}

/** List slots for a business (owner view, paginated). */
export async function getSlots(params: {
  businessId: string;
  page?: number;
  limit?: number;
  serviceId?: string;
  date?: string;
  isAvailable?: boolean;
}): Promise<ActionResult<SlotsResult>> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('businessId', params.businessId);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.serviceId) searchParams.set('serviceId', params.serviceId);
    if (params.date) searchParams.set('date', params.date);
    if (params.isAvailable !== undefined)
      searchParams.set('isAvailable', String(params.isAvailable));

    const result = await serverFetchPaginated<Slot[]>(`/slots?${searchParams.toString()}`);
    return { success: true, data: { slots: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch slots' };
  }
}

/** Get a single slot by ID. */
export async function getSlot(id: string): Promise<ActionResult<Slot>> {
  try {
    const data = await serverFetch<Slot>(`/slots/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch slot' };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

/** Create a single slot. */
export async function createSlot(payload: CreateSlotPayload): Promise<ActionResult<Slot>> {
  try {
    const data = await serverFetch<Slot>('/slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create slot' };
  }
}

/** Bulk create slots (auto-generate from business hours). */
export async function bulkCreateSlots(
  payload: BulkCreateSlotsPayload
): Promise<ActionResult<BulkCreateResult>> {
  try {
    const data = await serverFetch<BulkCreateResult>('/slots/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to bulk create slots',
    };
  }
}

/** Update a slot. */
export async function updateSlot(
  id: string,
  payload: UpdateSlotPayload
): Promise<ActionResult<Slot>> {
  try {
    const data = await serverFetch<Slot>(`/slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update slot' };
  }
}

/** Delete a slot. */
export async function deleteSlot(id: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/slots/${id}`, { method: 'DELETE' });
    revalidatePath('/dashboard/businesses');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete slot' };
  }
}
