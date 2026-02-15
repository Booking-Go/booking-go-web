'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getBookings,
  confirmBooking,
  completeBooking,
  cancelBooking,
  createReview,
} from '@/actions/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, Modal, AddToCalendar } from '@/components/shared';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Star,
  Scissors,
  User,
  Mail,
  Phone,
  StickyNote,
  Ban,
} from 'lucide-react';
import { bookingToCalendarEvent, type CalendarPerspective } from '@/lib/calendar';
import {
  BookingStatus,
  BOOKING_STATUS_FILTER_OPTIONS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANTS,
  UserRole,
  type BookingStatusValue,
} from '@/lib/constants';
import type { Booking, PaginationMeta } from '@/types';

/** Icon mapping for each booking status. */
const STATUS_ICONS: Record<BookingStatusValue, typeof CheckCircle2> = {
  [BookingStatus.PENDING]: AlertCircle,
  [BookingStatus.CONFIRMED]: CheckCircle2,
  [BookingStatus.COMPLETED]: CheckCircle2,
  [BookingStatus.CANCELLED]: XCircle,
  [BookingStatus.NO_SHOW]: XCircle,
};

interface BookingListProps {
  initialBookings: Booking[];
  initialMeta: PaginationMeta;
  userRole: string;
}

export function BookingList({ initialBookings, initialMeta, userRole }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Action states
  const [confirming, setConfirming] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Detail modal
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  // Review modal
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());

  const isOwner = userRole === UserRole.BUSINESS_OWNER;
  const calendarPerspective: CalendarPerspective = isOwner ? 'owner' : 'customer';

  /** Refetch bookings client-side when filters/pagination change. */
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBookings({
        page,
        limit: 20,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      if (!result.success) throw new Error(result.error);
      setBookings(result.data.bookings);
      setMeta(result.data.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // Refetch when filter or page changes (skip initial load — SSR handled it)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadBookings();
  }, [loadBookings]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // ── Actions ──

  const handleConfirm = async (bookingId: string) => {
    setConfirming(bookingId);
    try {
      const result = await confirmBooking(bookingId);
      if (!result.success) throw new Error(result.error);
      setBookings((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
      toast.success('Booking confirmed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setConfirming(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setCompleting(bookingId);
    try {
      const result = await completeBooking(bookingId);
      if (!result.success) throw new Error(result.error);
      setBookings((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
      toast.success('Booking completed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete');
    } finally {
      setCompleting(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const payload: { reason?: string } = {};
      if (cancelReason.trim()) payload.reason = cancelReason.trim();
      const result = await cancelBooking(cancelTarget.id, payload);
      if (!result.success) throw new Error(result.error);
      setBookings((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
      toast.success('Booking cancelled');
      setCancelTarget(null);
      setCancelReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  // ── Helpers ──

  const handleSubmitReview = async () => {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      const result = await createReview(reviewTarget.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Review submitted! Thank you for your feedback.');
      setReviewedBookingIds((prev) => new Set(prev).add(reviewTarget.id));
      setReviewTarget(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { error?: { message?: string } } };
      };
      if (error?.response?.status === 409) {
        toast.info('You have already reviewed this booking');
        setReviewedBookingIds((prev) => new Set(prev).add(reviewTarget.id));
        setReviewTarget(null);
      } else {
        toast.error(error?.response?.data?.error?.message || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Helpers (format) ──

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={
          isOwner ? 'Manage bookings for your businesses.' : 'View and manage your appointments.'
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {meta && (
          <span className="text-sm text-muted-foreground">
            {meta.total} booking{meta.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {statusFilter !== 'all' ? 'No bookings with this status.' : 'No bookings yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const StatusIcon = STATUS_ICONS[booking.status] ?? STATUS_ICONS[BookingStatus.PENDING];
            const variant =
              BOOKING_STATUS_VARIANTS[booking.status] ??
              BOOKING_STATUS_VARIANTS[BookingStatus.PENDING];
            const label = BOOKING_STATUS_LABELS[booking.status] ?? booking.status;
            return (
              <Card
                key={booking.id}
                className="cursor-pointer transition-colors hover:bg-accent/30"
                onClick={() => setDetailBooking(booking)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={variant} className="text-xs">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {label}
                      </Badge>
                      {booking.business && (
                        <span className="text-sm font-medium">{booking.business.name}</span>
                      )}
                      {booking.service && (
                        <span className="text-xs text-muted-foreground">
                          • {booking.service.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(booking.bookingDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <IndianRupee className="h-3 w-3" />
                        {booking.totalPrice.toFixed(2)}
                      </span>
                      {booking.numberOfPeople > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {booking.numberOfPeople}
                        </span>
                      )}
                      {isOwner && booking.customerName && (
                        <span className="font-medium text-foreground/70">
                          {booking.customerName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-2 pl-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Owner actions */}
                    {isOwner && booking.status === BookingStatus.PENDING && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(booking.id)}
                        disabled={confirming === booking.id}
                      >
                        {confirming === booking.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        Confirm
                      </Button>
                    )}
                    {isOwner && booking.status === BookingStatus.CONFIRMED && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleComplete(booking.id)}
                        disabled={completing === booking.id}
                      >
                        {completing === booking.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        Complete
                      </Button>
                    )}
                    {/* Cancel — available for pending/confirmed */}
                    {(booking.status === BookingStatus.PENDING ||
                      booking.status === BookingStatus.CONFIRMED) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCancelTarget(booking)}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    )}
                    {/* Review — customer can review completed bookings */}
                    {!isOwner &&
                      booking.status === BookingStatus.COMPLETED &&
                      !reviewedBookingIds.has(booking.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewTarget(booking);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                        >
                          <Star className="mr-1 h-3.5 w-3.5" />
                          Review
                        </Button>
                      )}
                    {/* Add to Calendar — active bookings only */}
                    {(booking.status === BookingStatus.PENDING ||
                      booking.status === BookingStatus.CONFIRMED) && (
                      <AddToCalendar
                        event={bookingToCalendarEvent(booking, calendarPerspective)}
                        size="sm"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cancel dialog */}
      <Modal
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason('');
          }
        }}
        title="Cancel Booking"
        description={
          cancelTarget
            ? `Cancel the ${formatDate(cancelTarget.bookingDate)} ${formatTime(cancelTarget.startTime)} booking?`
            : ''
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Booking
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why are you cancelling?"
            rows={3}
          />
        </div>
      </Modal>

      {/* Booking detail modal */}
      <Modal
        open={!!detailBooking}
        onOpenChange={(open) => !open && setDetailBooking(null)}
        title="Booking Details"
        className="max-w-md"
      >
        {detailBooking && (
          <div className="space-y-5">
            {/* Header — status + business + service */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {detailBooking.business && (
                  <h3 className="text-base font-semibold">{detailBooking.business.name}</h3>
                )}
                {detailBooking.service && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Scissors className="h-3.5 w-3.5" />
                    {detailBooking.service.name}
                  </p>
                )}
              </div>
              <Badge variant={BOOKING_STATUS_VARIANTS[detailBooking.status] ?? 'outline'}>
                {BOOKING_STATUS_LABELS[detailBooking.status] ?? detailBooking.status}
              </Badge>
            </div>

            {/* Appointment info — date, time, price in a card */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1 text-center">
                <Calendar className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDate(detailBooking.bookingDate)}</p>
              </div>
              <div className="space-y-1 text-center">
                <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">
                  {formatTime(detailBooking.startTime)} – {formatTime(detailBooking.endTime)}
                </p>
              </div>
              <div className="space-y-1 text-center">
                <IndianRupee className="mx-auto h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">₹{detailBooking.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* People count (if > 1) */}
            {detailBooking.numberOfPeople > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">People</span>
                <span className="ml-auto font-medium">{detailBooking.numberOfPeople}</span>
              </div>
            )}

            {/* Customer info — owner only */}
            {isOwner && detailBooking.customerName && (
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Customer
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{detailBooking.customerName}</span>
                  </div>
                  {detailBooking.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate text-muted-foreground">
                        {detailBooking.customerEmail}
                      </span>
                    </div>
                  )}
                  {detailBooking.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{detailBooking.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {detailBooking.notes && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5" />
                  Notes
                </p>
                <p className="rounded-lg bg-muted/50 p-2.5 text-sm leading-relaxed">
                  {detailBooking.notes}
                </p>
              </div>
            )}

            {/* Cancellation reason */}
            {detailBooking.cancellationReason && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <Ban className="h-3.5 w-3.5" />
                  Cancellation Reason
                </p>
                <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  {detailBooking.cancellationReason}
                </p>
              </div>
            )}

            {/* Timestamps */}
            {(detailBooking.confirmedAt ||
              detailBooking.completedAt ||
              detailBooking.cancelledAt) && (
              <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
                {detailBooking.confirmedAt && (
                  <div className="flex justify-between">
                    <span>Confirmed</span>
                    <span>{new Date(detailBooking.confirmedAt).toLocaleString()}</span>
                  </div>
                )}
                {detailBooking.completedAt && (
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>{new Date(detailBooking.completedAt).toLocaleString()}</span>
                  </div>
                )}
                {detailBooking.cancelledAt && (
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <span>{new Date(detailBooking.cancelledAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions — match the listing page buttons */}
            {(detailBooking.status === BookingStatus.PENDING ||
              detailBooking.status === BookingStatus.CONFIRMED ||
              (!isOwner && detailBooking.status === BookingStatus.COMPLETED)) && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                {/* Owner: Confirm pending */}
                {isOwner && detailBooking.status === BookingStatus.PENDING && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleConfirm(detailBooking.id);
                      setDetailBooking(null);
                    }}
                    disabled={confirming === detailBooking.id}
                  >
                    {confirming === detailBooking.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    Confirm
                  </Button>
                )}
                {/* Owner: Complete confirmed */}
                {isOwner && detailBooking.status === BookingStatus.CONFIRMED && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      handleComplete(detailBooking.id);
                      setDetailBooking(null);
                    }}
                    disabled={completing === detailBooking.id}
                  >
                    {completing === detailBooking.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    Complete
                  </Button>
                )}
                {/* Cancel — available for pending/confirmed */}
                {(detailBooking.status === BookingStatus.PENDING ||
                  detailBooking.status === BookingStatus.CONFIRMED) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDetailBooking(null);
                      setCancelTarget(detailBooking);
                    }}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                )}
                {/* Review — customer can review completed bookings */}
                {!isOwner &&
                  detailBooking.status === BookingStatus.COMPLETED &&
                  !reviewedBookingIds.has(detailBooking.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDetailBooking(null);
                        setReviewTarget(detailBooking);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                    >
                      <Star className="mr-1 h-3.5 w-3.5" />
                      Review
                    </Button>
                  )}
                {/* Calendar icon — pushed to the right */}
                {(detailBooking.status === BookingStatus.PENDING ||
                  detailBooking.status === BookingStatus.CONFIRMED) && (
                  <div className="ml-auto">
                    <AddToCalendar
                      event={bookingToCalendarEvent(detailBooking, calendarPerspective)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Review modal */}
      <Modal
        open={!!reviewTarget}
        onOpenChange={(open) => {
          if (!open) {
            setReviewTarget(null);
            setReviewRating(5);
            setReviewComment('');
          }
        }}
        title="Write a Review"
        description={
          reviewTarget?.business
            ? `Share your experience at ${reviewTarget.business.name}`
            : 'Share your experience'
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Star rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="rounded-sm p-0.5 transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= reviewRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
            </div>
          </div>
          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{reviewComment.length}/1000 characters</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
