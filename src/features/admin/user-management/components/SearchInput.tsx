import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: propValue = '',
  onChange,
  placeholder = 'Search users...',
  delay = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(propValue);
  const debouncedValue = useDebounce(localValue, delay);
  const isInitialMount = useRef(true);

  // Update local value when prop value changes from parent
  useEffect(() => {
    setLocalValue(propValue);
  }, [propValue]);

  // Call onChange when debounced value changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    onChange(debouncedValue);
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    // Clear local value
    setLocalValue('');
    // Immediately notify parent without debounce
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-9 pr-10 h-[40px] border-gray-300"
        />
        {localValue && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};
