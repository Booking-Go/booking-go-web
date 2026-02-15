import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-api';
import { BusinessList } from './_components/list';
import type { Business } from '@/types';

export const metadata: Metadata = {
  title: 'My Businesses',
};

/**
 * My Businesses page — Server Component.
 * Fetches the business list server-side for instant rendering.
 */
export default async function BusinessesPage() {
  let businesses: Business[] = [];

  try {
    businesses = await serverFetch<Business[]>('/businesses/mine');
  } catch {
    // Fallback to empty — user will see the empty state
  }

  return <BusinessList initialBusinesses={businesses} />;
}
