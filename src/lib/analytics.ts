import apiClient from './api';
import type { BusinessAnalytics, RevenueReport } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API calls ──────────────────────────────────────────────────────────────

/**
 * Client-side analytics API calls.
 */
export const analyticsApi = {
  /**
   * Fetch comprehensive dashboard analytics for a business.
   *
   * @param businessId - UUID of the business
   * @param period - '7d' | '30d' | '90d' | '365d' | 'all' (fallback preset)
   * @param startDate - Optional ISO date string (YYYY-MM-DD) for custom range
   * @param endDate - Optional ISO date string (YYYY-MM-DD) for custom range
   * @returns Business analytics payload
   */
  async getDashboard(
    businessId: string,
    period = '30d',
    startDate?: string,
    endDate?: string
  ): Promise<BusinessAnalytics> {
    const params: Record<string, string> = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const { data } = await apiClient.get<ApiResponse<BusinessAnalytics>>(
      `/businesses/${businessId}/analytics`,
      { params }
    );
    return data.data;
  },

  /**
   * Fetch revenue report for a date range (for export).
   *
   * @param businessId - UUID of the business
   * @param startDate - ISO date string (YYYY-MM-DD)
   * @param endDate - ISO date string (YYYY-MM-DD)
   * @returns Revenue report payload
   */
  async getRevenueReport(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<RevenueReport> {
    const { data } = await apiClient.get<ApiResponse<RevenueReport>>(
      `/businesses/${businessId}/analytics/report`,
      { params: { startDate, endDate } }
    );
    return data.data;
  },
};
