import React, { useState } from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterConfig {
  orderStatus?: string;
  pricing?: 'high-to-low' | 'low-to-high' | '';
}

interface OrderFilterDropdownProps {
  filters?: FilterConfig;
  onFilterChange?: (filters: FilterConfig) => void;
  className?: string;
}

export const OrderFilterDropdown: React.FC<OrderFilterDropdownProps> = ({
  filters = {
    orderStatus: '',
    pricing: '',
  },
  onFilterChange,
  className = '',
}) => {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters);

  const handleStatusChange = (status: keyof FilterConfig['orderStatus']) => {
    setLocalFilters((prev) => ({
      ...prev,
      orderStatus: status,
    }));
  };

  const handlePricingChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      pricing: value as FilterConfig['pricing'],
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterConfig = {
      orderStatus: '',
      pricing: '',
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
          <h3 className="font-semibold text-sm text-gray-900"> Order Status</h3>
          <div className="flex flex-wrap gap-3">
            {[
              'Pending',
              'Delivered',
              'Processing',
              'Cancelled',
              'In Transit',
              'Out for Delivery  ',
            ].map((key) => (
              <label
                key={key}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleStatusChange(key as keyof FilterConfig['orderStatus']);
                }}
              >
                <Checkbox
                  checked={localFilters.orderStatus === key}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">Pricing</h3>
          <RadioGroup value={filters.pricing} onValueChange={handlePricingChange}>
            <div className="flex gap-4 mb-4">
              <label
                className={`flex items-center space-x-2 cursor-pointer ${
                  filters.pricing === 'high-to-low' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <RadioGroupItem value="high-to-low" id="high-to-low" />
                <span className="text-sm">High to Low</span>
              </label>
              <label
                className={`flex items-center space-x-2 cursor-pointer ${
                  filters.pricing === 'low-to-high' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <RadioGroupItem value="low-to-high" id="low-to-high" />
                <span className="text-sm">Low to High</span>
              </label>
            </div>
          </RadioGroup>
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
            onClick={handleClearFilters}
            className="w-[126px] h-[48px] !text-sm  bg-primary hover:bg-primary/90 text-white"
          >
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
