import { Navbar } from '@/components/marketing';

/**
 * Marketing layout — server component.
 * Wraps the landing page (and future public pages like /pricing, /about)
 * with the public navbar. Footer is rendered by individual sub-layouts
 * so explore pages can hide the CTA section.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}
