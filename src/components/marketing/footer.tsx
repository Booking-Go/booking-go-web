import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Public marketing footer — server component.
 * Extracted from the landing page for reuse on future public pages.
 * @param hideCta - If true, hides the "Ready to simplify" CTA section.
 */
export function Footer({ hideCta = false }: { hideCta?: boolean }) {
  return (
    <>
      {/* CTA Section */}
      {!hideCta && (
        <section className="border-t border-border/40 bg-muted/30">
          <div className="container py-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to simplify your bookings?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of businesses that save time and delight customers with Booking.go.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-[15px] shadow-lg shadow-primary/20"
                asChild
              >
                <Link href="/register">
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever for up to 50 bookings/month. No credit card needed.
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Booking<span className="text-muted-foreground">.go</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Modern booking management for small businesses.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="transition-colors hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Booking.go. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
