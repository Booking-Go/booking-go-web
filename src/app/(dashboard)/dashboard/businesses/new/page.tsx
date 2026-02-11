'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessApi, type CreateBusinessPayload } from '@/lib/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

export default function NewBusinessPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
    timezone: 'UTC',
  });

  // Auto-generate slug from business name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setForm({ ...form, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: CreateBusinessPayload = {
        name: form.name,
        slug: form.slug,
        category: form.category,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
        phone: form.phone,
        email: form.email,
        timezone: form.timezone,
      };
      if (form.description) payload.description = form.description;
      if (form.addressLine2) payload.addressLine2 = form.addressLine2;
      if (form.website) payload.website = form.website;

      const business = await businessApi.create(payload);
      toast.success('Business created!');
      router.push(`/dashboard/businesses/${business.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to create business');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Create Business" description="Set up a new business listing." />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Name, category, and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Awesome Salon"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">booking.go/</span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={set('slug')}
                  placeholder="my-awesome-salon"
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={set('category')}
                placeholder="Salon, Clinic, Gym..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={set('description')}
                placeholder="Tell customers about your business..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Details</CardTitle>
            <CardDescription>How customers can reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="hello@business.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={set('website')}
                placeholder="https://mybusiness.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
            <CardDescription>Physical address of your business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={set('addressLine1')}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={form.addressLine2}
                onChange={set('addressLine2')}
                placeholder="Suite 100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={set('city')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={set('state')}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  value={form.zipCode}
                  onChange={set('zipCode')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={set('country')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={form.timezone}
                onChange={set('timezone')}
                placeholder="UTC"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/businesses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Store className="mr-2 h-4 w-4" />
            )}
            Create Business
          </Button>
        </div>
      </form>
    </div>
  );
}
