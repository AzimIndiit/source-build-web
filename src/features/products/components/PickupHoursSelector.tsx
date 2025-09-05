import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

type PickupHoursSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

// Memoized day component to prevent unnecessary re-renders
const DayRow = React.memo(
  ({
    day,
    hours,
    onUpdateTime,
    onUpdateClosed,
    onApplyToAll,
  }: {
    day: string;
    hours: DayHours;
    onUpdateTime: (day: string, field: 'open' | 'close', value: string) => void;
    onUpdateClosed: (day: string, value: boolean) => void;
    onApplyToAll: (day: string) => void;
  }) => {
    return (
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-col justify-between gap-3">
          <span className="w-12 font-medium text-sm">{day}</span>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="time"
              value={hours.open}
              disabled={hours.closed}
              onChange={(e) => onUpdateTime(day, 'open', e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 h-8 w-28 cursor-pointer"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="time"
              value={hours.close}
              min={hours.open}
              disabled={hours.closed}
              onChange={(e) => onUpdateTime(day, 'close', e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-100 h-8 w-28 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hours.closed}
              onChange={(e) => onUpdateClosed(day, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Closed
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onApplyToAll(day)}
            className="!text-xs whitespace-nowrap h-7 border-primary text-primary hover:text-primary"
          >
            Apply to All
          </Button>
        </div>
      </div>
    );
  }
);

DayRow.displayName = 'DayRow';

export const PickupHoursSelector: React.FC<PickupHoursSelectorProps> = React.memo(
  ({ value, onChange }) => {
    // Initialize hours state - all days start with same default values
    const [hours, setHours] = useState<Record<string, DayHours>>(() =>
      days.reduce(
        (acc, d) => {
          acc[d] = { open: '09:00', close: '17:00', closed: false };
          return acc;
        },
        {} as Record<string, DayHours>
      )
    );

    const [holidays, setHolidays] = useState<string[]>([]);

    // Simple parsing functions
    const expandDayRange = useCallback((range: string): string[] => {
      const dayMap: Record<string, number> = {
        Mon: 0,
        Monday: 0,
        Tue: 1,
        Tuesday: 1,
        Wed: 2,
        Wednesday: 2,
        Thu: 3,
        Thursday: 3,
        Fri: 4,
        Friday: 4,
        Sat: 5,
        Saturday: 5,
        Sun: 6,
        Sunday: 6,
      };

      const result: string[] = [];

      if (range.includes('–') || range.includes('-')) {
        const parts = range.split(/[–-]/);
        if (parts.length === 2) {
          const startDay = parts[0].trim();
          const endDay = parts[1].trim();
          const startIdx = dayMap[startDay];
          const endIdx = dayMap[endDay];

          if (startIdx !== undefined && endIdx !== undefined) {
            for (let i = startIdx; i <= endIdx; i++) {
              result.push(days[i]);
            }
          }
        }
      } else {
        const day = range.trim();
        const idx = dayMap[day];
        if (idx !== undefined) {
          result.push(days[idx]);
        }
      }

      return result;
    }, []);

    const parseFormattedString = useCallback(
      (str: string): Record<string, DayHours> | null => {
        try {
          const result: Record<string, DayHours> = {};

          // Initialize all days with default values
          days.forEach((day) => {
            result[day] = { open: '09:00', close: '17:00', closed: false };
          });

          // Split by comma and process each segment
          const segments = str.split(',').map((s) => s.trim());

          segments.forEach((segment) => {
            if (segment.toLowerCase().includes('holiday')) return;

            if (segment.includes('Closed')) {
              const dayPart = segment.replace('Closed', '').trim();
              const affectedDays = expandDayRange(dayPart);
              affectedDays.forEach((day) => {
                result[day] = { open: '09:00', close: '17:00', closed: true };
              });
            } else {
              const match = segment.match(/^(.+?)\s+(\d{2}:\d{2})[–-](\d{2}:\d{2})$/);
              if (match) {
                const [, dayPart, openTime, closeTime] = match;
                const affectedDays = expandDayRange(dayPart);
                affectedDays.forEach((day) => {
                  result[day] = { open: openTime, close: closeTime, closed: false };
                });
              }
            }
          });

          return result;
        } catch (error) {
          console.error('Error parsing formatted string:', error);
          return null;
        }
      },
      [expandDayRange]
    );

    // Parse initial value only once on mount
    useEffect(() => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.hours) {
            const newHours: Record<string, DayHours> = {};
            Object.entries(parsed.hours).forEach(([day, dayHours]: [string, any]) => {
              newHours[day] = {
                open: dayHours.open || '09:00',
                close: dayHours.close || '17:00',
                closed: dayHours.closed || false,
              };
            });
            setHours(newHours);
          }
          if (parsed.holidays) setHolidays(parsed.holidays);
        } catch {
          const parsedHours = parseFormattedString(value);
          if (parsedHours) {
            setHours(parsedHours);
          }
        }
      }
    }, []); // Empty deps - only run once on mount

    // Formatting functions
    const compressDays = useCallback((daysArr: string[]): string => {
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
    }, []);

    const formatPickupHours = useCallback(
      (hrs: Record<string, DayHours>, hols: string[] = []): string => {
        const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const groups: Record<string, string[]> = {};

        daysOrder.forEach((day) => {
          const entry = hrs[day];
          if (entry.closed) {
            const label = 'Closed';
            if (!groups[label]) groups[label] = [];
            groups[label].push(day);
          } else {
            const label = `${entry.open}–${entry.close}`;
            if (!groups[label]) groups[label] = [];
            groups[label].push(day);
          }
        });

        const chunks = Object.entries(groups).map(([time, daysList]) => {
          const range = compressDays(daysList);
          return `${range} ${time}`;
        });

        if (hols.length > 0 && hols.some((h) => h)) {
          chunks.push(`Holidays: ${hols.filter(Boolean).join(', ')}`);
        }

        return chunks.join(', ');
      },
      [compressDays]
    );

    // Simple update handlers
    const updateClosed = useCallback((day: string, checked: boolean) => {
      setHours((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          closed: checked,
        },
      }));
    }, []);
    const updateTime = useCallback((day: string, field: 'open' | 'close', value: string) => {
      setHours((prev) => {
        const newHours = { ...prev };
        const currentDay = prev[day];

        // Validate time logic for open time
        if (field === 'open' && value >= currentDay.close) {
          // Adjust close time to 1 hour after open time
          const openDate = new Date(`2000-01-01T${value}`);
          openDate.setHours(openDate.getHours() + 1);
          const newCloseTime = openDate.toTimeString().slice(0, 5);

          newHours[day] = {
            ...currentDay,
            open: value,
            close: newCloseTime,
          };
        } else if (field === 'close' && value <= currentDay.open) {
          // Don't update if close time is before open time
          return prev;
        } else {
          // Normal update
          newHours[day] = {
            ...currentDay,
            [field]: value,
          };
        }

        return newHours;
      });
    }, []);

    const applyToAll = useCallback(
      (sourceDay: string) => {
        const sourceHours = hours[sourceDay];

        // Simply copy the source day's state to all days
        setHours(
          days.reduce(
            (acc, d) => {
              acc[d] = { ...sourceHours };
              return acc;
            },
            {} as Record<string, DayHours>
          )
        );
      },
      [hours]
    );

    // Debounced onChange notification
    useEffect(() => {
      if (!onChange) return;

      const timeoutId = setTimeout(() => {
        const formatted = formatPickupHours(hours, holidays);
        onChange(formatted);
      }, 500);

      return () => clearTimeout(timeoutId);
    }, [hours, holidays]); // Remove onChange and formatPickupHours from deps to prevent loops

    // Memoize preview text
    const previewText = useMemo(() => {
      return formatPickupHours(hours, holidays) || 'No pickup hours set';
    }, [hours, holidays, formatPickupHours]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {days.map((day) => (
            <DayRow
              key={day}
              day={day}
              hours={hours[day]}
              onUpdateTime={updateTime}
              onUpdateClosed={updateClosed}
              onApplyToAll={applyToAll}
            />
          ))}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-sm mb-1 text-primary">Preview</h3>
          <p className="text-sm text-primary">{previewText}</p>
        </div>
      </div>
    );
  }
);

PickupHoursSelector.displayName = 'PickupHoursSelector';
