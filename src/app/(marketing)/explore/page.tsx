import type { Metadata } from 'next';
import { ExploreGrid } from './_components/grid';

export const metadata: Metadata = {
  title: 'Explore Businesses | Booking Go',
  description:
    'Discover and book services from top-rated businesses near you — salons, clinics, gyms, and more.',
};

/**
 * Explore page — Server Component shell.
 * Provides SEO metadata. The interactive grid (search, geo, filters) runs client-side.
 */
export default function ExplorePage() {
  return <ExploreGrid />;
}
