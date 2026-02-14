'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState } from '@/components/shared';
import { Plus, Store } from 'lucide-react';
import { BusinessCard } from './card';
import type { Business } from '@/types';

interface BusinessListProps {
  initialBusinesses: Business[];
}

export function BusinessList({ initialBusinesses }: BusinessListProps) {
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

      {initialBusinesses.length === 0 ? (
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
          {initialBusinesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}
