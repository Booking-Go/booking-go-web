'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  updateBusiness,
  deleteBusiness,
  setBusinessHours,
  addBusinessHoliday,
  removeBusinessHoliday,
} from '@/actions/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog, CityCombobox } from '@/components/shared';
import { HoursEditor } from './hours-editor';
import { HolidaysEditor } from './holidays-editor';
import { ServicesEditor } from './services-editor';
import { SlotsEditor } from './slots-editor';
import { STATES_AND_CITIES } from '@/lib/cities';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';
import type { Business, BusinessHours, BusinessHoliday } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface BusinessEditorProps {
  initialBusiness: Business;
  initialHours: BusinessHours[];
  initialHolidays: BusinessHoliday[];
}

/**
 * Client component for editing a business — details, hours, holidays, services, and slots.
 * Receives SSR-fetched data as props.
 */
export function BusinessEditor({
  initialBusiness,
  initialHours,
  initialHolidays,
}: BusinessEditorProps) {
  const id = initialBusiness.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Hours state
  const [hours, setHours] = useState<BusinessHours[]>(initialHours);
  const [hoursForm, setHoursForm] = useState<
    Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>
  >(() => {
    if (initialHours.length > 0) {
      return DAYS.map((_, i) => {
        const existing = initialHours.find((h) => h.dayOfWeek === i);
        return existing
          ? {
              dayOfWeek: i,
              openTime: existing.openTime.slice(0, 5),
              closeTime: existing.closeTime.slice(0, 5),
              isClosed: existing.isClosed,
            }
          : { dayOfWeek: i, openTime: '09:00', closeTime: '17:00', isClosed: true };
      });
    }
    return DAYS.map((_, i) => ({
      dayOfWeek: i,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: false,
    }));
  });
  const [savingHours, setSavingHours] = useState(false);

  // Holidays state
  const [holidays, setHolidays] = useState<BusinessHoliday[]>(initialHolidays);
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
  const [savingHoliday, setSavingHoliday] = useState(false);

  // Edit form
  const [form, setForm] = useState({
    name: business.name,
    slug: business.slug,
    description: business.description || '',
    category: business.category,
    addressLine1: business.addressLine1,
    addressLine2: business.addressLine2 || '',
    city: business.city,
    state: business.state,
    zipCode: business.zipCode,
    country: business.country,
    phone: business.phone,
    email: business.email,
    website: business.website || '',
    timezone: business.settings?.timezone || 'UTC',
  });

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (form.name !== business.name) payload.name = form.name;
      if (form.slug !== business.slug) payload.slug = form.slug;
      if (form.description !== (business.description || ''))
        payload.description = form.description || undefined;
      if (form.category !== business.category) payload.category = form.category;
      if (form.addressLine1 !== business.addressLine1) payload.addressLine1 = form.addressLine1;
      if (form.addressLine2 !== (business.addressLine2 || ''))
        payload.addressLine2 = form.addressLine2 || undefined;
      if (form.city !== business.city) payload.city = form.city;
      if (form.state !== business.state) payload.state = form.state;
      if (form.zipCode !== business.zipCode) payload.zipCode = form.zipCode;
      if (form.country !== business.country) payload.country = form.country;

      // Auto-populate coordinates from city data or geocoding
      if (cityCoords) {
        payload.latitude = cityCoords.lat;
        payload.longitude = cityCoords.lng;
      }

      if (form.phone !== business.phone) payload.phone = form.phone;
      if (form.email !== business.email) payload.email = form.email;
      if (form.website !== (business.website || '')) payload.website = form.website || undefined;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }

      const result = await updateBusiness(id, payload);
      if (!result.success) throw new Error(result.error);
      setBusiness(result.data);
      toast.success('Business updated');
      setActiveTab('services');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteBusiness(id);
      if (!result.success) throw new Error(result.error);
      toast.success('Business deleted');
      router.push('/dashboard/businesses');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete business');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const result = await setBusinessHours(id, hoursForm);
      if (!result.success) throw new Error(result.error);
      setHours(result.data);
      toast.success('Business hours saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save hours');
    } finally {
      setSavingHours(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.date) return;
    setSavingHoliday(true);
    try {
      const payload: { date: string; reason?: string } = { date: newHoliday.date };
      if (newHoliday.reason) payload.reason = newHoliday.reason;
      const result = await addBusinessHoliday(id, payload);
      if (!result.success) throw new Error(result.error);
      setHolidays([...holidays, result.data]);
      setNewHoliday({ date: '', reason: '' });
      toast.success('Holiday added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add holiday');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleRemoveHoliday = async (holidayId: string) => {
    try {
      const result = await removeBusinessHoliday(id, holidayId);
      if (!result.success) throw new Error(result.error);
      setHolidays(holidays.filter((h) => h.id !== holidayId));
      toast.success('Holiday removed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove holiday');
    }
  };

  const updateHourField = (
    dayIndex: number,
    field: keyof (typeof hoursForm)[number],
    value: string | boolean
  ) => {
    setHoursForm((prev) =>
      prev.map((h) => (h.dayOfWeek === dayIndex ? { ...h, [field]: value } : h))
    );
  };

  /** Resolved coordinates (from dataset or Nominatim geocoding). */
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  /** When state changes, reset city and coords. */
  const handleStateChange = (state: string) => {
    setForm({ ...form, state, city: '' });
    setCityCoords(null);
  };

  /** When city is selected or typed, store coords from combobox. */
  const handleCitySelect = (cityName: string, coords: { lat: number; lng: number } | null) => {
    setForm((prev) => ({ ...prev, city: cityName }));
    setCityCoords(coords);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{business.category}</span>
            {business.isActive ? (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-500">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <form onSubmit={handleSaveDetails} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name</Label>
                    <Input id="name" value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={form.slug} onChange={set('slug')} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={form.category} onChange={set('category')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={set('description')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={set('phone')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" value={form.website} onChange={set('website')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={form.addressLine1}
                    onChange={set('addressLine1')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={form.addressLine2}
                    onChange={set('addressLine2')}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={form.state} onValueChange={handleStateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES_AND_CITIES.map((s) => (
                          <SelectItem key={s.name} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <CityCombobox
                      state={form.state}
                      value={form.city}
                      onSelect={handleCitySelect}
                      disabled={!form.state}
                      placeholder={form.state ? 'Type or select a city' : 'Select state first'}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" value={form.zipCode} onChange={set('zipCode')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country || 'India'} disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Business
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <ServicesEditor businessId={id} />
        </TabsContent>

        {/* Slots Tab */}
        <TabsContent value="slots" className="space-y-6">
          <SlotsEditor businessId={id} />
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-6">
          <HoursEditor
            hoursForm={hoursForm}
            onChange={updateHourField}
            onSave={handleSaveHours}
            saving={savingHours}
          />
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-6">
          <HolidaysEditor
            holidays={holidays}
            newHoliday={newHoliday}
            onNewHolidayChange={setNewHoliday}
            onAdd={handleAddHoliday}
            onRemove={handleRemoveHoliday}
            saving={savingHoliday}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete business?"
        description="This action cannot be undone. All data associated with this business will be permanently removed."
        variant="destructive"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
