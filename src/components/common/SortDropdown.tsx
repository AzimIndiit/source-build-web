import React, { useState } from 'react';
import { ArrowUpNarrowWide, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string, dateRange?: { from: Date; to: Date }) => void;
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'custom', label: 'Custom Range' },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortOptions = defaultSortOptions,
  selectedSort = 'recent',
  onSortChange,
  className = '',
}) => {
  const [value, setValue] = useState<string>(selectedSort);
  const [tempValue, setTempValue] = useState<string>(selectedSort);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [tempDateRange, setTempDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal state with prop changes
  React.useEffect(() => {
    setValue(selectedSort);
    setTempValue(selectedSort);
  }, [selectedSort]);

  React.useEffect(() => {
    if (isOpen) {
      setTempValue(value);
      if (value === 'custom' && dateRange.from && dateRange.to) {
        setTempDateRange(dateRange);
      }
    }
  }, [isOpen, value, dateRange]);

  const handleChange = (newValue: string) => {
    setTempValue(newValue);
    if (newValue === 'custom' && dateRange.from && dateRange.to) {
      setTempDateRange(dateRange);
    }
  };

  const handleDateSelect = (key: 'from' | 'to', date?: Date) => {
    const newRange = { ...tempDateRange };

    if (key === 'from') {
      newRange.from = date;
      // If the new from date is after the current to date, reset the to date
      if (date && newRange.to && date > newRange.to) {
        newRange.to = undefined;
      }
    } else {
      newRange.to = date;
    }

    setTempDateRange(newRange);
  };

  const handleReset = () => {
    setTempValue('recent');
    setTempDateRange({});
    setValue('recent');
    setDateRange({});
    onSortChange?.('recent');
  };

  const handleApply = () => {
    if (tempValue === 'custom') {
      if (tempDateRange.from && tempDateRange.to) {
        setValue(tempValue);
        setDateRange(tempDateRange);
        onSortChange?.(tempValue, { from: tempDateRange.from, to: tempDateRange.to });
        setIsOpen(false);
      }
    } else {
      setValue(tempValue);
      setDateRange(dateRange);
      onSortChange?.(tempValue);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 bg-primary/10 hover:bg-primary/20 ${className}`}
        >
          <ArrowUpNarrowWide className="w-4 h-4 text-primary" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-78 p-3">
        <RadioGroup value={tempValue} onValueChange={handleChange} className="space-y-2">
          {sortOptions.map((opt) => (
            <div key={opt.value} className="flex flex-col">
              <label
                className={`flex items-center space-x-2 cursor-pointer justify-between ${
                  tempValue === opt.value ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <RadioGroupItem value={opt.value} id={opt.value} />
              </label>

              {opt.value === 'custom' && tempValue === 'custom' && (
                <div className="mt-3 flex  gap-2 border-t border-gray-200 pt-3">
                  {/* Start Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex flex-col items-start gap-2">
                        <label className="text-md">From</label>
                        <Button
                          variant="outline"
                          className="h-10 w-34  !text-sm font-normal border-gray-200 flex items-center justify-between gap-2 "
                        >
                          <span className="w-full">
                            {tempDateRange.from
                              ? format(tempDateRange.from, 'LLL dd, y')
                              : 'Select date'}
                          </span>
                          <CalendarIcon className="w-4 h-4 text-muted-foreground " />
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0 bg-white border-gray-200">
                      <Calendar
                        mode="single"
                        selected={tempDateRange.from}
                        onSelect={(date) => handleDateSelect('from', date)}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* End Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex flex-col items-start gap-2">
                        <label className="text-md">To</label>
                        <Button
                          variant="outline"
                          className=" h-10 w-34 !text-sm text-left font-normal border-gray-200 flex items-center gap-2 pr-2"
                        >
                          <span className="flex-1">
                            {tempDateRange.to
                              ? format(tempDateRange.to, 'LLL dd, y')
                              : 'Select date'}
                          </span>
                          <span>
                            {' '}
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          </span>
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0 bg-white border-gray-200">
                      <Calendar
                        mode="single"
                        selected={tempDateRange.to}
                        onSelect={(date) => handleDateSelect('to', date)}
                        disabled={(date) =>
                          tempDateRange.from ? date < tempDateRange.from : false
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 h-10 !text-sm border-gray-200 text-gray-700 hover:bg-gray-5 rounded-sm"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={tempValue === 'custom' && (!tempDateRange.from || !tempDateRange.to)}
            className="flex-1 h-10 !text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-sm"
          >
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
