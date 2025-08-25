import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Plus, X } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type DayHours = {
  open?: string;
  close?: string;
  closed: boolean;
};

type PickupHoursSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export const PickupHoursSelector: React.FC<PickupHoursSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  const [hours, setHours] = useState<Record<string, DayHours>>(
    days.reduce((acc, d) => {
      acc[d] = { open: "09:00", close: "17:00", closed: false };
      return acc;
    }, {} as Record<string, DayHours>)
  );

  const [holidays, setHolidays] = useState<string[]>([]);

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      // Parse the value string to populate the hours state
      // This is simplified - you'd need more robust parsing in production
      try {
        const parsed = JSON.parse(value);
        if (parsed.hours) setHours(parsed.hours);
        if (parsed.holidays) setHolidays(parsed.holidays);
      } catch {
        // If it's not JSON, just use it as a simple string
      }
    }
  }, [value]);

  // Update parent whenever hours or holidays change
  useEffect(() => {
    const formatted = formatPickupHours(hours, holidays);
    onChange?.(formatted);
  }, [hours, holidays, onChange]);

  const updateDay = (day: string, field: keyof DayHours, value: any) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const applyToAll = (sourceDay: string) => {
    const { open, close, closed } = hours[sourceDay];
    setHours(
      days.reduce((acc, d) => {
        acc[d] = { open, close, closed };
        return acc;
      }, {} as Record<string, DayHours>)
    );
  };

  const addHoliday = () => {
    setHolidays([...holidays, ""]);
  };

  const updateHoliday = (idx: number, value: string) => {
    const newHolidays = [...holidays];
    newHolidays[idx] = value;
    setHolidays(newHolidays);
  };

  const removeHoliday = (idx: number) => {
    setHolidays(holidays.filter((_, i) => i !== idx));
  };

  // ---- Formatting helpers ----
  const formatPickupHours = (hours: Record<string, DayHours>, holidays: string[] = []): string => {
    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const groups: Record<string, string[]> = {};
    daysOrder.forEach((day) => {
      const entry = hours[day];
      if (!entry.open || !entry.close) return;
      const label = entry.closed ? "Closed" : `${entry.open}–${entry.close}`;
      if (!groups[label]) groups[label] = [];
      groups[label].push(day);
    });

    const chunks = Object.entries(groups).map(([time, days]) => {
      const range = compressDays(days);
      return `${range} ${time}`;
    });

    if (holidays.length > 0 && holidays.some(h => h)) {
      chunks.push(`Holidays: ${holidays.filter(Boolean).join(", ")}`);
    }

    return chunks.join(", ");
  };

  const compressDays = (daysArr: string[]): string => {
    const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
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
    return ranges.join(", ");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Per-day Hours */}
        {days.map((day) => (
          <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-12 font-medium text-sm">{day}</span>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`${day}-closed`}
                checked={hours[day].closed}
                onChange={(e) => updateDay(day, "closed", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor={`${day}-closed`} className="text-sm">Closed</label>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={hours[day].open}
                disabled={hours[day].closed}
                onChange={(e) => updateDay(day, "open", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={hours[day].close}
                disabled={hours[day].closed}
                onChange={(e) => updateDay(day, "close", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyToAll(day)}
              className="text-xs"
            >
              Apply to All
            </Button>
          </div>
        ))}
      </div>

      {/* Holiday Dates */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium text-sm">Holiday Dates (Optional)</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHoliday}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Holiday
          </Button>
        </div>
        
        {holidays.length > 0 && (
          <div className="space-y-2">
            {holidays.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="date"
                  value={h}
                  onChange={(e) => updateHoliday(idx, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHoliday(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-sm mb-1 text-blue-900">Preview</h3>
        <p className="text-sm text-blue-700">
          {formatPickupHours(hours, holidays) || "No pickup hours set"}
        </p>
      </div>
    </div>
  );
};