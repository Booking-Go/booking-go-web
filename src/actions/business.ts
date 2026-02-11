'use server';

import { serverFetch, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Business, BusinessHours, BusinessHoliday } from '@/types';

// ─── Read operations ────────────────────────────────────────────────────────

export async function getMyBusinesses(): Promise<ActionResult<Business[]>> {
  try {
    const data = await serverFetch<Business[]>('/businesses/mine');
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch businesses' };
  }
}

export async function getBusinessById(id: string): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>(`/businesses/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch business' };
  }
}

export async function getBusinessHours(id: string): Promise<ActionResult<BusinessHours[]>> {
  try {
    const data = await serverFetch<BusinessHours[]>(`/businesses/${id}/hours`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch hours' };
  }
}

export async function getBusinessHolidays(id: string): Promise<ActionResult<BusinessHoliday[]>> {
  try {
    const data = await serverFetch<BusinessHoliday[]>(`/businesses/${id}/holidays`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch holidays' };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

export async function createBusiness(payload: Record<string, unknown>): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create business' };
  }
}

export async function updateBusiness(
  id: string,
  payload: Record<string, unknown>,
): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    revalidatePath(`/dashboard/businesses/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update business' };
  }
}

export async function deleteBusiness(id: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/businesses/${id}`, { method: 'DELETE' });
    revalidatePath('/dashboard/businesses');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete business' };
  }
}

export async function setBusinessHours(
  id: string,
  hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>,
): Promise<ActionResult<BusinessHours[]>> {
  try {
    const data = await serverFetch<BusinessHours[]>(`/businesses/${id}/hours`, {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save hours' };
  }
}

export async function addBusinessHoliday(
  id: string,
  payload: { date: string; reason?: string },
): Promise<ActionResult<BusinessHoliday>> {
  try {
    const data = await serverFetch<BusinessHoliday>(`/businesses/${id}/holidays`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath(`/dashboard/businesses/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add holiday' };
  }
}

export async function removeBusinessHoliday(
  businessId: string,
  holidayId: string,
): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/businesses/${businessId}/holidays/${holidayId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove holiday' };
  }
}
