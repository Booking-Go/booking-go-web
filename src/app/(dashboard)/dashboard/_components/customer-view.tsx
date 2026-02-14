'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getBookings } from '@/actions/booking';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/shared';
import { Calendar, Store, Clock, CheckCircle2 } from 'lucide-react';
import type { Booking } from '@/types';

/**
 * Customer dashboard view — shows upcoming bookings and quick actions.
 */
export function CustomerView() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings({ limit: 5 })
      .then((result) => {
        if (result.success) setBookings(result.data.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        description="Find and book services from top businesses near you."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Upcoming Bookings"
          value={loading ? '...' : String(upcomingBookings.length)}
          description={
            upcomingBookings.length === 0 ? 'No upcoming bookings' : 'Pending & confirmed'
          }
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Completed"
          value={loading ? '...' : String(bookings.filter((b) => b.status === 'completed').length)}
          description="Past bookings"
        />
        <StatCard
          icon={<Store className="h-5 w-5" />}
          title="Explore"
          value="Find services"
          description="Browse businesses near you"
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-8">
        <h2 className="text-xl font-semibold tracking-tight">Get started</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse businesses and book your first appointment.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/explore">
              <Calendar className="mr-2 h-4 w-4" />
              Browse Businesses
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/bookings">
              <Clock className="mr-2 h-4 w-4" />
              My Bookings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
