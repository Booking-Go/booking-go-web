import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, CalendarOff } from 'lucide-react';
import type { BusinessHoliday } from '@/types';

interface HolidaysEditorProps {
  holidays: BusinessHoliday[];
  newHoliday: { date: string; reason: string };
  onNewHolidayChange: (value: { date: string; reason: string }) => void;
  onAdd: () => void;
  onRemove: (holidayId: string) => void;
  saving: boolean;
}

/**
 * Private component — holiday CRUD editor.
 * Used in the business detail page (Holidays tab).
 */
export function HolidaysEditor({
  holidays,
  newHoliday,
  onNewHolidayChange,
  onAdd,
  onRemove,
  saving,
}: HolidaysEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarOff className="h-5 w-5" />
          Holidays
        </CardTitle>
        <CardDescription>Days your business will be closed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add holiday form */}
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="holidayDate">Date</Label>
            <Input
              id="holidayDate"
              type="date"
              value={newHoliday.date}
              onChange={(e) => onNewHolidayChange({ ...newHoliday, date: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="holidayReason">Reason</Label>
            <Input
              id="holidayReason"
              value={newHoliday.reason}
              onChange={(e) => onNewHolidayChange({ ...newHoliday, reason: e.target.value })}
              placeholder="e.g. New Year's Day"
            />
          </div>
          <Button onClick={onAdd} disabled={saving || !newHoliday.date}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <Separator />

        {holidays.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No holidays scheduled.</p>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between rounded-lg border border-border/40 p-3"
              >
                <div>
                  <span className="text-sm font-medium">
                    {new Date(holiday.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {holiday.reason && (
                    <span className="ml-2 text-sm text-muted-foreground">— {holiday.reason}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(holiday.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
