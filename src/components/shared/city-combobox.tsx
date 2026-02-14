'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { getCitiesByState } from '@/lib/cities';
import { geocodeCity } from '@/lib/geocode';
import { cn } from '@/lib/utils';
import { Check, Loader2, MapPin } from 'lucide-react';

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

/**
 * Searchable city input that suggests from the pre-defined dataset and
 * accepts free-text entry. Unknown cities are forward-geocoded via Nominatim
 * to resolve coordinates automatically.
 */
export function CityCombobox({
  state,
  value,
  onSelect,
  disabled = false,
  placeholder = 'Type or select a city',
}: CityComboboxProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /** Cities from the dataset for the chosen state. */
  const suggestions = state ? getCitiesByState(state) : [];

  /** Filtered by the current query. */
  const filtered = suggestions.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  /** Keep local query in sync when controlled value changes externally. */
  useEffect(() => {
    setQuery(value);
  }, [value]);

  /** Close dropdown on outside click. */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Scroll active item into view. */
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIdx] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  /** Pick a known city from the dataset. */
  const handlePickKnown = useCallback(
    (cityName: string) => {
      const city = suggestions.find((c) => c.name === cityName);
      setQuery(cityName);
      setIsOpen(false);
      onSelect(cityName, city ? city.coords : null);
    },
    [suggestions, onSelect]
  );

  /** Resolve a custom (unknown) city via Nominatim. */
  const resolveCustomCity = useCallback(
    async (cityName: string) => {
      if (!cityName.trim()) return;

      // Check if it matches a known city first
      const known = suggestions.find((c) => c.name.toLowerCase() === cityName.trim().toLowerCase());
      if (known) {
        onSelect(known.name, known.coords);
        setQuery(known.name);
        return;
      }

      // Forward-geocode via Nominatim
      setGeocoding(true);
      const coords = await geocodeCity(cityName.trim(), state);
      setGeocoding(false);
      onSelect(cityName.trim(), coords);
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
        } else {
          resolveCustomCity(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
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
    }, 150);
  };

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
          }}
          onFocus={() => {
            if (query || suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="pr-8"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="city-listbox"
          role="combobox"
        />
        {geocoding && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && !disabled && filtered.length > 0 && (
        <ul
          id="city-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {filtered.map((city, i) => {
            const isSelected = city.name.toLowerCase() === value.toLowerCase();
            const isHighlighted = i === highlightIdx;
            return (
              <li
                key={city.name}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
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
                <span className="flex-1">{city.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && !disabled && query && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          <p>
            No match found. Press <kbd className="rounded border px-1 text-xs">Enter</kbd> or click
            away to use <strong>&quot;{query}&quot;</strong> — coordinates will be resolved
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
