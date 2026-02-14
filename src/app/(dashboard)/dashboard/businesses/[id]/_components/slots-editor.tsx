'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getSlots,
  bulkCreateSlots,
  updateSlot,
  deleteSlot,
  type BulkCreateSlotsPayload,
} from '@/actions/slot';
import { getServicesByBusiness } from '@/actions/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Modal, ConfirmDialog } from '@/components/shared';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Zap,
  Trash2,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { Slot, Service } from '@/types';

interface SlotsEditorProps {
  businessId: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Private component — slot management with bulk generation and day-view browsing.
 * Used in the business detail page (Slots tab).
 */
export function SlotsEditor({ businessId }: SlotsEditorProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date for viewing
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Bulk generate modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bulkForm, setBulkForm] = useState<{
    serviceId: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    capacity: number;
    price: number;
  }>({
    serviceId: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [0, 1, 2, 3, 4],
    capacity: 1,
    price: 0,
  });

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Slot | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggling availability
  const [toggling, setToggling] = useState<string | null>(null);

  // Load services once
  useEffect(() => {
    getServicesByBusiness(businessId)
      .then((result) => {
        if (result.success) setServices(result.data);
      })
      .catch(() => {});
  }, [businessId]);

  // Load slots for selected date
  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSlots({
        businessId,
        date: selectedDate,
        limit: 100,
      });
      if (!result.success) throw new Error(result.error);
      setSlots(result.data.slots);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedDate]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // ── Date navigation ──

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // ── Bulk generate ──

  const openBulkGenerate = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setBulkForm({
      serviceId: services[0]?.id || '',
      startDate: today,
      endDate: nextWeek.toISOString().split('T')[0],
      daysOfWeek: [0, 1, 2, 3, 4],
      capacity: 1,
      price: services[0]?.price || 0,
    });
    setShowBulkModal(true);
  };

  const handleBulkGenerate = async () => {
    if (!bulkForm.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (!bulkForm.startDate || !bulkForm.endDate) {
      toast.error('Please select a date range');
      return;
    }
    if (bulkForm.daysOfWeek.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setGenerating(true);
    try {
      const payload: BulkCreateSlotsPayload = {
        businessId,
        serviceId: bulkForm.serviceId,
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        daysOfWeek: bulkForm.daysOfWeek,
        capacity: bulkForm.capacity,
        price: bulkForm.price,
      };

      const result = await bulkCreateSlots(payload);
      if (!result.success) throw new Error(result.error);
      toast.success(result.data.message);
      setShowBulkModal(false);
      loadSlots(); // refresh
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const toggleDay = (day: number) => {
    setBulkForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  // ── Toggle availability ──

  const handleToggleAvailability = async (slot: Slot) => {
    setToggling(slot.id);
    try {
      const result = await updateSlot(slot.id, { isAvailable: !slot.isAvailable });
      if (!result.success) throw new Error(result.error);
      setSlots((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
      toast.success(result.data.isAvailable ? 'Slot opened' : 'Slot blocked');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update slot');
    } finally {
      setToggling(null);
    }
  };

  // ── Delete ──

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteSlot(deleteTarget.id);
      if (!result.success) throw new Error(result.error);
      setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Slot deleted');
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete slot');
    } finally {
      setDeleting(false);
    }
  };

  // ── Helpers ──

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const handleServiceChange = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    setBulkForm((prev) => ({
      ...prev,
      serviceId,
      price: svc?.price || prev.price,
    }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClock className="h-5 w-5" />
                Time Slots
              </CardTitle>
              <CardDescription>Manage appointment slots for your services.</CardDescription>
            </div>
            <Button size="sm" onClick={openBulkGenerate} disabled={services.length === 0}>
              <Zap className="mr-1.5 h-4 w-4" />
              Auto-Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                Add services first, then generate time slots.
              </p>
            </div>
          ) : (
            <>
              {/* Date navigation bar */}
              <div className="mb-5 flex items-center justify-between rounded-lg border border-border/40 p-3">
                <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatDateLabel(selectedDate)}</span>
                  {!isToday(selectedDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 h-7 text-xs"
                      onClick={goToToday}
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
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>

              {/* Slots list */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No slots for this date. Use Auto-Generate to create slots.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        slot.isAvailable
                          ? slot.bookedCount > 0
                            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
                            : 'border-border/40'
                          : 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium tabular-nums">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </span>
                          {slot.isAvailable ? (
                            slot.bookedCount > 0 ? (
                              <Badge variant="outline" className="text-xs text-amber-600">
                                {slot.bookedCount}/{slot.capacity} booked
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Available
                              </Badge>
                            )
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {slot.service && (
                            <span className="font-medium text-foreground/80">
                              {slot.service.name}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <IndianRupee className="h-3 w-3" />
                            {slot.price.toFixed(2)}
                          </span>
                          {slot.capacity > 1 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {slot.capacity} capacity
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 pl-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleAvailability(slot)}
                          disabled={toggling === slot.id || slot.bookedCount > 0}
                          title={slot.isAvailable ? 'Block slot' : 'Open slot'}
                        >
                          {toggling === slot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : slot.isAvailable ? (
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(slot)}
                          disabled={slot.bookedCount > 0}
                          className="text-destructive hover:text-destructive"
                          title={
                            slot.bookedCount > 0 ? 'Cannot delete — has bookings' : 'Delete slot'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary footer */}
              {!loading && slots.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                  <span>
                    {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    {slots.filter((s) => s.isAvailable && s.bookedCount === 0).length} available
                  </span>
                  <span>{slots.filter((s) => s.bookedCount > 0).length} partially booked</span>
                  <span>{slots.filter((s) => !s.isAvailable).length} blocked</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Generate Modal */}
      <Modal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        title="Auto-Generate Slots"
        description="Automatically create time slots based on your business hours and service duration."
        className="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkGenerate} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Slots
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Service picker */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={bulkForm.serviceId} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((svc) => (
                  <SelectItem key={svc.id} value={svc.id}>
                    {svc.name} ({svc.duration}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-start">Start Date</Label>
              <Input
                id="bulk-start"
                type="date"
                value={bulkForm.startDate}
                onChange={(e) => setBulkForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-end">End Date</Label>
              <Input
                id="bulk-end"
                type="date"
                value={bulkForm.endDate}
                onChange={(e) => setBulkForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Days of week */}
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkForm.daysOfWeek.includes(i)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent'
                  }`}
                  onClick={() => toggleDay(i)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity & price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-capacity">Capacity per slot</Label>
              <Input
                id="bulk-capacity"
                type="number"
                min={1}
                max={100}
                value={bulkForm.capacity}
                onChange={(e) => setBulkForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-price">Price (₹)</Label>
              <Input
                id="bulk-price"
                type="number"
                min={0}
                step={0.01}
                value={bulkForm.price}
                onChange={(e) => setBulkForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Info note */}
          <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            Slots will be auto-generated based on your business hours and the selected
            service&apos;s duration + buffer time. Holidays are automatically skipped.
          </p>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this slot?"
        description={
          deleteTarget
            ? `Remove the ${formatTime(deleteTarget.startTime)} – ${formatTime(deleteTarget.endTime)} slot. This cannot be undone.`
            : ''
        }
        variant="destructive"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
