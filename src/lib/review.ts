import apiClient from './api';
import type { Review, ReviewMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload for submitting a review. */
export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T;
  meta: ReviewMeta;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const reviewApi = {
  /** Submit a review for a completed booking. */
  async create(bookingId: string, payload: CreateReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<ApiResponse<Review>>(
      `/bookings/${bookingId}/review`,
      payload,
    );
    return data.data;
  },

  /** Get published reviews for a business with pagination. */
  async getByBusiness(
    businessId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ reviews: Review[]; meta: ReviewMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<Review[]>>(
      `/businesses/${businessId}/reviews`,
      { params },
    );
    return { reviews: data.data, meta: data.meta };
  },
};
