'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { businessApi, type BusinessListParams } from '@/lib/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loading, EmptyState } from '@/components/shared';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { Business, PaginationMeta } from '@/types';

const CATEGORIES = [
  'all',
  'Salon',
  'Clinic',
  'Gym',
  'Spa',
  'Consultant',
  'Studio',
  'Other',
];

export default function ExplorePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params: BusinessListParams = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (city) params.city = city;

      const result = await businessApi.list(params);
      setBusinesses(result.businesses);
      setMeta(result.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, city]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    setPage(1);
  }, [search, category, city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('all');
    setCity('');
  };

  const hasFilters = search || category !== 'all' || city;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero search */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find & Book Services
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Discover salons, clinics, gyms, and more. Book your next appointment in seconds.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search businesses..."
                className="h-11 pl-10 pr-4"
              />
            </div>
            <Button type="submit" className="h-11 px-6">
              Search
            </Button>
          </form>

          {/* Filter row */}
          <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-[140px]"
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container py-10">
        {meta && !loading && (
          <p className="mb-6 text-sm text-muted-foreground">
            {meta.total} business{meta.total !== 1 ? 'es' : ''} found
          </p>
        )}

        {loading ? (
          <Loading />
        ) : businesses.length === 0 ? (
          <EmptyState
            icon={<Store className="h-12 w-12" />}
            title="No businesses found"
            description={
              hasFilters
                ? 'Try adjusting your search or filters.'
                : 'No businesses are available yet.'
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/explore/${biz.slug}`}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {biz.category}
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-primary">
                  {biz.name}
                </h3>

                {/* Description */}
                {biz.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {biz.description}
                  </p>
                )}

                {/* Location */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {biz.city}, {biz.state}
                </div>

                {/* CTA */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View & Book <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
