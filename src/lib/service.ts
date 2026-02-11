import apiClient from './api';
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const serviceApi = {
  /** List all services for a business */
  async getByBusinessId(businessId: string): Promise<Service[]> {
    const { data } = await apiClient.get<ApiResponse<Service[]>>(
      `/businesses/${businessId}/services`,
    );
    return data.data;
  },

  /** Get a single service */
  async getById(businessId: string, serviceId: string): Promise<Service> {
    const { data } = await apiClient.get<ApiResponse<Service>>(
      `/businesses/${businessId}/services/${serviceId}`,
    );
    return data.data;
  },

  /** Create a new service */
  async create(businessId: string, payload: CreateServicePayload): Promise<Service> {
    const { data } = await apiClient.post<ApiResponse<Service>>(
      `/businesses/${businessId}/services`,
      payload,
    );
    return data.data;
  },

  /** Update a service */
  async update(
    businessId: string,
    serviceId: string,
    payload: UpdateServicePayload,
  ): Promise<Service> {
    const { data } = await apiClient.put<ApiResponse<Service>>(
      `/businesses/${businessId}/services/${serviceId}`,
      payload,
    );
    return data.data;
  },

  /** Delete a service */
  async delete(businessId: string, serviceId: string): Promise<void> {
    await apiClient.delete(`/businesses/${businessId}/services/${serviceId}`);
  },
};
