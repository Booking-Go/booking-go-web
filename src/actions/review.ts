'use server';

import { serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import type { Review, ReviewMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReviewsResult {
  reviews: Review[];
  meta: ReviewMeta;
}

// ─── Read operations ────────────────────────────────────────────────────────

/** Get published reviews for a business with pagination. */
export async function getBusinessReviews(
  businessId: string,
  params?: { page?: number; limit?: number }
): Promise<ActionResult<ReviewsResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<Review[], ReviewMeta>(
      `/businesses/${businessId}/reviews${qs ? `?${qs}` : ''}`
    );
    return { success: true, data: { reviews: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch reviews',
    };
  }
}
