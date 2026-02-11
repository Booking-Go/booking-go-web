import apiClient from './api';
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T;
  meta: PaginationMeta;
}

interface BulkCreateResult {
  created: number;
  message: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const slotApi = {
  /** Get available slots (public) */
  async getAvailable(params: {
    businessId: string;
    serviceId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Slot[]> {
    const { data } = await apiClient.get<ApiResponse<Slot[]>>('/slots/available', { params });
    return data.data;
  },

  /** List slots for a business (owner view, paginated) */
  async list(params: {
    businessId: string;
    page?: number;
    limit?: number;
    serviceId?: string;
    date?: string;
    isAvailable?: boolean;
  }): Promise<{ slots: Slot[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<Slot[]>>('/slots', { params });
    return { slots: data.data, meta: data.meta };
  },

  /** Get a single slot */
  async getById(id: string): Promise<Slot> {
    const { data } = await apiClient.get<ApiResponse<Slot>>(`/slots/${id}`);
    return data.data;
  },

  /** Create a single slot */
  async create(payload: CreateSlotPayload): Promise<Slot> {
    const { data } = await apiClient.post<ApiResponse<Slot>>('/slots', payload);
    return data.data;
  },

  /** Bulk create slots (auto-generate from business hours) */
  async bulkCreate(payload: BulkCreateSlotsPayload): Promise<BulkCreateResult> {
    const { data } = await apiClient.post<ApiResponse<BulkCreateResult>>('/slots/bulk', payload);
    return data.data;
  },

  /** Update a slot */
  async update(id: string, payload: UpdateSlotPayload): Promise<Slot> {
    const { data } = await apiClient.put<ApiResponse<Slot>>(`/slots/${id}`, payload);
    return data.data;
  },

  /** Delete a slot */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/slots/${id}`);
  },
};
