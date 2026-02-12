'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { businessApi } from '@/lib/business';
import { serviceApi } from '@/lib/service';
import { slotApi } from '@/lib/slot';
import { bookingApi, type CreateBookingPayload } from '@/lib/booking';
import { reviewApi } from '@/lib/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loading, Modal } from '@/components/shared';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  IndianRupee,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Store,
  Star,
  MessageSquare,
} from 'lucide-react';
import { messageApi } from '@/lib/message';
import type { Business, BusinessHours, Service, Slot, Review, ReviewMeta } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const [business, setBusiness] = useState<Business | null>(null);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking flow
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Confirm booking modal
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingPeople, setBookingPeople] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMeta, setReviewMeta] = useState<ReviewMeta | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Message business
  const [startingChat, setStartingChat] = useState(false);

  // Load business data
  useEffect(() => {
    async function load() {
      try {
        const biz = await businessApi.getBySlug(slug);
        setBusiness(biz);

        const [svcList, hoursList] = await Promise.all([
          serviceApi.getByBusinessId(biz.id),
          businessApi.getHours(biz.id),
        ]);
        setServices(svcList.filter((s) => s.isActive));
        setHours(hoursList);
      } catch {
        toast.error('Business not found');
        router.push('/explore');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, router]);

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!business) return;
    setLoadingReviews(true);
    try {
      const result = await reviewApi.getByBusiness(business.id, { page: reviewPage, limit: 5 });
      setReviews(result.reviews);
      setReviewMeta(result.meta);
    } catch {
      // Reviews are non-critical — silently fail
    } finally {
      setLoadingReviews(false);
    }
  }, [business, reviewPage]);

  useEffect(() => {
    if (business) loadReviews();
  }, [business, reviewPage, loadReviews]);

  // Load available slots when service or date changes
  const loadSlots = useCallback(async () => {
    if (!business || !selectedService) return;
    setLoadingSlots(true);
    try {
      const slots = await slotApi.getAvailable({
        businessId: business.id,
        serviceId: selectedService.id,
        date: selectedDate,
      });
      setAvailableSlots(slots);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [business, selectedService, selectedDate]);

  useEffect(() => {
    if (selectedService) loadSlots();
  }, [selectedService, selectedDate, loadSlots]);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    // Don't go to past dates
    const today = new Date().toISOString().split('T')[0];
    const next = d.toISOString().split('T')[0];
    if (next < today) return;
    setSelectedDate(next);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleSelectSlot = (slot: Slot) => {
    if (!user) {
      toast.error('Please sign in to book');
      router.push(`/login?callbackUrl=/explore/${slug}`);
      return;
    }
    setSelectedSlot(slot);
    setBookingNotes('');
    setBookingPeople(1);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const payload: CreateBookingPayload = {
        slotId: selectedSlot.id,
      };
      if (bookingPeople > 1) payload.numberOfPeople = bookingPeople;
      if (bookingNotes.trim()) payload.notes = bookingNotes.trim();

      await bookingApi.create(payload);
      setBookingSuccess(true);
      // Refresh slots to reflect the booking
      loadSlots();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!business) return null;

  const handleMessageBusiness = async () => {
    if (!user) {
      toast.error('Please sign in to message this business');
      router.push(`/login?callbackUrl=/explore/${slug}`);
      return;
    }
    setStartingChat(true);
    try {
      await messageApi.startConversation({
        businessId: business.id,
        message: `Hi, I have a question about ${business.name}.`,
      });
      router.push('/dashboard/messages');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back navigation */}
      <div className="container pt-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/explore" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to explore
          </Link>
        </Button>
      </div>

      <div className="container pb-16 pt-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left column: Business info ── */}
          <div className="space-y-6 lg:col-span-1">
            {/* Business header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                    <Store className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {business.category}
                      </Badge>
                      {business.isVerified && (
                        <Badge variant="secondary" className="text-xs text-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {business.description && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {business.description}
                  </p>
                )}

                <Separator className="my-4" />

                {/* Contact info */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {business.addressLine1}
                      {business.addressLine2 && `, ${business.addressLine2}`}, {business.city},{' '}
                      {business.state} {business.zipCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>{business.email}</span>
                  </div>
                  {business.website && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Globe className="h-4 w-4 shrink-0" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate transition-colors hover:text-foreground"
                      >
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Message business */}
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={handleMessageBusiness}
              disabled={startingChat}
            >
              {startingChat ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Message this Business
            </Button>

            {/* Business hours */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hours.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Hours not set.</p>
                ) : (
                  <div className="space-y-1.5">
                    {DAYS.map((day, i) => {
                      const h = hours.find((hr) => hr.dayOfWeek === i);
                      const today = new Date().getDay();
                      // JS getDay: 0=Sun, we use 0=Mon
                      const adjustedToday = today === 0 ? 6 : today - 1;
                      const isCurrentDay = i === adjustedToday;
                      return (
                        <div
                          key={day}
                          className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                            isCurrentDay ? 'bg-primary/5 font-medium' : ''
                          }`}
                        >
                          <span>{day}</span>
                          <span className="text-muted-foreground">
                            {h && !h.isClosed ? `${h.openTime} – ${h.closeTime}` : 'Closed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: Services & Booking ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Services list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services</CardTitle>
                <CardDescription>Select a service to see available time slots.</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No services available at this time.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                          selectedService?.id === svc.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-border'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-medium">{svc.name}</span>
                          {svc.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {svc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(svc.duration)}
                            </span>
                            {svc.maxCapacity > 1 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                up to {svc.maxCapacity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {svc.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available slots (shown after selecting a service) */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Available Slots — {selectedService.name}
                  </CardTitle>
                  <CardDescription>Pick a date and select a time slot to book.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Date navigator */}
                  <div className="mb-5 flex items-center justify-between rounded-lg border border-border/40 p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => changeDate(-1)}
                      disabled={isToday}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatDateLabel(selectedDate)}</span>
                      {!isToday && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 h-7 text-xs"
                          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                        >
                          Today
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Date picker */}
                  <div className="mb-5">
                    <Input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>

                  {/* Slots grid */}
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-10 text-center">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        No available slots on this date. Try another day.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {availableSlots.map((slot) => {
                        const spotsLeft = slot.capacity - slot.bookedCount;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className="flex flex-col items-center rounded-lg border border-border/60 p-3 transition-all hover:border-primary hover:bg-primary/5"
                          >
                            <span className="text-sm font-medium tabular-nums">
                              {formatTime(slot.startTime)}
                            </span>
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              {formatTime(slot.endTime)}
                            </span>
                            <div className="mt-1.5 flex items-center gap-1 text-xs">
                              <IndianRupee className="h-3 w-3" />
                              <span>{slot.price.toFixed(0)}</span>
                            </div>
                            {slot.capacity > 1 && (
                              <span className="mt-1 text-[10px] text-muted-foreground">
                                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Reviews section ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Reviews</CardTitle>
                  {reviewMeta && reviewMeta.reviewCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{reviewMeta.averageRating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({reviewMeta.reviewCount} review{reviewMeta.reviewCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No reviews yet. Be the first to leave a review!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="space-y-2 rounded-lg border border-border/40 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {review.customer?.firstName?.[0]}
                              {review.customer?.lastName?.[0]}
                            </div>
                            <span className="text-sm font-medium">
                              {review.customer?.firstName} {review.customer?.lastName}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Review pagination */}
                    {reviewMeta && reviewMeta.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                          disabled={reviewPage <= 1}
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Page {reviewPage} of {reviewMeta.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewPage((p) => p + 1)}
                          disabled={reviewPage >= reviewMeta.totalPages}
                        >
                          Next
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Booking confirmation modal ── */}
      <Modal
        open={!!selectedSlot}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null);
            setBookingSuccess(false);
          }
        }}
        title={bookingSuccess ? 'Booking Confirmed!' : 'Confirm Booking'}
        description={
          bookingSuccess
            ? 'Your booking has been placed successfully.'
            : 'Review the details and confirm your appointment.'
        }
        footer={
          bookingSuccess ? (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSlot(null);
                  setBookingSuccess(false);
                }}
              >
                Book Another
              </Button>
              <Button onClick={() => router.push('/dashboard/bookings')}>View My Bookings</Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
              </Button>
            </div>
          )
        }
      >
        {bookingSuccess ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You&apos;ll receive a notification once the business confirms your appointment.
            </p>
          </div>
        ) : selectedSlot ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium">{business.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span>{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDateLabel(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>
                  {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Price</span>
                <span className="flex items-center gap-0.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {selectedSlot.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Number of people (if capacity > 1) */}
            {selectedSlot.capacity > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of People</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedSlot.capacity - selectedSlot.bookedCount}
                  value={bookingPeople}
                  onChange={(e) => setBookingPeople(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Max: {selectedSlot.capacity - selectedSlot.bookedCount}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any special requests?"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
