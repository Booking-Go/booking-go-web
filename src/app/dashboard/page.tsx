'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import toast from 'react-hot-toast';
import { Calendar, Store, User, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, log out locally
    } finally {
      logout();
      toast.success('Logged out');
      router.push('/login');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Booking<span className="text-muted-foreground">.go</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.role === 'business_owner' ? 'Business' : user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your dashboard overview.
          </p>
        </div>

        {/* Quick stats cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            icon={<Calendar className="h-5 w-5" />}
            title="Upcoming Bookings"
            value="0"
            description="No upcoming bookings"
          />
          {user.role === 'business_owner' && (
            <DashboardCard
              icon={<Store className="h-5 w-5" />}
              title="Your Businesses"
              value="0"
              description="Create your first business"
            />
          )}
          <DashboardCard
            icon={<User className="h-5 w-5" />}
            title="Account"
            value={user.email}
            description={`Role: ${user.role.replace('_', ' ')}`}
          />
        </div>

        {/* Getting started */}
        <div className="mt-12 rounded-2xl border border-border/60 bg-card p-8">
          <h2 className="text-xl font-semibold tracking-tight">Getting started</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.role === 'business_owner'
              ? 'Set up your business, add services, and start accepting bookings.'
              : 'Browse businesses and book your first appointment.'}
          </p>

          <div className="mt-6 flex gap-3">
            {user.role === 'business_owner' ? (
              <Button disabled>
                <Store className="mr-2 h-4 w-4" />
                Create Business (coming soon)
              </Button>
            ) : (
              <Button disabled>
                <Calendar className="mr-2 h-4 w-4" />
                Browse Businesses (coming soon)
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          {icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
