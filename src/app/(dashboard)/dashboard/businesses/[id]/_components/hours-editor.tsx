import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Clock } from 'lucide-react';

interface BusinessHoursFormItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface HoursEditorProps {
  hoursForm: BusinessHoursFormItem[];
  onChange: (dayIndex: number, field: keyof BusinessHoursFormItem, value: string | boolean) => void;
  onSave: () => void;
  saving: boolean;
}

/**
 * Private component — weekly business hours editor.
 * Used in the business detail page (Hours tab).
 */
export function HoursEditor({ hoursForm, onChange, onSave, saving }: HoursEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>Set your weekly operating hours.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {DAYS.map((day, i) => {
          const h = hoursForm.find((hf) => hf.dayOfWeek === i)!;
          return (
            <div
              key={day}
              className="flex items-center gap-3 rounded-lg border border-border/40 p-3"
            >
              <div className="w-24 text-sm font-medium">{day}</div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!h.isClosed}
                  onChange={(e) => onChange(i, 'isClosed', !e.target.checked)}
                  className="rounded"
                />
                Open
              </label>
              {!h.isClosed && (
                <>
                  <Input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => onChange(i, 'openTime', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => onChange(i, 'closeTime', e.target.value)}
                    className="w-32"
                  />
                </>
              )}
              {h.isClosed && <span className="text-sm text-muted-foreground">Closed</span>}
            </div>
          );
        })}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
