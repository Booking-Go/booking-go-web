'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getDashboardAnalytics, getRevenueReport } from '@/actions/analytics';
import { getMyBusinesses } from '@/actions/business';
import { PageHeader, StatCard } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BookingStatus,
  BOOKING_STATUS_STYLES,
  BOOKING_STATUS_LABELS,
  type BookingStatusValue,
} from '@/lib/constants';
import {
  DollarSign,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Clock,
  BarChart3,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Business, BusinessAnalytics } from '@/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  confirmed: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  no_show: '#6b7280',
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatPercent = (v: number): string => `${v}%`;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Fetch owner's businesses
  useEffect(() => {
    getMyBusinesses()
      .then((result) => {
        if (result.success) {
          setBusinesses(result.data);
          if (result.data.length > 0) setSelectedBusiness(result.data[0].id);
        } else {
          toast.error('Failed to load businesses');
        }
      })
      .catch(() => toast.error('Failed to load businesses'))
      .finally(() => setLoadingBusinesses(false));
  }, []);

  // Fetch analytics whenever business or period changes
  const fetchAnalytics = useCallback(async () => {
    if (!selectedBusiness) return;
    setLoading(true);
    try {
      const result = await getDashboardAnalytics(selectedBusiness, period);
      if (result.success) setAnalytics(result.data);
      else toast.error('Failed to load analytics');
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Export revenue report as JSON download
  const handleExport = async () => {
    if (!analytics || !selectedBusiness) return;
    setExporting(true);
    try {
      const result = await getRevenueReport(
        selectedBusiness,
        analytics.period.startDate,
        analytics.period.endDate
      );
      if (!result.success) throw new Error(result.error);
      const report = result.data;
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${analytics.period.startDate}-${analytics.period.endDate}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (!user) return null;

  if (loadingBusinesses) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Analytics" description="Track your business performance" />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a business first to view analytics.
          </p>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview;

  // Prepare pie chart data for booking status
  const statusPieData = analytics
    ? Object.entries(analytics.bookingsByStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          value: count,
          color: STATUS_COLORS[status] ?? '#94a3b8',
        }))
    : [];

  // Peak hours chart data
  const peakHoursData = analytics
    ? analytics.peakHours
        .map((count, hour) => ({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          bookings: count,
        }))
        .filter((_, i) => i >= 6 && i <= 22) // Show only business hours 6am-10pm
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader title="Analytics" description="Track revenue, bookings, and performance metrics">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting || !analytics}
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Report
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
          <SelectTrigger className="w-full sm:w-[260px]">
            <SelectValue placeholder="Select business" />
          </SelectTrigger>
          <SelectContent>
            {businesses.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : analytics ? (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Total Revenue"
              value={formatCurrency(overview!.totalRevenue)}
              description={<GrowthBadge value={overview!.revenueGrowth} label="vs prev period" />}
            />
            <StatCard
              icon={<CalendarCheck className="h-5 w-5" />}
              title="Total Bookings"
              value={String(overview!.totalBookings)}
              description={<GrowthBadge value={overview!.bookingGrowth} label="vs prev period" />}
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Avg Booking Value"
              value={formatCurrency(overview!.avgBookingValue)}
            />
            <StatCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Occupancy Rate"
              value={formatPercent(overview!.occupancyRate)}
              description={`${formatPercent(overview!.completionRate)} completion rate`}
            />
          </div>

          {/* Revenue Trend + Booking Status */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue trend (span 2) */}
            <Card className="col-span-full p-6 lg:col-span-2">
              <h3 className="mb-4 text-base font-semibold">Revenue Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenue.daily}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `$${v}`}
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-md">
                            <p className="text-sm font-medium">{formatDate(String(label))}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: {formatCurrency(payload[0].value as number)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bookings: {payload[1]?.value ?? 0}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8b5cf6"
                      strokeWidth={1.5}
                      fill="none"
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Booking status pie */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Bookings by Status</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {statusPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bookings`, String(value)]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {formatPercent(overview!.cancellationRate)} cancellation rate
              </div>
            </Card>
          </div>

          {/* Top Services + Peak Hours */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Services */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Top Services</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.topServices.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      tickFormatter={(v: number) => `$${v}`}
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="serviceName"
                      width={120}
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as {
                          serviceName: string;
                          revenue: number;
                          bookingCount: number;
                        };
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-md">
                            <p className="text-sm font-medium">{d.serviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: {formatCurrency(d.revenue)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bookings: {d.bookingCount}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {analytics.topServices.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Peak Hours */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Peak Hours</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="hour"
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      interval={1}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip formatter={(value) => [`${value} bookings`, 'Bookings']} />
                    <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Day of Week + Customers + Reviews */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Day of Week */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Bookings by Day</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.bookingsByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: 'currentColor' }} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip formatter={(value) => [`${value}`, 'Bookings']} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Customer Metrics */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Customers</h3>
              <div className="space-y-5">
                <MetricRow
                  icon={<Users className="h-4 w-4 text-indigo-500" />}
                  label="Total Customers"
                  value={String(analytics.customers.totalCustomers)}
                />
                <MetricRow
                  icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                  label="New Customers"
                  value={String(analytics.customers.newCustomers)}
                />
                <MetricRow
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                  label="Returning Customers"
                  value={String(analytics.customers.returningCustomers)}
                />
                {analytics.customers.totalCustomers > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">Retention Rate</div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{
                          width: `${Math.round(
                            (analytics.customers.returningCustomers /
                              analytics.customers.totalCustomers) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      {Math.round(
                        (analytics.customers.returningCustomers /
                          analytics.customers.totalCustomers) *
                          100
                      )}
                      %
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Review Stats */}
            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold">Reviews</h3>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{analytics.reviews.averageRating}</span>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  ({analytics.reviews.totalReviews} reviews)
                </span>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    analytics.reviews.distribution[
                      star as keyof typeof analytics.reviews.distribution
                    ];
                  const pct =
                    analytics.reviews.totalReviews > 0
                      ? Math.round((count / analytics.reviews.totalReviews) * 100)
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-right">{star}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-yellow-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Bookings Table */}
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Service</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analytics.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/50">
                      <td className="py-3 pr-4 font-medium">{b.customerName}</td>
                      <td className="py-3 pr-4">{b.serviceName}</td>
                      <td className="py-3 pr-4">{formatDate(b.bookingDate)}</td>
                      <td className="py-3 pr-4">{formatCurrency(b.totalPrice)}</td>
                      <td className="py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                  {analytics.recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No bookings in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function GrowthBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      {isPositive ? (
        <TrendingUp className="h-3 w-3 text-green-500" />
      ) : (
        <TrendingDown className="h-3 w-3 text-red-500" />
      )}
      <span
        className={
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }
      >
        {isPositive ? '+' : ''}
        {value}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_STYLES[status as BookingStatusValue] ?? BOOKING_STATUS_STYLES[BookingStatus.PENDING]}`}
    >
      {BOOKING_STATUS_LABELS[status as BookingStatusValue] ?? status}
    </span>
  );
}
