'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Store,
  ChevronRight,
} from 'lucide-react';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  userRole: string;
  onView: (booking: Booking) => void;
  onConfirm?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onComplete?: (booking: Booking) => void;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
  pending: { label: 'Pending', variant: 'outline', className: 'text-amber-600 border-amber-300' },
  confirmed: { label: 'Confirmed', variant: 'secondary', className: 'text-blue-600' },
  completed: { label: 'Completed', variant: 'secondary', className: 'text-green-600' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  no_show: { label: 'No Show', variant: 'outline', className: 'text-red-500 border-red-300' },
};

export function BookingCard({
  booking,
  userRole,
  onView,
  onConfirm,
  onCancel,
  onComplete,
}: BookingCardProps) {
  const status = statusConfig[booking.status] || statusConfig.pending;
  const isOwner = userRole === 'business_owner' || userRole === 'admin';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Top row: status + service */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
          {booking.service && (
            <span className="text-sm font-medium">{booking.service.name}</span>
          )}
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(booking.bookingDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </span>
          {booking.numberOfPeople > 1 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {booking.numberOfPeople} people
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <IndianRupee className="h-3 w-3" />
            {booking.totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Business or customer name */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isOwner ? (
            <>
              <Users className="h-3 w-3" />
              {booking.customerName || `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim() || 'Customer'}
            </>
          ) : (
            booking.business && (
              <>
                <Store className="h-3 w-3" />
                {booking.business.name}
              </>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 pl-4">
        {isOwner && booking.status === 'pending' && onConfirm && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-blue-600 hover:text-blue-700"
            onClick={(e) => { e.stopPropagation(); onConfirm(booking); }}
          >
            Confirm
          </Button>
        )}
        {booking.status === 'confirmed' && isOwner && onComplete && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-green-600 hover:text-green-700"
            onClick={(e) => { e.stopPropagation(); onComplete(booking); }}
          >
            Complete
          </Button>
        )}
        {(booking.status === 'pending' || booking.status === 'confirmed') && onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onCancel(booking); }}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onView(booking)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
