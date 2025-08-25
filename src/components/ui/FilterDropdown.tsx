import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Slider } from './slider';
import { Filter } from 'lucide-react';
import FilterButton from './FilterButton';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterDropdownProps {
  onApply: (filters: any) => void;
  onClear: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  onApply,
  onClear,
}) => {
  const [filters, setFilters] = useState<{
    popularity: FilterOption[];
    newest: FilterOption[];
    availability: FilterOption[];
    readyTime: FilterOption[];
    sorting: string;
    pricing: string;
    priceRange: number[];
  }>({
    popularity: [
      { id: 'best-selling', label: 'Best-Selling Products', checked: true },
      { id: 'most-viewed', label: 'Most Viewed', checked: false },
      { id: 'top-rated', label: 'Top-Rated', checked: false },
      { id: 'most-reviewed', label: 'Most Reviewed', checked: false },
      { id: 'featured', label: 'Featured Products', checked: false },
      { id: 'trending', label: 'Trending Now', checked: false },
    ],
    newest: [
      { id: 'recently-updated', label: 'Recently Updated', checked: true },
      { id: 'featured-new', label: 'Featured New Products', checked: false },
      { id: 'sort-by-date', label: 'Sort by Date Added', checked: false },
      { id: 'new-arrivals', label: 'New Arrivals', checked: false },
    ],
    availability: [
      { id: 'delivery', label: 'Delivery', checked: true },
      { id: 'shipping', label: 'Shipping', checked: false },
      { id: 'pickup', label: 'Pickup', checked: false },
    ],
    readyTime: [
      { id: 'next-day', label: 'Ready Next Day', checked: true },
      { id: 'this-week', label: 'Ready This Week', checked: false },
    ],
    sorting: 'ascending',
    pricing: 'custom',
    priceRange: [10, 250],
  });

  const [open, setOpen] = useState(false);

  const handleCheckboxChange = (
    section: 'popularity' | 'newest' | 'availability' | 'readyTime',
    optionId: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [section]: prev[section].map((option: FilterOption) =>
        option.id === optionId ? { ...option, checked: !option.checked } : option
      ),
    }));
  };

  const handleSortingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sorting: value,
    }));
  };

  const handlePricingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      pricing: value,
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: values,
    }));
  };

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      popularity: filters.popularity.map((opt) => ({ ...opt, checked: false })),
      newest: filters.newest.map((opt) => ({ ...opt, checked: false })),
      availability: filters.availability.map((opt) => ({ ...opt, checked: false })),
      readyTime: filters.readyTime.map((opt) => ({ ...opt, checked: false })),
      sorting: 'ascending',
      pricing: 'custom',
      priceRange: [10, 250],
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <FilterButton  className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
        </FilterButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[90vw] sm:w-[500px] md:w-[600px] max-w-[600px] max-h-[80vh] overflow-y-auto p-4 sm:p-5 md:p-6 shadow-lg border border-gray-200" align="end">
        {/* Popularity Section */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">Popularity</h3>
          <div className="flex flex-wrap gap-3">
            {filters.popularity.map((option) => (
              <label
                key={option.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('popularity', option.id);
                }}
              >
                <Checkbox
                  checked={option.checked}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Newest Section */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">Newest</h3>
          <div className="flex flex-wrap gap-3">
            {filters.newest.map((option) => (
              <label
                key={option.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('newest', option.id);
                }}
              >
                <Checkbox
                  checked={option.checked}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Options */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">Availability Options</h3>
          <div className="flex flex-wrap gap-3">
            {filters.availability.map((option) => (
              <label
                key={option.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('availability', option.id);
                }}
              >
                <Checkbox
                  checked={option.checked}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ready Time */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">Ready Time</h3>
          <div className="flex flex-wrap gap-3">
            {filters.readyTime.map((option) => (
              <label
                key={option.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxChange('readyTime', option.id);
                }}
              >
                <Checkbox
                  checked={option.checked}
                  onCheckedChange={() => {}}
                  className={`pointer-events-none h-4 w-4`}
                />
                <span className="text-sm select-none">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* A-Z Sorting */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-gray-900">A - Z</h3>
          <RadioGroup value={filters.sorting} onValueChange={handleSortingChange}>
            <div className="flex gap-4">
              <label
                  className={`flex items-center space-x-2 cursor-pointer ${
                  filters.sorting === 'ascending' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <RadioGroupItem value="ascending" id="ascending" />
                <span className="text-sm">A → Z (Ascending Order)</span>
              </label>
              <label
                className={`flex items-center space-x-2 cursor-pointer ${
                  filters.sorting === 'descending' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <RadioGroupItem value="descending" id="descending" />
                <span className="text-sm">Z → A (Descending Order)</span>
              </label>
            </div>
          </RadioGroup>
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
              <label
                className={`flex items-center space-x-2 cursor-pointer ${
                  filters.pricing === 'custom' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <RadioGroupItem value="custom" id="custom" />
                <span className="text-sm">Set a Custom limit</span>
              </label>
            </div>
          </RadioGroup>
          
          {/* Price Range Slider */}
          {filters.pricing === 'custom' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-semibold">${filters.priceRange[0]}</span>
                <span className="font-semibold">${filters.priceRange[1]}</span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={handlePriceRangeChange}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClear}
            className="  w-[126px] h-[48px] !text-sm text-primary border border-gray-200-primary hover:bg-primary/10 hover:text-primary"
          >
            Clear All Filters
          </Button>
          <Button
            onClick={handleApply}
            className="w-[126px] h-[48px] !text-sm  bg-primary hover:bg-primary/90 text-white"
          >
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;