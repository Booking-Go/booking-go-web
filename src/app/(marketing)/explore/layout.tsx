import { Footer } from '@/components/marketing';

/**
 * Explore layout — hides the marketing CTA section since explore pages
 * are for browsing/booking, not for marketing conversion.
 */
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer hideCta />
    </>
  );
}
