'use client';

import { useEffect, useState } from 'react';
import { serviceApi, type CreateServicePayload, type UpdateServicePayload } from '@/lib/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ConfirmDialog } from '@/components/shared';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Clock, IndianRupee, Users, PackageOpen } from 'lucide-react';
import type { Service } from '@/types';

interface ServicesEditorProps {
  businessId: string;
}

const emptyForm: CreateServicePayload = {
  name: '',
  description: '',
  duration: 30,
  price: 0,
  depositAmount: 0,
  maxCapacity: 1,
  bufferTime: 0,
};

/**
 * Private component — full service catalog CRUD.
 * Used in the business detail page (Services tab).
 */
export function ServicesEditor({ businessId }: ServicesEditorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<CreateServicePayload>({ ...emptyForm });

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    serviceApi
      .getByBusinessId(businessId)
      .then(setServices)
      .catch((err) => {
        toast.error(err?.response?.data?.error?.message || 'Failed to load services');
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const openCreate = () => {
    setEditingService(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      depositAmount: service.depositAmount,
      maxCapacity: service.maxCapacity,
      bufferTime: service.bufferTime,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (form.duration < 5) {
      toast.error('Minimum duration is 5 minutes');
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        // Build partial payload — only send changed fields
        const payload: UpdateServicePayload = {};
        if (form.name !== editingService.name) payload.name = form.name;
        if (form.description !== (editingService.description || '')) payload.description = form.description;
        if (form.duration !== editingService.duration) payload.duration = form.duration;
        if (form.price !== editingService.price) payload.price = form.price;
        if (form.depositAmount !== editingService.depositAmount) payload.depositAmount = form.depositAmount;
        if (form.maxCapacity !== editingService.maxCapacity) payload.maxCapacity = form.maxCapacity;
        if (form.bufferTime !== editingService.bufferTime) payload.bufferTime = form.bufferTime;

        if (Object.keys(payload).length === 0) {
          toast.info('No changes to save');
          setSaving(false);
          return;
        }

        const updated = await serviceApi.update(businessId, editingService.id, payload);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success('Service updated');
      } else {
        const created = await serviceApi.create(businessId, form);
        setServices((prev) => [...prev, created]);
        toast.success('Service created');
      }
      setShowModal(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await serviceApi.delete(businessId, deleteTarget.id);
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Service deleted');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to delete service');
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const set = (field: keyof CreateServicePayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = ['duration', 'price', 'depositAmount', 'maxCapacity', 'bufferTime'].includes(field)
      ? Number(e.target.value)
      : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PackageOpen className="h-5 w-5" />
                Services
              </CardTitle>
              <CardDescription>Manage the services your business offers.</CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="py-8 text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No services yet. Add your first service to get started.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Service
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      {!service.isActive && (
                        <Badge variant="outline" className="text-xs text-amber-500">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {service.price.toFixed(2)}
                      </span>
                      {service.maxCapacity > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {service.maxCapacity} max
                        </span>
                      )}
                      {service.bufferTime > 0 && (
                        <span>+{service.bufferTime}min buffer</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 pl-4">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(service)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title={editingService ? 'Edit Service' : 'New Service'}
        description={editingService ? 'Update service details.' : 'Add a new service to your business.'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingService ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-name">Name</Label>
            <Input
              id="svc-name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Men's Haircut"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-desc">Description</Label>
            <Textarea
              id="svc-desc"
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the service"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="svc-duration">Duration (minutes)</Label>
              <Input
                id="svc-duration"
                type="number"
                min={5}
                max={480}
                value={form.duration}
                onChange={set('duration')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-price">Price (₹)</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={set('price')}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="svc-capacity">Max Capacity</Label>
              <Input
                id="svc-capacity"
                type="number"
                min={1}
                value={form.maxCapacity}
                onChange={set('maxCapacity')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-buffer">Buffer Time (min)</Label>
              <Input
                id="svc-buffer"
                type="number"
                min={0}
                max={120}
                value={form.bufferTime}
                onChange={set('bufferTime')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-deposit">Deposit Amount (₹)</Label>
            <Input
              id="svc-deposit"
              type="number"
              min={0}
              step={0.01}
              value={form.depositAmount}
              onChange={set('depositAmount')}
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This service will be permanently removed. Any slots linked to it won't be affected."
        variant="destructive"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
