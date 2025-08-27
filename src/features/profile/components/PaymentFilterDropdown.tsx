import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface SortOption {
  value: string;
  label: string;
}

interface PaymentFilterDropdownProps {
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

export const PaymentFilterDropdown: React.FC<PaymentFilterDropdownProps> = ({
  sortOptions = defaultSortOptions,
  selectedSort = 'all',
  onSortChange,
  className = '',
}) => {
  const [value, setValue] = useState<string>(selectedSort);
  const [tempValue, setTempValue] = useState<string>(selectedSort);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newValue: string) => {
    setTempValue(newValue);
    if (newValue !== 'custom') {
    }
  };

  const handleReset = () => {
    setTempValue('all');
    setValue('all');
    onSortChange?.('all');
  };

  const handleApply = () => {
    setValue(tempValue);
    onSortChange?.(tempValue);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 bg-primary/10 hover:bg-primary/20 ${className}`}
        >
          <Filter className="w-4 h-4 text-primary" />
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
            className="flex-1 h-10 !text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-sm"
          >
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
