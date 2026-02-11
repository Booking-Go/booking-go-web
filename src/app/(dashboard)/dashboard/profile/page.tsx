'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userApi, type UpdateProfilePayload } from '@/lib/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader, Loading } from '@/components/shared';
import { toast } from 'sonner';
import { Save, Mail, Phone, Globe, Shield, Loader2 } from 'lucide-react';
import type { User } from '@/types';

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    timezone: '',
    language: '',
  });

  useEffect(() => {
    userApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          timezone: data.timezone || 'UTC',
          language: data.language || 'en',
        });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error?.message || 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {};
      if (form.firstName !== profile?.firstName) payload.firstName = form.firstName;
      if (form.lastName !== profile?.lastName) payload.lastName = form.lastName;
      if (form.phone !== (profile?.phone || '')) payload.phone = form.phone || undefined;
      if (form.timezone !== profile?.timezone) payload.timezone = form.timezone;
      if (form.language !== profile?.language) payload.language = form.language;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }

      const updated = await userApi.updateProfile(payload);
      setProfile(updated);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('Profile updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" description="Manage your account settings." />

      {/* Account info (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
            {profile.emailVerified ? (
              <Badge variant="secondary" className="text-xs">Verified</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-500">Unverified</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">{profile.role.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Editable profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your name, phone, and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  placeholder="UTC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  placeholder="en"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
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
        </CardContent>
      </Card>
    </div>
  );
}
