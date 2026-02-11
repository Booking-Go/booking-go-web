import apiClient from './api';
import type { Business, BusinessHours, BusinessHoliday, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for creating a new business. */
export interface CreateBusinessPayload {
  name: string;
  slug: string;
  description?: string;
  category: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website?: string;
  timezone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  settings?: Record<string, unknown>;
}

/** Partial update payload for an existing business. */
export type UpdateBusinessPayload = Partial<CreateBusinessPayload>;

/** Payload for setting a single day's business hours. */
export interface BusinessHoursPayload {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

/** Payload for adding a business holiday. */
export interface BusinessHolidayPayload {
  date: string;
  reason?: string;
}

/** Query parameters for paginated business listing. */
export interface BusinessListParams {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  search?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const businessApi = {
  /** Lists all active businesses with optional filters and pagination. */
  async list(params: BusinessListParams = {}): Promise<{ businesses: Business[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<ApiResponse<Business[]>>('/businesses', { params });
    return { businesses: data.data, meta: data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 } };
  },

  /** Gets businesses owned by the currently authenticated user. */
  async getMyBusinesses(): Promise<Business[]> {
    const { data } = await apiClient.get<ApiResponse<Business[]>>('/businesses/mine');
    return data.data;
  },

  /** Gets a business by its UUID. */
  async getById(id: string): Promise<Business> {
    const { data } = await apiClient.get<ApiResponse<Business>>(`/businesses/${id}`);
    return data.data;
  },

  /** Gets a business by its URL slug. */
  async getBySlug(slug: string): Promise<Business> {
    const { data } = await apiClient.get<ApiResponse<Business>>(`/businesses/slug/${slug}`);
    return data.data;
  },

  /** Creates a new business. */
  async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await apiClient.post<ApiResponse<Business>>('/businesses', payload);
    return data.data;
  },

  /** Updates an existing business by ID. */
  async update(id: string, payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await apiClient.put<ApiResponse<Business>>(`/businesses/${id}`, payload);
    return data.data;
  },

  /** Deletes a business by ID. */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/businesses/${id}`);
  },

  // --- Business Hours ---

  /** Gets the operating hours for a business. */
  async getHours(businessId: string): Promise<BusinessHours[]> {
    const { data } = await apiClient.get<ApiResponse<BusinessHours[]>>(`/businesses/${businessId}/hours`);
    return data.data;
  },

  /** Sets (replaces) the operating hours for a business. */
  async setHours(businessId: string, hours: BusinessHoursPayload[]): Promise<BusinessHours[]> {
    const { data } = await apiClient.put<ApiResponse<BusinessHours[]>>(`/businesses/${businessId}/hours`, hours);
    return data.data;
  },

  // --- Business Holidays ---

  /** Gets all holidays for a business. */
  async getHolidays(businessId: string): Promise<BusinessHoliday[]> {
    const { data } = await apiClient.get<ApiResponse<BusinessHoliday[]>>(`/businesses/${businessId}/holidays`);
    return data.data;
  },

  /** Adds a holiday date for a business. */
  async addHoliday(businessId: string, payload: BusinessHolidayPayload): Promise<BusinessHoliday> {
    const { data } = await apiClient.post<ApiResponse<BusinessHoliday>>(`/businesses/${businessId}/holidays`, payload);
    return data.data;
  },

  /** Removes a holiday by ID for the given business. */
  async removeHoliday(businessId: string, holidayId: string): Promise<void> {
    await apiClient.delete(`/businesses/${businessId}/holidays/${holidayId}`);
  },
};
