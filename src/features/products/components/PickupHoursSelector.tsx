import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Plus, X } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DayHours = {
  open?: string;
  close?: string;
  closed: boolean;
};

type PickupHoursSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export const PickupHoursSelector: React.FC<PickupHoursSelectorProps> = ({ value, onChange }) => {
  const [hours, setHours] = useState<Record<string, DayHours>>(
    days.reduce(
      (acc, d) => {
        acc[d] = { open: '09:00', close: '17:00', closed: false };
        return acc;
      },
      {} as Record<string, DayHours>
    )
  );

  const [holidays, setHolidays] = useState<string[]>([]);

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.hours) setHours(parsed.hours);
        if (parsed.holidays) setHolidays(parsed.holidays);
      } catch {
        // ignore invalid JSON
      }
    }
  }, [value]);

  // Notify parent with debounce to prevent infinite loops
  useEffect(() => {
    if (!onChange) return;

    const timeoutId = setTimeout(() => {
      const formatted = formatPickupHours(hours, holidays);
      onChange(formatted);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [hours, holidays]);

  const updateDay = (day: string, field: keyof DayHours, value: any) => {
    setHours((prev) => {
      const currentDay = prev[day];

      // Validate time logic
      if (field === 'open' && currentDay.close) {
        // If setting open time, ensure it's before close time
        if (value >= currentDay.close) {
          // If open time is after or equal to close time, adjust close time to 1 hour after
          const openDate = new Date(`2000-01-01T${value}`);
          openDate.setHours(openDate.getHours() + 1);
          const newCloseTime = openDate.toTimeString().slice(0, 5);
          return {
            ...prev,
            [day]: { ...currentDay, open: value, close: newCloseTime },
          };
        }
      } else if (field === 'close' && currentDay.open) {
        // If setting close time, ensure it's after open time
        if (value <= currentDay.open) {
          // Don't update if close time is before or equal to open time
          return prev;
        }
      }

      return {
        ...prev,
        [day]: { ...prev[day], [field]: value },
      };
    });
  };

  const applyToAll = (sourceDay: string) => {
    const { open, close, closed } = hours[sourceDay];
    setHours(
      days.reduce(
        (acc, d) => {
          acc[d] = { open, close, closed };
          return acc;
        },
        {} as Record<string, DayHours>
      )
    );
  };

  // ---- Formatting helpers ----
  const formatPickupHours = (hours: Record<string, DayHours>, holidays: string[] = []): string => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const groups: Record<string, string[]> = {};
    daysOrder.forEach((day) => {
      const entry = hours[day];
      // Handle closed days first
      if (entry.closed) {
        const label = 'Closed';
        if (!groups[label]) groups[label] = [];
        groups[label].push(day);
      } else if (entry.open && entry.close) {
        // Only process open days if they have both times
        const label = `${entry.open}–${entry.close}`;
        if (!groups[label]) groups[label] = [];
        groups[label].push(day);
      }
    });

    const chunks = Object.entries(groups).map(([time, days]) => {
      const range = compressDays(days);
      return `${range} ${time}`;
    });

    if (holidays.length > 0 && holidays.some((h) => h)) {
      chunks.push(`Holidays: ${holidays.filter(Boolean).join(', ')}`);
    }

    return chunks.join(', ');
  };

  const compressDays = (daysArr: string[]): string => {
    const map: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };
    const sorted = daysArr.sort((a, b) => map[a] - map[b]);

    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (map[sorted[i]] !== map[prev] + 1) {
        ranges.push(start === prev ? start : `${start}–${prev}`);
        start = sorted[i];
      }
      prev = sorted[i];
    }
    ranges.push(start === prev ? start : `${start}–${prev}`);
    return ranges.join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Per-day Hours */}
      <div className="space-y-2">
        {days.map((day) => (
          <div key={day} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
            {/* Top row: Day + Time inputs */}
            <div className="flex flex-col justify-between gap-3">
              {/* Day label */}
              <span className="w-12 font-medium text-sm">{day}</span>

              {/* Time inputs */}
              <div className="flex items-center gap-2 flex-1 ">
                <input
                  type="time"
                  value={hours[day].open}
                  disabled={hours[day].closed}
                  onChange={(e) => updateDay(day, 'open', e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 h-8 w-28 cursor-pointer"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="time"
                  value={hours[day].close}
                  min={hours[day].open}
                  disabled={hours[day].closed}
                  onChange={(e) => updateDay(day, 'close', e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 h-8 w-28 cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom row: Closed + Apply */}
            <div className="flex items-center gap-3 ">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hours[day].closed}
                  onChange={(e) => updateDay(day, 'closed', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Closed
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyToAll(day)}
                className="!text-xs whitespace-nowrap h-7 border-primary text-primary hover:text-primary"
              >
                Apply to All
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-sm mb-1 text-primary">Preview</h3>
        <p className="text-sm text-primary">
          {formatPickupHours(hours, holidays) || 'No pickup hours set'}
        </p>
      </div>
    </div>
  );
};
