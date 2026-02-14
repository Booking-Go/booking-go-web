'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { listBusinesses, getNearbyBusinesses, type NearbyBusiness } from '@/actions/business';
import { useGeolocation } from '@/lib/use-geolocation';
import { STATES_AND_CITIES, ALL_CITIES, getCitiesByState, type CityOption } from '@/lib/cities';
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
import {
  Search,
  MapPin,
  ArrowRight,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  LocateFixed,
  Navigation,
} from 'lucide-react';
import type { Business, PaginationMeta } from '@/types';

const CATEGORIES = ['all', 'Salon', 'Clinic', 'Gym', 'Spa', 'Consultant', 'Studio', 'Other'];

const DEFAULT_RADIUS = 50;

export function ExploreGrid() {
  const geo = useGeolocation();

  const [businesses, setBusinesses] = useState<(Business & { distanceKm?: number })[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  // City picker state
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);

  /** Fetch businesses — nearby if location available, otherwise fallback to regular list. */
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      if (geo.coords) {
        const result = await getNearbyBusinesses({
          lat: geo.coords.lat,
          lng: geo.coords.lng,
          radius: DEFAULT_RADIUS,
          page,
          limit: 12,
          ...(search && { search }),
          ...(category !== 'all' && { category }),
        });
        if (result.success && result.data.businesses.length > 0) {
          setBusinesses(result.data.businesses);
          setMeta(result.data.meta);
          return;
        }

        // Nearby returned 0 results or failed — fall back to city/state filter
        const fallbackParams: {
          page?: number;
          limit?: number;
          search?: string;
          category?: string;
          city?: string;
          state?: string;
        } = { page, limit: 12 };
        if (geo.cityName) fallbackParams.city = geo.cityName;
        if (search) fallbackParams.search = search;
        if (category !== 'all') fallbackParams.category = category;

        const fallback = await listBusinesses(fallbackParams);
        if (fallback.success) {
          setBusinesses(fallback.data.businesses);
          setMeta(fallback.data.meta);
        } else {
          setBusinesses([]);
          setMeta(null);
        }
      } else {
        const params: { page?: number; limit?: number; search?: string; category?: string } = {
          page,
          limit: 12,
        };
        if (search) params.search = search;
        if (category !== 'all') params.category = category;

        const result = await listBusinesses(params);
        if (result.success) {
          setBusinesses(result.data.businesses);
          setMeta(result.data.meta);
        }
      }
    } catch {
      // Silently fall back — don't toast errors on a public browse page
    } finally {
      setLoading(false);
    }
  }, [geo.coords, geo.cityName, page, search, category]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    setPage(1);
  }, [search, category, geo.coords]);

  // Close city picker when location is resolved
  useEffect(() => {
    if (geo.coords && geo.cityName) {
      setShowCityPicker(false);
      setCitySearch('');
      setSelectedState(null);
    }
  }, [geo.coords, geo.cityName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('all');
  };

  const handleCitySelect = (city: CityOption) => {
    geo.setCityManually(city.name, city.coords);
    setShowCityPicker(false);
    setCitySearch('');
    setSelectedState(null);
  };

  const handleStateBack = () => {
    setSelectedState(null);
    setCitySearch('');
  };

  /** Filter states or cities within a selected state based on search. */
  const filteredStates = useMemo(() => {
    if (!citySearch) return STATES_AND_CITIES;
    const q = citySearch.toLowerCase();
    return STATES_AND_CITIES.filter((s) => s.name.toLowerCase().includes(q));
  }, [citySearch]);

  const filteredCitiesInState = useMemo(() => {
    if (!selectedState) return [];
    const cities = getCitiesByState(selectedState);
    if (!citySearch) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [selectedState, citySearch]);

  /** Global city search (searches across all states). */
  const globalCityResults = useMemo(() => {
    if (!citySearch || selectedState) return [];
    const q = citySearch.toLowerCase();
    return ALL_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    );
  }, [citySearch, selectedState]);

  const hasFilters = search || category !== 'all';

  const formatDistance = (km?: number) => {
    if (km === undefined || km === null) return null;
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)} km away`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero + Location bar */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container py-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find & Book Services</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Discover salons, clinics, gyms, and more near you.
          </p>

          {/* Location bar */}
          <div className="relative mx-auto mt-6 max-w-md">
            <div className="flex items-center justify-center gap-2">
              {geo.status === 'loading' ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
                  <LocateFixed className="h-4 w-4 animate-pulse text-primary" />
                  Detecting your location...
                </div>
              ) : geo.coords && geo.cityName ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCityPicker(!showCityPicker)}
                    className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {geo.cityName}
                  </button>
                  <button
                    onClick={() => {
                      geo.clearLocation();
                      setShowCityPicker(false);
                    }}
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Clear location"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      geo.requestLocation();
                      setShowCityPicker(false);
                    }}
                    className="gap-2 rounded-full"
                  >
                    <LocateFixed className="h-4 w-4" />
                    Use my location
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCityPicker(!showCityPicker)}
                    className="gap-2 rounded-full"
                  >
                    <MapPin className="h-4 w-4" />
                    Choose city
                  </Button>
                </div>
              )}
            </div>

            {/* City picker dropdown — State → City cascading */}
            {showCityPicker && (
              <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 shadow-lg">
                {/* Search input */}
                <Input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={
                    selectedState ? `Search in ${selectedState}...` : 'Search state or city...'
                  }
                  className="mb-2 h-9"
                  autoFocus
                />

                {/* Back button when inside a state */}
                {selectedState && (
                  <button
                    onClick={handleStateBack}
                    className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    All states
                  </button>
                )}

                <div className="max-h-60 overflow-y-auto">
                  {/* If user is searching globally (no state selected & has search text) — show city matches */}
                  {!selectedState && citySearch.length > 0 ? (
                    globalCityResults.length === 0 && filteredStates.length === 0 ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">
                        No results found
                      </p>
                    ) : (
                      <>
                        {/* Matching states */}
                        {filteredStates.length > 0 && (
                          <div className="mb-1">
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              States
                            </p>
                            {filteredStates.slice(0, 5).map((state) => (
                              <button
                                key={state.name}
                                onClick={() => {
                                  setSelectedState(state.name);
                                  setCitySearch('');
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                              >
                                <span className="font-medium">{state.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {state.cities.length} cities
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Matching cities */}
                        {globalCityResults.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Cities
                            </p>
                            {globalCityResults.slice(0, 8).map((city) => (
                              <button
                                key={`${city.state}-${city.name}`}
                                onClick={() => handleCitySelect(city)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                              >
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <div>
                                  <span className="font-medium">{city.name}</span>
                                  <span className="ml-1.5 text-xs text-muted-foreground">
                                    {city.state}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  ) : !selectedState ? (
                    /* Step 1: Show states list */
                    STATES_AND_CITIES.map((state) => (
                      <button
                        key={state.name}
                        onClick={() => {
                          setSelectedState(state.name);
                          setCitySearch('');
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <span className="font-medium">{state.name}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {state.cities.length} <ChevronRight className="h-3 w-3" />
                        </span>
                      </button>
                    ))
                  ) : /* Step 2: Show cities in selected state */
                  filteredCitiesInState.length === 0 ? (
                    <p className="py-3 text-center text-sm text-muted-foreground">
                      No cities found in {selectedState}
                    </p>
                  ) : (
                    filteredCitiesInState.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{city.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {geo.status === 'denied' && (
              <p className="mt-2 text-xs text-amber-500">
                Location access denied. Choose a city manually or enable location in browser
                settings.
              </p>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-xl items-center gap-2">
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
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
                <X className="h-3 w-3" />
                Clear filters
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
            {geo.coords && geo.cityName ? ` near ${geo.cityName}` : ''}
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
                : geo.coords
                  ? `No businesses found within ${DEFAULT_RADIUS} km. Try a different location.`
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

                {/* Location + Distance */}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {biz.city}, {biz.state}
                  </span>
                  {biz.distanceKm !== undefined && (
                    <span className="flex items-center gap-1 text-primary/80">
                      <Navigation className="h-3 w-3" />
                      {formatDistance(biz.distanceKm)}
                    </span>
                  )}
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
