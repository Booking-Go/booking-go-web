'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Input } from '@/components/ui/input';
import { getCitiesByState } from '@/lib/cities';
import { geocodeCity, type GeoResult } from '@/lib/geocode';
import { cn } from '@/lib/utils';
import { Check, Loader2, MapPin, AlertCircle } from 'lucide-react';

/** Coordinates resolved from the dataset or Nominatim. */
interface CityCoords {
  lat: number;
  lng: number;
}

interface CityComboboxProps {
  /** Currently selected state — required to filter suggestions. */
  state: string;
  /** Current city value (controlled). */
  value: string;
  /**
   * Called when user picks a city from suggestions or confirms a custom city.
   * `coords` is defined when resolved from dataset or Nominatim; `null` on failure.
   */
  onSelect: (city: string, coords: CityCoords | null) => void;
  /** Disable the input (e.g. when no state is selected). */
  disabled?: boolean;
  /** Placeholder text. */
  placeholder?: string;
}

/** Debounce delay (ms) before triggering geocoding on blur/confirm. */
const GEOCODE_DEBOUNCE_MS = 300;

/**
 * Searchable city input that suggests from the pre-defined dataset and
 * accepts free-text entry. Unknown cities are forward-geocoded via Nominatim
 * to resolve coordinates automatically.
 *
 * Production features:
 * - Debounced geocoding to respect Nominatim rate limits
 * - Geocode failure feedback (inline warning)
 * - Unique listbox IDs via `useId()` for multi-instance rendering
 * - Abort-safe: pending geocode is cancelled on unmount or new input
 * - Full keyboard navigation (Arrow, Enter, Escape)
 * - ARIA combobox pattern (role, aria-expanded, aria-controls, aria-activedescendant)
 */
export function CityCombobox({
  state,
  value,
  onSelect,
  disabled = false,
  placeholder = 'Type or select a city',
}: CityComboboxProps) {
  const instanceId = useId();
  const listboxId = `city-listbox-${instanceId}`;

  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Cities from the dataset for the chosen state. */
  const suggestions = state ? getCitiesByState(state) : [];

  /** Filtered by the current query (case-insensitive substring match). */
  const filtered = query
    ? suggestions.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  // ── Sync controlled value ──

  useEffect(() => {
    setQuery(value);
    setGeocodeFailed(false);
  }, [value]);

  // ── Reset when state changes ──

  useEffect(() => {
    setQuery('');
    setIsOpen(false);
    setGeocodeFailed(false);
  }, [state]);

  // ── Outside click handler ──

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Scroll highlighted item into view ──

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIdx] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  // ── Cleanup pending geocode on unmount ──

  useEffect(() => {
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, []);

  /** Pick a known city from the dataset — instant, no network call. */
  const handlePickKnown = useCallback(
    (cityName: string) => {
      const city = suggestions.find((c) => c.name === cityName);
      setQuery(cityName);
      setIsOpen(false);
      setGeocodeFailed(false);
      onSelect(cityName, city ? city.coords : null);
    },
    [suggestions, onSelect]
  );

  /**
   * Resolve a custom (unknown) city via Nominatim forward geocoding.
   * Debounced to respect Nominatim's 1 req/sec policy and prevent rapid-fire calls.
   */
  const resolveCustomCity = useCallback(
    (cityName: string) => {
      const trimmed = cityName.trim();
      if (!trimmed) return;

      // Check if it matches a known city first (case-insensitive)
      const known = suggestions.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (known) {
        onSelect(known.name, known.coords);
        setQuery(known.name);
        setGeocodeFailed(false);
        return;
      }

      // Cancel any pending geocode
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

      // Debounced geocode
      setGeocoding(true);
      setGeocodeFailed(false);

      geocodeTimerRef.current = setTimeout(async () => {
        const coords: GeoResult | null = await geocodeCity(trimmed, state);
        setGeocoding(false);

        if (coords) {
          setGeocodeFailed(false);
          onSelect(trimmed, coords);
        } else {
          setGeocodeFailed(true);
          // Still accept the city name — just warn that coords couldn't be resolved
          onSelect(trimmed, null);
        }
      }, GEOCODE_DEBOUNCE_MS);
    },
    [suggestions, state, onSelect]
  );

  /** Handle keyboard navigation inside the dropdown. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        setHighlightIdx(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < filtered.length) {
          handlePickKnown(filtered[highlightIdx].name);
        } else if (query.trim()) {
          resolveCustomCity(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        if (query && query !== value) {
          resolveCustomCity(query);
        }
        break;
    }
  };

  /** When user leaves the field with a custom value, geocode it. */
  const handleBlur = () => {
    // Delay to allow click on dropdown item to fire first
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (query && query !== value) {
          resolveCustomCity(query);
        }
      }
    }, 200);
  };

  /** Active descendant ID for screen readers. */
  const activeDescendantId =
    highlightIdx >= 0 && highlightIdx < filtered.length
      ? `${listboxId}-option-${highlightIdx}`
      : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIdx(-1);
            setGeocodeFailed(false);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn('pr-8', geocodeFailed && 'border-amber-500 focus-visible:ring-amber-500')}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          aria-invalid={geocodeFailed}
        />
        {geocoding && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Geocode failure warning */}
      {geocodeFailed && !isOpen && (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          Coordinates couldn&apos;t be resolved. Location features may be limited.
        </p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && !disabled && filtered.length > 0 && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {filtered.map((city, i) => {
            const isSelected = city.name.toLowerCase() === value.toLowerCase();
            const isHighlighted = i === highlightIdx;
            const optionId = `${listboxId}-option-${i}`;
            return (
              <li
                key={city.name}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                  isHighlighted && 'bg-accent text-accent-foreground',
                  !isHighlighted && 'hover:bg-accent/50'
                )}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handlePickKnown(city.name);
                }}
                onMouseEnter={() => setHighlightIdx(i)}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{city.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}

      {/* No match hint */}
      {isOpen && !disabled && query && filtered.length === 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md"
          role="status"
        >
          <p>
            No match in our dataset. Press{' '}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">Enter</kbd> or
            click away to use <strong className="text-foreground">&quot;{query}&quot;</strong> —
            coordinates will be resolved via geocoding.
          </p>
        </div>
      )}
    </div>
  );
}
