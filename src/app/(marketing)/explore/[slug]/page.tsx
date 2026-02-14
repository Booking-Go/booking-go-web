import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BusinessDetail } from './_components/detail';
import type { Business, BusinessHours, Service } from '@/types';

const BACKEND_URL = process.env.BACKEND_URL!;

/**
 * Fetches data from the backend without auth (public endpoints).
 * Used by both generateMetadata and the page component.
 */
async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const body = await res.json();
  return body.data as T;
}

/**
 * Generates SEO metadata for the business detail page.
 * Runs server-side — search engines see the business name, description, and category.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const business = await fetchPublic<Business>(`/businesses/slug/${slug}`);

    return {
      title: `${business.name} — Booking Go`,
      description:
        business.description ||
        `Book services at ${business.name} — ${business.category} in ${business.city}.`,
      openGraph: {
        title: business.name,
        description: business.description || `${business.category} in ${business.city}`,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Business — Booking Go',
    };
  }
}

/**
 * Business detail page — Server Component.
 * Fetches business, hours, and services server-side for instant rendering + SEO.
 * Passes data to the client component which handles booking flow and interactivity.
 */
export default async function BusinessPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let business: Business;
  try {
    business = await fetchPublic<Business>(`/businesses/slug/${slug}`);
  } catch {
    notFound();
  }

  // Fetch hours and services in parallel
  const [hours, services] = await Promise.all([
    fetchPublic<BusinessHours[]>(`/businesses/${business.id}/hours`).catch(
      () => [] as BusinessHours[]
    ),
    fetchPublic<Service[]>(`/businesses/${business.id}/services`).catch(() => [] as Service[]),
  ]);

  return (
    <BusinessDetail initialBusiness={business} initialHours={hours} initialServices={services} />
  );
}
