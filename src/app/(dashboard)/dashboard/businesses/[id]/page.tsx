'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { businessApi, type UpdateBusinessPayload, type BusinessHoursPayload, type BusinessHolidayPayload } from '@/lib/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading, ConfirmDialog } from '@/components/shared';
import { HoursEditor } from '../_components/hours-editor';
import { HolidaysEditor } from '../_components/holidays-editor';
import { ServicesEditor } from '../_components/services-editor';
import { SlotsEditor } from '../_components/slots-editor';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';
import type { Business, BusinessHours, BusinessHoliday } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Hours state
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [hoursForm, setHoursForm] = useState<BusinessHoursPayload[]>(
    DAYS.map((_, i) => ({ dayOfWeek: i, openTime: '09:00', closeTime: '17:00', isClosed: false })),
  );
  const [savingHours, setSavingHours] = useState(false);

  // Holidays state
  const [holidays, setHolidays] = useState<BusinessHoliday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
  const [savingHoliday, setSavingHoliday] = useState(false);

  // Edit form
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    timezone: '',
  });

  useEffect(() => {
    Promise.all([
      businessApi.getById(id),
      businessApi.getHours(id),
      businessApi.getHolidays(id),
    ])
      .then(([biz, hrs, hols]) => {
        setBusiness(biz);
        setHours(hrs);
        setHolidays(hols);

        setForm({
          name: biz.name,
          slug: biz.slug,
          description: biz.description || '',
          category: biz.category,
          addressLine1: biz.addressLine1,
          addressLine2: biz.addressLine2 || '',
          city: biz.city,
          state: biz.state,
          zipCode: biz.zipCode,
          country: biz.country,
          phone: biz.phone,
          email: biz.email,
          website: biz.website || '',
          timezone: biz.settings?.timezone || 'UTC',
        });

        // Populate hours form from existing data
        if (hrs.length > 0) {
          const mapped = DAYS.map((_, i) => {
            const existing = hrs.find((h: BusinessHours) => h.dayOfWeek === i);
            return existing
              ? { dayOfWeek: i, openTime: existing.openTime, closeTime: existing.closeTime, isClosed: existing.isClosed }
              : { dayOfWeek: i, openTime: '09:00', closeTime: '17:00', isClosed: true };
          });
          setHoursForm(mapped);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error?.message || 'Failed to load business');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateBusinessPayload = {};
      if (form.name !== business?.name) payload.name = form.name;
      if (form.slug !== business?.slug) payload.slug = form.slug;
      if (form.description !== (business?.description || '')) payload.description = form.description || undefined;
      if (form.category !== business?.category) payload.category = form.category;
      if (form.addressLine1 !== business?.addressLine1) payload.addressLine1 = form.addressLine1;
      if (form.addressLine2 !== (business?.addressLine2 || '')) payload.addressLine2 = form.addressLine2 || undefined;
      if (form.city !== business?.city) payload.city = form.city;
      if (form.state !== business?.state) payload.state = form.state;
      if (form.zipCode !== business?.zipCode) payload.zipCode = form.zipCode;
      if (form.country !== business?.country) payload.country = form.country;
      if (form.phone !== business?.phone) payload.phone = form.phone;
      if (form.email !== business?.email) payload.email = form.email;
      if (form.website !== (business?.website || '')) payload.website = form.website || undefined;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }

      const updated = await businessApi.update(id, payload);
      setBusiness(updated);
      toast.success('Business updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await businessApi.delete(id);
      toast.success('Business deleted');
      router.push('/dashboard/businesses');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to delete business');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const saved = await businessApi.setHours(id, hoursForm);
      setHours(saved);
      toast.success('Business hours saved');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to save hours');
    } finally {
      setSavingHours(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.date) return;
    setSavingHoliday(true);
    try {
      const payload: BusinessHolidayPayload = { date: newHoliday.date };
      if (newHoliday.reason) payload.reason = newHoliday.reason;
      const holiday = await businessApi.addHoliday(id, payload);
      setHolidays([...holidays, holiday]);
      setNewHoliday({ date: '', reason: '' });
      toast.success('Holiday added');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to add holiday');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleRemoveHoliday = async (holidayId: string) => {
    try {
      await businessApi.removeHoliday(id, holidayId);
      setHolidays(holidays.filter((h) => h.id !== holidayId));
      toast.success('Holiday removed');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to remove holiday');
    }
  };

  const updateHourField = (dayIndex: number, field: keyof BusinessHoursPayload, value: string | boolean) => {
    setHoursForm((prev) =>
      prev.map((h) => (h.dayOfWeek === dayIndex ? { ...h, [field]: value } : h)),
    );
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  if (loading) return <Loading />;

  if (!business) return null;

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
              <Badge variant="secondary" className="text-xs">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-500">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
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
                  <Textarea id="description" value={form.description} onChange={set('description')} rows={3} />
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
                    <Input id="email" type="email" value={form.email} onChange={set('email')} required />
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
                  <Input id="addressLine1" value={form.addressLine1} onChange={set('addressLine1')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input id="addressLine2" value={form.addressLine2} onChange={set('addressLine2')} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={set('city')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={set('state')} required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" value={form.zipCode} onChange={set('zipCode')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={form.country} onChange={set('country')} required />
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
