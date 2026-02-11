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
   * @param period - '7d' | '30d' | '90d' | '365d' | 'all'
   * @returns Business analytics payload
   */
  async getDashboard(businessId: string, period = '30d'): Promise<BusinessAnalytics> {
    const { data } = await apiClient.get<ApiResponse<BusinessAnalytics>>(
      `/businesses/${businessId}/analytics`,
      { params: { period } },
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
  async getRevenueReport(businessId: string, startDate: string, endDate: string): Promise<RevenueReport> {
    const { data } = await apiClient.get<ApiResponse<RevenueReport>>(
      `/businesses/${businessId}/analytics/report`,
      { params: { startDate, endDate } },
    );
    return data.data;
  },
};
