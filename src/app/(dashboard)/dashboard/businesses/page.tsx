'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { businessApi } from '@/lib/business';
import { Button } from '@/components/ui/button';
import { PageHeader, Loading, EmptyState } from '@/components/shared';
import { toast } from 'sonner';
import { Plus, Store } from 'lucide-react';
import { BusinessCard } from './_components';
import type { Business } from '@/types';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessApi
      .getMyBusinesses()
      .then(setBusinesses)
      .catch((err) => {
        toast.error(err?.response?.data?.error?.message || 'Failed to load businesses');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Businesses" description="Manage your business listings.">
        <Button asChild>
          <Link href="/dashboard/businesses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Business
          </Link>
        </Button>
      </PageHeader>

      {businesses.length === 0 ? (
        <EmptyState
          icon={<Store className="h-12 w-12" />}
          title="No businesses yet"
          description="Create your first business to get started."
        >
          <Button asChild>
            <Link href="/dashboard/businesses/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Business
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}
