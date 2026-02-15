import type {
  UserRoleValue,
  BookingStatusValue,
  CancelledByValue,
  SenderRoleValue,
} from '@/lib/constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRoleValue;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  settings: BusinessSettings;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  timezone: string;
  currency: string;
  bookingAdvanceTime: number;
  cancellationDeadline: number;
  slotDuration: number;
  autoConfirm: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  bufferTime: number;
}

export interface BusinessHours {
  id: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BusinessHoliday {
  id: string;
  businessId: string;
  date: string;
  reason?: string;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  depositAmount: number;
  maxCapacity: number;
  bufferTime: number;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  businessId: string;
  serviceId?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
  price: number;
  notes?: string;
  service?: {
    id: string;
    name: string;
    duration: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  businessId: string;
  customerId: string;
  serviceId?: string;
  status: BookingStatusValue;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositPaid: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: CancelledByValue;
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined objects (from API)
  business?: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  service?: { id: string; name: string; duration: number };
  customer?: { firstName: string; lastName: string };
}

export interface Review {
  id: string;
  bookingId: string;
  businessId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    profileImage?: string | null;
  };
}

/** Meta returned alongside paginated reviews. */
export interface ReviewMeta extends PaginationMeta {
  averageRating: number;
  reviewCount: number;
}

/** Notification returned by the API. */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** A conversation between a customer and a business owner. */
export interface Conversation {
  id: string;
  businessId: string;
  customerId: string;
  businessOwnerId: string;
  businessName: string;
  customerName: string;
  lastMessageAt: string;
  lastMessageText: string;
  unreadCount: number;
  createdAt: string;
}

/** A single chat message within a conversation. */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: SenderRoleValue;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
  label: string;
}

export interface AnalyticsOverview {
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  occupancyRate: number;
  cancellationRate: number;
  completionRate: number;
  revenueGrowth: number;
  bookingGrowth: number;
}

export interface DailyRevenue {
  date: string;
  bookings: number;
  revenue: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenue: number;
}

export interface BookingsByDay {
  day: string;
  count: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface ReviewDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  distribution: ReviewDistribution;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  serviceName: string;
  status: BookingStatusValue;
  bookingDate: string;
  totalPrice: number;
  createdAt: string;
}

export interface SlotOccupancy {
  totalSlots: number;
  bookedSlots: number;
  occupancyRate: number;
}

export interface BusinessAnalytics {
  period: AnalyticsPeriod;
  overview: AnalyticsOverview;
  bookingsByStatus: Record<string, number>;
  revenue: {
    daily: DailyRevenue[];
  };
  topServices: TopService[];
  peakHours: number[];
  bookingsByDayOfWeek: BookingsByDay[];
  customers: CustomerMetrics;
  reviews: ReviewStats;
  slots: SlotOccupancy;
  recentBookings: RecentBooking[];
}

export interface MonthlyRevenue {
  month: string;
  bookings: number;
  revenue: number;
}

export interface RevenueReport {
  period: { startDate: string; endDate: string };
  summary: {
    totalBookings: number;
    totalRevenue: number;
    avgBookingValue: number;
  };
  daily: DailyRevenue[];
  monthly: MonthlyRevenue[];
  serviceBreakdown: {
    serviceName: string;
    bookingCount: number;
    revenue: number;
  }[];
}
