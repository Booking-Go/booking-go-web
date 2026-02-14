'use server';

import { serverFetch, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Service } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for creating a new service under a business. */
export interface CreateServicePayload {
  name: string;
  description?: string;
  duration: number;
  price: number;
  depositAmount?: number;
  maxCapacity?: number;
  bufferTime?: number;
  displayOrder?: number;
  isActive?: boolean;
}

/** Partial update payload for an existing service. */
export type UpdateServicePayload = Partial<CreateServicePayload>;

// ─── Read operations ────────────────────────────────────────────────────────

/** List all services for a business. */
export async function getServicesByBusiness(businessId: string): Promise<ActionResult<Service[]>> {
  try {
    const data = await serverFetch<Service[]>(`/businesses/${businessId}/services`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch services',
    };
  }
}

/** Get a single service. */
export async function getService(
  businessId: string,
  serviceId: string
): Promise<ActionResult<Service>> {
  try {
    const data = await serverFetch<Service>(`/businesses/${businessId}/services/${serviceId}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch service',
    };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

/** Create a new service under a business. */
export async function createService(
  businessId: string,
  payload: CreateServicePayload
): Promise<ActionResult<Service>> {
  try {
    const data = await serverFetch<Service>(`/businesses/${businessId}/services`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create service',
    };
  }
}

/** Update an existing service. */
export async function updateService(
  businessId: string,
  serviceId: string,
  payload: UpdateServicePayload
): Promise<ActionResult<Service>> {
  try {
    const data = await serverFetch<Service>(`/businesses/${businessId}/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update service',
    };
  }
}

/** Delete a service. */
export async function deleteService(
  businessId: string,
  serviceId: string
): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/businesses/${businessId}/services/${serviceId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete service',
    };
  }
}
