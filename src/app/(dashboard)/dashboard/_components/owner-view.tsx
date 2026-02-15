'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useAuthStore } from '@/store/authStore';
import { getMyBusinesses } from '@/actions/business';
import { getBookings } from '@/actions/booking';
import { getDashboardAnalytics } from '@/actions/analytics';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard, DateRangePicker } from '@/components/shared';
import {
  Calendar,
  Store,
  Plus,
  DollarSign,
  TrendingUp,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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
import {
  BookingStatus,
  BOOKING_STATUS_STYLES,
  BOOKING_STATUS_DESCRIPTIONS,
  BOOKING_STATUS_LABELS,
} from '@/lib/constants';

// ─── Sub-components ─────────────────────────────────────────────────────────

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
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

// ─── Owner View ─────────────────────────────────────────────────────────────

/**
 * Business owner dashboard view — KPIs, bookings, pending actions, performance metrics.
 */
export function OwnerView() {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Default date range: full current month
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  /** ISO date string helper */
  const rangeStartStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const rangeEndStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

  // Fetch businesses
  useEffect(() => {
    getMyBusinesses()
      .then((result) => {
        if (result.success) {
          setBusinesses(result.data);
          if (result.data.length > 0) {
            setSelectedBusinessId(result.data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBiz(false));
  }, []);

  // Fetch analytics + bookings when business or date range changes
  useEffect(() => {
    if (!selectedBusinessId) return;
    // Wait until both ends of range are selected
    if (!rangeStartStr || !rangeEndStr) return;

    setLoadingAnalytics(true);
    setLoadingBookings(true);

    getDashboardAnalytics(selectedBusinessId, '30d', rangeStartStr, rangeEndStr)
      .then((result) => {
        if (result.success) setAnalytics(result.data);
        else setAnalytics(null);
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false));

    // Fetch bookings within the selected range
    const upcomingPromise = getBookings({
      limit: 50,
      startDate: rangeStartStr,
      endDate: rangeEndStr,
    })
      .then((result) => {
        if (result.success) setUpcomingBookings(result.data.bookings);
        else setUpcomingBookings([]);
      })
      .catch(() => setUpcomingBookings([]));

    // Fetch all pending bookings separately (any date)
    const pendingPromise = getBookings({ limit: 50, status: BookingStatus.PENDING })
      .then((result) => {
        if (result.success) setPendingBookings(result.data.bookings);
        else setPendingBookings([]);
      })
      .catch(() => setPendingBookings([]));

    Promise.all([upcomingPromise, pendingPromise]).finally(() => setLoadingBookings(false));
  }, [selectedBusinessId, rangeStartStr, rangeEndStr]);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const isLoading = loadingBiz || loadingAnalytics || loadingBookings;

  // ── No businesses yet ─────────────────────────────────────────────────────
  if (!loadingBiz && businesses.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.firstName}!</h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s get your business up and running.
          </p>
        </div>
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
      {/* Header with business selector + date range */}
      <div className="flex items-start justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Business overview
            {dateRange?.from && dateRange?.to
              ? ` — ${format(dateRange.from, 'MMM d')} to ${format(dateRange.to, 'MMM d, yyyy')}`
              : ''}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          {businesses.length > 1 && (
            <Select value={selectedBusinessId ?? ''} onValueChange={setSelectedBusinessId}>
              <SelectTrigger
                className="h-9 w-full gap-2 text-sm font-medium"
                aria-label="Select business"
              >
                <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            className="w-full"
          />
        </div>
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
                  <p>Compared to the previous period</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              'Selected period'
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
                {(analytics.bookingsByStatus[BookingStatus.PENDING] ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        {analytics.bookingsByStatus[BookingStatus.PENDING]} pending
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{BOOKING_STATUS_DESCRIPTIONS[BookingStatus.PENDING]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus[BookingStatus.CONFIRMED] ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {analytics.bookingsByStatus[BookingStatus.CONFIRMED]} confirmed
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{BOOKING_STATUS_DESCRIPTIONS[BookingStatus.CONFIRMED]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus[BookingStatus.COMPLETED] ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {analytics.bookingsByStatus[BookingStatus.COMPLETED]} completed
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{BOOKING_STATUS_DESCRIPTIONS[BookingStatus.COMPLETED]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(analytics.bookingsByStatus[BookingStatus.CANCELLED] ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        {analytics.bookingsByStatus[BookingStatus.CANCELLED]} cancelled
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Cancelled bookings in this period</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {analytics.overview.totalBookings === 0 && <span>Selected period</span>}
              </span>
            ) : (
              'Selected period'
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
              <h3 className="font-semibold">Bookings</h3>
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
                <p className="mt-3 text-sm font-medium text-muted-foreground">No bookings found</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  No bookings in the selected date range.
                </p>
              </div>
            ) : (
              upcomingBookings.slice(0, 5).map((booking) => (
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
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                            BOOKING_STATUS_STYLES[
                              booking.status as keyof typeof BOOKING_STATUS_STYLES
                            ] ?? BOOKING_STATUS_STYLES[BookingStatus.PENDING]
                          )}
                        >
                          {BOOKING_STATUS_LABELS[
                            booking.status as keyof typeof BOOKING_STATUS_LABELS
                          ] ?? booking.status}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>
                          {BOOKING_STATUS_DESCRIPTIONS[
                            booking.status as keyof typeof BOOKING_STATUS_DESCRIPTIONS
                          ] ?? booking.status}
                        </p>
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
          <p className="mt-1 text-xs text-muted-foreground">Key metrics for the selected period</p>

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
                              BOOKING_STATUS_STYLES[
                                rb.status as keyof typeof BOOKING_STATUS_STYLES
                              ] ?? BOOKING_STATUS_STYLES[BookingStatus.PENDING]
                            )}
                          >
                            {BOOKING_STATUS_LABELS[
                              rb.status as keyof typeof BOOKING_STATUS_LABELS
                            ] ?? rb.status}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>
                            {BOOKING_STATUS_DESCRIPTIONS[
                              rb.status as keyof typeof BOOKING_STATUS_DESCRIPTIONS
                            ] ?? rb.status}
                          </p>
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
