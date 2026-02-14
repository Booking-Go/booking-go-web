'use client';

import * as React from 'react';
import { format, startOfMonth, endOfMonth, subDays, subMonths, startOfYear } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** Preset quick-select option */
interface DatePreset {
  label: string;
  range: DateRange;
}

/** Build preset options relative to today */
const getPresets = (): DatePreset[] => {
  const today = new Date();
  return [
    {
      label: 'This Month',
      range: { from: startOfMonth(today), to: endOfMonth(today) },
    },
    {
      label: 'Last 7 Days',
      range: { from: subDays(today, 7), to: today },
    },
    {
      label: 'Last 30 Days',
      range: { from: subDays(today, 30), to: today },
    },
    {
      label: 'Last 3 Months',
      range: { from: subMonths(today, 3), to: today },
    },
    {
      label: 'Year to Date',
      range: { from: startOfYear(today), to: today },
    },
    {
      label: 'Last Month',
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
  ];
};

interface DateRangePickerProps {
  /** Currently selected range */
  dateRange: DateRange | undefined;
  /** Callback when range changes */
  onDateRangeChange: (range: DateRange | undefined) => void;
  /** Additional className */
  className?: string;
}

/**
 * A date range picker with calendar popover and preset quick-selects.
 * Used on the dashboard for filtering analytics by a custom date range.
 */
export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const presets = React.useMemo(() => getPresets(), []);

  const handlePresetSelect = (preset: DatePreset) => {
    onDateRangeChange(preset.range);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-9 justify-start gap-2 px-3 text-left text-sm font-medium',
            !dateRange && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}
              </>
            ) : (
              format(dateRange.from, 'MMM d, yyyy')
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
        <div className="flex flex-col sm:flex-row">
          {/* Presets sidebar */}
          <div className="flex flex-row gap-1 overflow-x-auto border-b border-border/40 p-2 sm:w-36 sm:flex-col sm:overflow-x-visible sm:border-b-0 sm:border-r">
            {presets.map((preset) => {
              const isActive =
                dateRange?.from?.getTime() === preset.range.from?.getTime() &&
                dateRange?.to?.getTime() === preset.range.to?.getTime();
              return (
                <Button
                  key={preset.label}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 justify-start whitespace-nowrap text-xs"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
          {/* Calendar */}
          <div className="p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              defaultMonth={dateRange?.from}
              disabled={{ after: endOfMonth(new Date()) }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
