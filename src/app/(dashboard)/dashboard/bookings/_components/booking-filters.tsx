'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface BookingFiltersProps {
  status: string;
  dateRange: { startDate: string; endDate: string };
  onStatusChange: (status: string) => void;
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  onClear: () => void;
}

export function BookingFilters({
  status,
  dateRange,
  onStatusChange,
  onDateRangeChange,
  onClear,
}: BookingFiltersProps) {
  const hasFilters = status !== 'all' || dateRange.startDate || dateRange.endDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="no_show">No Show</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={dateRange.startDate}
        onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
        className="w-[150px]"
        placeholder="Start date"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        value={dateRange.endDate}
        onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
        className="w-[150px]"
        placeholder="End date"
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 text-xs">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
