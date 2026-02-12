'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { businessApi } from '@/lib/business';
import { bookingApi } from '@/lib/booking';
import { analyticsApi } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/shared';
import {
  Calendar,
  Store,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Users,
  ArrowRight,
  BarChart3,
  CalendarPlus,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Business, Booking, BusinessAnalytics } from '@/types';

/** Format currency value */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

/** Format date for display */
const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Format time for display */
const formatTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

/** Status badge styling */
const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

/** Human-readable status descriptions for tooltips */
const statusTooltips: Record<string, string> = {
  pending: 'Awaiting confirmation from the business',
  confirmed: 'Booking has been confirmed',
  completed: 'Service was delivered successfully',
  cancelled: 'Booking was cancelled',
  no_show: 'Customer did not show up',
};

// ─── Customer Dashboard ─────────────────────────────────────────────────────

function CustomerDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi
      .list({ limit: 5 })
      .then(({ bookings: b }) => setBookings(b))
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

// ─── Business Owner Dashboard ───────────────────────────────────────────────

function BusinessOwnerDashboard() {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch businesses
  useEffect(() => {
    businessApi
      .getMyBusinesses()
      .then((biz) => {
        setBusinesses(biz);
        if (biz.length > 0) {
          setSelectedBusinessId(biz[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBiz(false));
  }, []);

  // Fetch analytics + bookings when business changes
  useEffect(() => {
    if (!selectedBusinessId) return;

    setLoadingAnalytics(true);
    setLoadingBookings(true);

    analyticsApi
      .getDashboard(selectedBusinessId, '30d')
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false));

    const today = new Date().toISOString().split('T')[0];
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    const endDateStr = next30.toISOString().split('T')[0];

    // Fetch upcoming bookings (today + next 30 days, all statuses)
    const upcomingPromise = bookingApi
      .list({ limit: 50, startDate: today, endDate: endDateStr })
      .then(({ bookings: b }) => setUpcomingBookings(b))
      .catch(() => setUpcomingBookings([]));

    // Fetch all pending bookings separately (any date)
    const pendingPromise = bookingApi
      .list({ limit: 50, status: 'pending' })
      .then(({ bookings: b }) => setPendingBookings(b))
      .catch(() => setPendingBookings([]));

    Promise.all([upcomingPromise, pendingPromise]).finally(() => setLoadingBookings(false));
  }, [selectedBusinessId]);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const isLoading = loadingBiz || loadingAnalytics || loadingBookings;

  // ── No businesses yet ─────────────────────────────────────────────────────
  if (!loadingBiz && businesses.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={`Welcome, ${user?.firstName}!`}
          description="Let's get your business up and running."
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card p-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Create your first business</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Set up your business profile, add services, configure availability, and start accepting
            bookings from customers.
          </p>
          <Button className="mt-8" size="lg" asChild>
            <Link href="/dashboard/businesses/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Business
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with business selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Business overview &mdash; last 30 days</p>
        </div>
        {businesses.length > 1 && (
          <select
            value={selectedBusinessId ?? ''}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Select business"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Revenue"
          value={isLoading ? '...' : formatCurrency(analytics?.overview.totalRevenue ?? 0)}
          href="/dashboard/analytics"
          tooltip="Click to view detailed revenue analytics"
          description={
            analytics && analytics.overview.revenueGrowth !== 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium',
                      analytics.overview.revenueGrowth > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        'h-3 w-3',
                        analytics.overview.revenueGrowth < 0 && 'rotate-180'
                      )}
                    />
                    {Math.abs(analytics.overview.revenueGrowth).toFixed(1)}% vs prev period
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Compared to the previous 30-day period</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              'Last 30 days'
            )
          }
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Total Bookings"
          value={isLoading ? '...' : String(analytics?.overview.totalBookings ?? 0)}
          href="/dashboard/bookings"
          tooltip="Click to view all bookings"
          description={
            analytics?.bookingsByStatus ? (
              <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                {(analytics.bookingsByStatus.pending ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        {analytics.bookingsByStatus.pending} pending
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Bookings awaiting confirmation</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus.confirmed ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {analytics.bookingsByStatus.confirmed} confirmed
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Upcoming confirmed bookings</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus.completed ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {analytics.bookingsByStatus.completed} completed
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Successfully completed bookings</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus.cancelled ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        {analytics.bookingsByStatus.cancelled} cancelled
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Cancelled bookings in this period</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {analytics.overview.totalBookings === 0 && <span>Last 30 days</span>}
              </span>
            ) : (
              'Last 30 days'
            )
          }
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          title="Avg Rating"
          value={isLoading ? '...' : (analytics?.reviews.averageRating ?? 0).toFixed(1)}
          href="/dashboard/analytics"
          tooltip="Average of all customer reviews"
          description={`${analytics?.reviews.totalReviews ?? 0} reviews`}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          title="Customers"
          value={isLoading ? '...' : String(analytics?.customers.totalCustomers ?? 0)}
          href="/dashboard/bookings"
          tooltip="Unique customers who booked in this period"
          description={`${analytics?.customers.newCustomers ?? 0} new this period`}
        />
      </div>

      {/* Middle row: Today's snapshot + Pending actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's Bookings */}
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Upcoming Bookings</h3>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {loadingBookings ? '...' : upcomingBookings.length}
            </span>
          </div>
          <div className="divide-y divide-border/40">
            {loadingBookings ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No upcoming bookings
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  No bookings scheduled for the next 30 days.
                </p>
              </div>
            ) : (
              upcomingBookings.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings`}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.service?.name ?? 'Service'} &middot;{' '}
                      {formatDate(booking.bookingDate)}, {formatTime(booking.startTime)}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                            statusStyles[booking.status] ?? statusStyles.pending
                          )}
                        >
                          {booking.status}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{statusTooltips[booking.status] ?? booking.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </Link>
              ))
            )}
            {upcomingBookings.length > 5 && (
              <Link
                href="/dashboard/bookings"
                className="flex items-center justify-center gap-1 py-3 text-xs font-medium text-primary hover:underline"
              >
                View all {upcomingBookings.length} upcoming
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold">Pending Actions</h3>
            </div>
            {pendingBookings.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {pendingBookings.length} awaiting
              </span>
            )}
          </div>
          <div className="divide-y divide-border/40">
            {loadingBookings ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500/40" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">All caught up!</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  No bookings waiting for your confirmation.
                </p>
              </div>
            ) : (
              pendingBookings.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href="/dashboard/bookings"
                  className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.service?.name ?? 'Service'} &middot;{' '}
                      {formatDate(booking.bookingDate)}, {formatTime(booking.startTime)}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Pending
                    </span>
                  </div>
                </Link>
              ))
            )}
            {pendingBookings.length > 5 && (
              <Link
                href="/dashboard/bookings"
                className="flex items-center justify-center gap-1 py-3 text-xs font-medium text-primary hover:underline"
              >
                View all pending
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Performance + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Performance metrics */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2">
          <h3 className="font-semibold">Performance</h3>
          <p className="mt-1 text-xs text-muted-foreground">Key metrics for the last 30 days</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricTile
              label="Completion Rate"
              value={isLoading ? '...' : `${(analytics?.overview.completionRate ?? 0).toFixed(0)}%`}
              icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              color="green"
              tooltip="Percentage of confirmed bookings that were completed"
            />
            <MetricTile
              label="Cancellation Rate"
              value={
                isLoading ? '...' : `${(analytics?.overview.cancellationRate ?? 0).toFixed(0)}%`
              }
              icon={<XCircle className="h-4 w-4 text-red-500" />}
              color="red"
              tooltip="Percentage of bookings that were cancelled"
            />
            <MetricTile
              label="Avg Booking Value"
              value={isLoading ? '...' : formatCurrency(analytics?.overview.avgBookingValue ?? 0)}
              icon={<DollarSign className="h-4 w-4 text-primary" />}
              color="primary"
              tooltip="Average revenue per booking"
            />
          </div>

          {/* Top services */}
          {analytics && analytics.topServices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-muted-foreground">Top Services</h4>
              <div className="mt-3 space-y-2">
                {analytics.topServices.slice(0, 3).map((svc, idx) => {
                  const maxRevenue = analytics.topServices[0]?.revenue ?? 1;
                  return (
                    <div key={svc.serviceId} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium">{svc.serviceName}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="ml-2 shrink-0 text-sm font-semibold">
                                {formatCurrency(svc.revenue)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>
                                {svc.bookingCount} booking{svc.bookingCount !== 1 ? 's' : ''} this
                                period
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${(svc.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Quick Actions</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage {selectedBusiness?.name ?? 'your business'}
          </p>

          <div className="mt-5 space-y-2">
            <QuickActionLink
              href="/dashboard/bookings"
              icon={<Calendar className="h-4 w-4" />}
              label="View All Bookings"
              tooltip="See and manage all customer bookings"
            />
            <QuickActionLink
              href="/dashboard/analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              label="View Analytics"
              tooltip="Detailed charts and revenue reports"
            />
            <QuickActionLink
              href="/dashboard/businesses"
              icon={<CalendarPlus className="h-4 w-4" />}
              label="Manage Slots & Services"
              tooltip="Add services, configure time slots and pricing"
            />
            <QuickActionLink
              href="/dashboard/businesses/new"
              icon={<Plus className="h-4 w-4" />}
              label="Add New Business"
              tooltip="Register another business location"
            />
            {selectedBusiness?.slug && (
              <QuickActionLink
                href={`/explore/${selectedBusiness.slug}`}
                icon={<ExternalLink className="h-4 w-4" />}
                label="View Public Page"
                tooltip="See how customers view your business"
              />
            )}
            <QuickActionLink
              href="/dashboard/businesses"
              icon={<Settings className="h-4 w-4" />}
              label="Business Settings"
              tooltip="Hours, holidays, and business details"
            />
          </div>
        </div>
      </div>

      {/* Recent Bookings table */}
      {analytics && analytics.recentBookings.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <h3 className="font-semibold">Recent Bookings</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {analytics.recentBookings.slice(0, 5).map((rb) => (
                  <tr key={rb.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">{rb.customerName}</td>
                    <td className="px-6 py-3 text-muted-foreground">{rb.serviceName}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatDate(rb.bookingDate)}
                    </td>
                    <td className="px-6 py-3 font-semibold">{formatCurrency(rb.totalPrice)}</td>
                    <td className="px-6 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                              statusStyles[rb.status] ?? statusStyles.pending
                            )}
                          >
                            {rb.status}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{statusTooltips[rb.status] ?? rb.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

interface MetricTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'primary';
  tooltip?: string;
}

function MetricTile({ label, value, icon, color, tooltip }: MetricTileProps) {
  const bgMap = {
    green: 'bg-green-50 dark:bg-green-950/30',
    red: 'bg-red-50 dark:bg-red-950/30',
    primary: 'bg-primary/5',
  };

  const tile = (
    <div className={cn('rounded-xl p-4', bgMap[color])}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );

  if (!tooltip) return tile;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tile}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface QuickActionLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}

function QuickActionLink({ href, icon, label, tooltip }: QuickActionLinkProps) {
  const link = (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      {label}
      <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );

  if (!tooltip) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'business_owner' || user.role === 'admin') {
    return <BusinessOwnerDashboard />;
  }

  return <CustomerDashboard />;
}
