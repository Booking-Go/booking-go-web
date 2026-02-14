'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Business, BusinessHours, BusinessHoliday, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** A business result with distance information (nearby search). */
export interface NearbyBusiness extends Business {
  distanceKm: number;
}

interface BusinessListResult {
  businesses: Business[];
  meta: PaginationMeta;
}

interface NearbyBusinessResult {
  businesses: NearbyBusiness[];
  meta: PaginationMeta;
}

// ─── Read operations ────────────────────────────────────────────────────────

/** List all active businesses with optional filters and pagination. */
export async function listBusinesses(params?: {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  search?: string;
}): Promise<ActionResult<BusinessListResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.city) searchParams.set('city', params.city);
    if (params?.state) searchParams.set('state', params.state);
    if (params?.country) searchParams.set('country', params.country);
    if (params?.search) searchParams.set('search', params.search);

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<Business[]>(`/businesses${qs ? `?${qs}` : ''}`);
    return { success: true, data: { businesses: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch businesses',
    };
  }
}

/** Find nearby businesses sorted by distance from given coordinates. */
export async function getNearbyBusinesses(params: {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<ActionResult<NearbyBusinessResult>> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('lat', String(params.lat));
    searchParams.set('lng', String(params.lng));
    if (params.radius) searchParams.set('radius', String(params.radius));
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);

    const result = await serverFetchPaginated<NearbyBusiness[]>(
      `/businesses/nearby?${searchParams.toString()}`
    );
    return { success: true, data: { businesses: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch nearby businesses',
    };
  }
}

export async function getMyBusinesses(): Promise<ActionResult<Business[]>> {
  try {
    const data = await serverFetch<Business[]>('/businesses/mine');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch businesses',
    };
  }
}

export async function getBusinessById(id: string): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>(`/businesses/${id}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch business',
    };
  }
}

/** Get a business by its URL slug. */
export async function getBusinessBySlug(slug: string): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>(`/businesses/slug/${slug}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch business',
    };
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
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch holidays',
    };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

export async function createBusiness(
  payload: Record<string, unknown>
): Promise<ActionResult<Business>> {
  try {
    const data = await serverFetch<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath('/dashboard/businesses');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create business',
    };
  }
}

export async function updateBusiness(
  id: string,
  payload: Record<string, unknown>
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
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update business',
    };
  }
}

export async function deleteBusiness(id: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/businesses/${id}`, { method: 'DELETE' });
    revalidatePath('/dashboard/businesses');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete business',
    };
  }
}

export async function setBusinessHours(
  id: string,
  hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>
): Promise<ActionResult<BusinessHours[]>> {
  try {
    const data = await serverFetch<BusinessHours[]>(`/businesses/${id}/hours`, {
      method: 'PUT',
      body: JSON.stringify(hours),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save hours' };
  }
}

export async function addBusinessHoliday(
  id: string,
  payload: { date: string; reason?: string }
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
  holidayId: string
): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/businesses/${businessId}/holidays/${holidayId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove holiday',
    };
  }
}
