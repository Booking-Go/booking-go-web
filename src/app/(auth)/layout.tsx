import type { Metadata } from 'next';
import { Logo } from '@/components/shared';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'Sign in',
};

/**
 * Auth layout — server component.
 * Minimal centered layout with logo and theme toggle for login/register.
 * Route protection (redirect if already authenticated) is handled by middleware.ts.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal header */}
      <header className="flex h-16 items-center justify-between px-6">
        <Logo size="lg" />
        <ThemeToggle />
      </header>

      {/* Centered form area */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
