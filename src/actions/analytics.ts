'use server';

import { serverFetch, type ActionResult } from '@/lib/server-api';
import type { BusinessAnalytics, RevenueReport } from '@/types';

/**
 * Fetch comprehensive dashboard analytics for a business.
 * @param businessId - UUID of the business
 * @param period - '7d' | '30d' | '90d' | '365d' | 'all'
 * @param startDate - Optional ISO date string (YYYY-MM-DD) for custom range
 * @param endDate - Optional ISO date string (YYYY-MM-DD) for custom range
 */
export async function getDashboardAnalytics(
  businessId: string,
  period = '30d',
  startDate?: string,
  endDate?: string
): Promise<ActionResult<BusinessAnalytics>> {
  try {
    const searchParams = new URLSearchParams({ period });
    if (startDate) searchParams.set('startDate', startDate);
    if (endDate) searchParams.set('endDate', endDate);

    const data = await serverFetch<BusinessAnalytics>(
      `/businesses/${businessId}/analytics?${searchParams.toString()}`
    );
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch analytics',
    };
  }
}

/**
 * Fetch revenue report for a date range (for export).
 * @param businessId - UUID of the business
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate - ISO date string (YYYY-MM-DD)
 */
export async function getRevenueReport(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<ActionResult<RevenueReport>> {
  try {
    const searchParams = new URLSearchParams({ startDate, endDate });
    const data = await serverFetch<RevenueReport>(
      `/businesses/${businessId}/analytics/report?${searchParams.toString()}`
    );
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch revenue report',
    };
  }
}
