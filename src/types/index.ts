export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'business_owner' | 'admin';
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
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
  cancelledBy?: 'customer' | 'business' | 'system';
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined objects (from API)
  business?: { id: string; name: string; slug: string };
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
  senderRole: 'customer' | 'business_owner';
  content: string;
  isRead: boolean;
  createdAt: string;
}
