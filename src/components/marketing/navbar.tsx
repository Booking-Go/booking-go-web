import Link from 'next/link';
import { Logo } from '@/components/shared';
import { NavAuth } from './nav-auth';

/**
 * Public marketing navbar — server component.
 * Used on the landing page and future public pages.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/explore" className="transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/#testimonials" className="transition-colors hover:text-foreground">
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <NavAuth />
        </div>
      </div>
    </header>
  );
}
