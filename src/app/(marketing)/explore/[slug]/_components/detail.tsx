'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getAvailableSlots } from '@/actions/slot';
import { createBooking } from '@/actions/booking';
import { getBusinessReviews } from '@/actions/review';
import { startConversation } from '@/actions/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Modal } from '@/components/shared';
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
import { saveBookingIntent, consumeBookingIntent } from '@/lib/booking-intent';
import type { Business, BusinessHours, Service, Slot, Review, ReviewMeta } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface BusinessDetailProps {
  initialBusiness: Business;
  initialHours: BusinessHours[];
  initialServices: Service[];
}

export function BusinessDetail({
  initialBusiness,
  initialHours,
  initialServices,
}: BusinessDetailProps) {
  const slug = initialBusiness.slug;
  const router = useRouter();
  const { user } = useAuthStore();

  const [business] = useState<Business>(initialBusiness);
  const [hours] = useState<BusinessHours[]>(initialHours);
  const [services] = useState<Service[]>(initialServices.filter((s) => s.isActive));

  // Booking flow
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const LOOKAHEAD_DAYS = 14;

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

  // Ref to hold a pending intent slot ID while we wait for slots to load
  const pendingIntentSlotId = useRef<string | null>(null);
  const dateStripRef = useRef<HTMLDivElement>(null);

  // Restore booking intent after sign-in
  useEffect(() => {
    if (!user || !services.length) return;
    const intent = consumeBookingIntent(slug);
    if (!intent) return;

    // Find the service the user had selected
    const svc = services.find((s) => s.id === intent.serviceId);
    if (!svc) return;

    // Store the pending slot ID — it will be resolved once slots finish loading
    pendingIntentSlotId.current = intent.slotId;
    setSelectedDate(intent.date);
    setSelectedService(svc);
  }, [user, services, slug]);

  // Load reviews
  const loadReviews = useCallback(async () => {
    if (!business) return;
    setLoadingReviews(true);
    try {
      const result = await getBusinessReviews(business.id, { page: reviewPage, limit: 5 });
      if (result.success) {
        setReviews(result.data.reviews);
        setReviewMeta(result.data.meta);
      }
    } catch {
      // Reviews are non-critical — silently fail
    } finally {
      setLoadingReviews(false);
    }
  }, [business, reviewPage]);

  useEffect(() => {
    if (business) loadReviews();
  }, [business, reviewPage, loadReviews]);

  // Load all slots for 14 days when service changes
  const loadSlots = useCallback(async () => {
    if (!business || !selectedService) return;
    setLoadingSlots(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + LOOKAHEAD_DAYS - 1);

      const result = await getAvailableSlots({
        businessId: business.id,
        serviceId: selectedService.id,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      if (result.success) {
        setAllSlots(result.data);

        // Auto-select the first date that has available slots
        if (result.data.length > 0) {
          const firstAvailableDate = new Date(result.data[0].startTime).toISOString().split('T')[0];
          setSelectedDate(firstAvailableDate);
        } else {
          setSelectedDate(today.toISOString().split('T')[0]);
        }
      } else {
        setAllSlots([]);
      }
    } catch {
      setAllSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [business, selectedService]);

  useEffect(() => {
    if (selectedService) loadSlots();
  }, [selectedService, loadSlots]);

  // Complete intent restoration — auto-open the slot modal once slots are loaded
  useEffect(() => {
    if (!pendingIntentSlotId.current || loadingSlots || allSlots.length === 0) return;
    const slotId = pendingIntentSlotId.current;
    pendingIntentSlotId.current = null;

    const slot = allSlots.find((s) => s.id === slotId);
    if (slot && slot.capacity - slot.bookedCount > 0) {
      setSelectedSlot(slot);
      setBookingNotes('');
      setBookingPeople(1);
      setBookingSuccess(false);
      toast.success('Welcome back! Finish your booking below.');
    }
  }, [allSlots, loadingSlots]);

  // Derive slots for the selected date and availability map from allSlots
  const availableSlots = allSlots.filter((slot) => {
    const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
    return slotDate === selectedDate && slot.capacity - slot.bookedCount > 0;
  });

  /** Map of date string → number of available slots. */
  const dateAvailabilityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const slot of allSlots) {
      if (slot.capacity - slot.bookedCount <= 0) continue;
      const d = new Date(slot.startTime).toISOString().split('T')[0];
      map.set(d, (map.get(d) || 0) + 1);
    }
    return map;
  }, [allSlots]);

  /** Generate the 14-day strip dates starting from today. */
  const today = new Date().toISOString().split('T')[0];
  const dateStrip = useMemo(() => {
    const dates: string[] = [];
    const start = new Date(today + 'T00:00:00');
    for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [today]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleSelectSlot = (slot: Slot) => {
    if (!user) {
      // Save intent so the booking resumes after sign-in
      if (selectedService) {
        saveBookingIntent({
          businessSlug: slug,
          serviceId: selectedService.id,
          date: selectedDate,
          slotId: slot.id,
        });
      }
      toast('Please sign in to book', {
        description: "You'll be brought right back to finish booking.",
      });
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
      const payload: { slotId: string; numberOfPeople?: number; notes?: string } = {
        slotId: selectedSlot.id,
      };
      if (bookingPeople > 1) payload.numberOfPeople = bookingPeople;
      if (bookingNotes.trim()) payload.notes = bookingNotes.trim();

      const result = await createBooking(payload);
      if (!result.success) throw new Error(result.error);
      setBookingSuccess(true);
      // Refresh slots to reflect the booking
      loadSlots();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageBusiness = async () => {
    if (!user) {
      toast('Please sign in to message this business', {
        description: "You'll be brought right back.",
      });
      router.push(`/login?callbackUrl=/explore/${slug}`);
      return;
    }
    setStartingChat(true);
    try {
      const result = await startConversation({
        businessId: business.id,
      });
      if (!result.success) throw new Error(result.error);
      router.push(`/dashboard/messages?open=${result.data.conversation.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start conversation');
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
                  <CardDescription>
                    Select a date to see available time slots. Green dots indicate availability.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {/* 14-day horizontal date strip with arrow buttons */}
                      <div className="relative mb-6">
                        {/* Left arrow */}
                        <button
                          type="button"
                          onClick={() => {
                            dateStripRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
                          }}
                          className="absolute -left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted"
                          aria-label="Scroll dates left"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div
                          ref={dateStripRef}
                          className="mx-8 flex gap-1.5 overflow-x-hidden scroll-smooth"
                        >
                          {dateStrip.map((dateStr) => {
                            const d = new Date(dateStr + 'T00:00:00');
                            const dayName = d
                              .toLocaleDateString(undefined, { weekday: 'short' })
                              .toUpperCase();
                            const dayNum = d.getDate();
                            const isSelected = dateStr === selectedDate;
                            const slotCount = dateAvailabilityMap.get(dateStr) || 0;
                            const hasSlots = slotCount > 0;
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex w-16 shrink-0 flex-col items-center rounded-xl py-2.5 text-center transition-all ${
                                  isSelected
                                    ? 'border-2 border-primary bg-primary/10 text-primary'
                                    : hasSlots
                                      ? 'border border-border/60 hover:border-primary/40 hover:bg-muted/50'
                                      : 'border border-border/30 text-muted-foreground/50'
                                }`}
                              >
                                <span
                                  className={`text-[10px] font-medium leading-tight ${isToday ? 'text-primary' : ''}`}
                                >
                                  {isToday ? 'TODAY' : dayName}
                                </span>
                                <span
                                  className={`text-lg font-semibold leading-tight ${isSelected ? '' : hasSlots ? 'text-foreground' : ''}`}
                                >
                                  {dayNum}
                                </span>
                                {/* Availability indicator */}
                                <span
                                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                    hasSlots ? 'bg-green-500' : 'bg-muted-foreground/20'
                                  }`}
                                />
                                {hasSlots && (
                                  <span className="mt-0.5 text-[9px] leading-tight text-muted-foreground">
                                    {slotCount} slots
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right arrow */}
                        <button
                          type="button"
                          onClick={() => {
                            dateStripRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
                          }}
                          className="absolute -right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-colors hover:bg-muted"
                          aria-label="Scroll dates right"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Selected date label */}
                      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDateLabel(selectedDate)}
                      </div>

                      {/* Slots grid */}
                      {availableSlots.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/60 py-10 text-center">
                          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
                          <p className="mt-3 text-sm text-muted-foreground">
                            No available slots on this date.
                          </p>
                          {dateAvailabilityMap.size > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground/70">
                              Pick a date with a green dot above to find available slots.
                            </p>
                          )}
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
                    </>
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
