import apiClient from './api';
import type { Booking, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for creating a new booking. */
export interface CreateBookingPayload {
  slotId: string;
  numberOfPeople?: number;
  notes?: string;
}

/** Payload for cancelling an existing booking. */
export interface CancelBookingPayload {
  reason?: string;
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

// ─── API calls ──────────────────────────────────────────────────────────────

export const bookingApi = {
  /** List bookings (role-aware: customer sees own, owner sees business bookings) */
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ bookings: Booking[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<Booking[]>>('/bookings', { params });
    return { bookings: data.data, meta: data.meta };
  },

  /** Get a single booking */
  async getById(id: string): Promise<Booking> {
    const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return data.data;
  },

  /** Create a booking */
  async create(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
    return data.data;
  },

  /** Update booking (notes) */
  async update(id: string, payload: { notes?: string }): Promise<Booking> {
    const { data } = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}`, payload);
    return data.data;
  },

  /** Confirm a booking (owner) */
  async confirm(id: string): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
    return data.data;
  },

  /** Cancel a booking */
  async cancel(id: string, payload?: CancelBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, payload || {});
    return data.data;
  },

  /** Complete a booking (owner) */
  async complete(id: string): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/complete`);
    return data.data;
  },
};
