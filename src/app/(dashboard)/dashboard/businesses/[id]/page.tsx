import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-api';
import { BusinessEditor } from './_components/editor';
import type { Business, BusinessHours, BusinessHoliday } from '@/types';

export const metadata: Metadata = {
  title: 'Business Details',
};

/**
 * Business detail page — Server Component.
 * Fetches business, hours, and holidays server-side, then passes to the client editor.
 */
export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const [business, hours, holidays] = await Promise.all([
      serverFetch<Business>(`/businesses/${id}`),
      serverFetch<BusinessHours[]>(`/businesses/${id}/hours`),
      serverFetch<BusinessHoliday[]>(`/businesses/${id}/holidays`),
    ]);

    return (
      <BusinessEditor initialBusiness={business} initialHours={hours} initialHolidays={holidays} />
    );
  } catch {
    notFound();
  }
}
