export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'business_owner' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  settings: BusinessSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  timezone: string;
  currency: string;
  bookingAdvanceTime: number;
  cancellationPolicy: string;
  slotDuration: number;
  autoConfirm: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
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
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
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
}
