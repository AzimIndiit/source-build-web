import React, { useState } from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterConfig {
  status?: string;
}

interface UserFilterDropdownProps {
  filters?: FilterConfig;
  onFilterChange?: (filters: FilterConfig) => void;
  className?: string;
}

export const UserFilterDropdown: React.FC<UserFilterDropdownProps> = ({
  filters = {
    status: '',
  },
  onFilterChange,
  className = '',
}) => {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters);

  const handleStatusChange = (status: keyof FilterConfig['status']) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: status,
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterConfig = {
      status: '',
    };
    setLocalFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange?.(localFilters);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 bg-primary/10 hover:bg-primary/20 ${className}`}
        >
          <FilterIcon className="w-4 h-4 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full md:w-[600px] p-4">
        {/* Order Status Section */}

        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900"> Status</h3>
          <div className="flex flex-wrap gap-3">
            {['Active', 'Inactive', 'Pending'].map((key) => (
              <label
                key={key}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleStatusChange(key as keyof FilterConfig['status']);
                }}
              >
                <Checkbox
                  checked={localFilters.status === key}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="  w-[126px] h-[48px] !text-sm text-primary border border-gray-200-primary hover:bg-primary/10 hover:text-primary"
          >
            Clear All Filters
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="w-[126px] h-[48px] !text-sm  bg-primary hover:bg-primary/90 text-white"
          >
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
