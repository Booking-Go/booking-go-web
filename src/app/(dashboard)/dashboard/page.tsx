'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { businessApi } from '@/lib/business';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/shared';
import { Calendar, Store, User, Plus } from 'lucide-react';
import type { Business } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  useEffect(() => {
    if (user?.role === 'business_owner') {
      setLoadingBusinesses(true);
      businessApi
        .getMyBusinesses()
        .then(setBusinesses)
        .catch(() => {})
        .finally(() => setLoadingBusinesses(false));
    }
  }, [user?.role]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user.firstName}!`}
        description="Here's your dashboard overview."
      />

      {/* Quick stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Upcoming Bookings"
          value="0"
          description="No upcoming bookings"
        />
        {user.role === 'business_owner' && (
          <StatCard
            icon={<Store className="h-5 w-5" />}
            title="Your Businesses"
            value={loadingBusinesses ? '...' : String(businesses.length)}
            description={
              businesses.length === 0
                ? 'Create your first business'
                : `${businesses.filter((b) => b.isActive).length} active`
            }
          />
        )}
        <StatCard
          icon={<User className="h-5 w-5" />}
          title="Account"
          value={user.email}
          description={`Role: ${user.role.replace('_', ' ')}`}
        />
      </div>

      {/* Getting started */}
      <div className="rounded-2xl border border-border/60 bg-card p-8">
        <h2 className="text-xl font-semibold tracking-tight">Getting started</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.role === 'business_owner'
            ? 'Set up your business, add services, and start accepting bookings.'
            : 'Browse businesses and book your first appointment.'}
        </p>

        <div className="mt-6 flex gap-3">
          {user.role === 'business_owner' ? (
            <Button asChild>
              <Link href="/dashboard/businesses/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Business
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/explore">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Businesses
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
