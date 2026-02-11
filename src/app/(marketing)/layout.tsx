import { Navbar, Footer } from '@/components/marketing';

/**
 * Marketing layout — server component.
 * Wraps the landing page (and future public pages like /pricing, /about)
 * with the public navbar and footer.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
