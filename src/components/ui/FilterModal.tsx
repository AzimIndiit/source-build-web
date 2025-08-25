import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';
import { Slider } from './slider';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}



interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
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
    sorting: 'ascending', // A-Z or Z-A
    pricing: 'custom', // High to Low, Low to High, or Custom
    priceRange: [10, 250], // Min and Max price
  });

  const handleCheckboxChange = (section: 'popularity' | 'newest' | 'availability' | 'readyTime', optionId: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: prev[section].map((option: FilterOption) =>
        option.id === optionId ? { ...option, checked: !option.checked } : option
      ),
    }));
  };

  const handleRadioChange = (section: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [section]: value,
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: values,
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      popularity: filters.popularity.map(opt => ({ ...opt, checked: false })),
      newest: filters.newest.map(opt => ({ ...opt, checked: false })),
      availability: filters.availability.map(opt => ({ ...opt, checked: false })),
      readyTime: filters.readyTime.map(opt => ({ ...opt, checked: false })),
      sorting: 'ascending',
      pricing: 'custom',
      priceRange: [10, 250],
    };
    setFilters(clearedFilters);
    onClear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Popularity Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Popularity</h3>
            <div className="space-y-2">
              {filters.popularity.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={() => handleCheckboxChange('popularity', option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm text-gray-600">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Newest Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Newest</h3>
            <div className="space-y-2">
              {filters.newest.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={() => handleCheckboxChange('newest', option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm text-gray-600">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Options Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Availability Options</h3>
            <div className="space-y-2">
              {filters.availability.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={() => handleCheckboxChange('availability', option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm text-gray-600">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Time Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Ready Time</h3>
            <div className="space-y-2">
              {filters.readyTime.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={() => handleCheckboxChange('readyTime', option.id)}
                  />
                  <Label htmlFor={option.id} className="text-sm text-gray-600">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* A-Z Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">A - Z</h3>
            <RadioGroup
              value={filters.sorting}
              onValueChange={(value) => handleRadioChange('sorting', value)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ascending" id="ascending" />
                  <Label htmlFor="ascending" className="text-sm text-gray-600">
                    A → Z (Ascending Order)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="descending" id="descending" />
                  <Label htmlFor="descending" className="text-sm text-gray-600">
                    Z → A (Descending Order)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Pricing</h3>
            <RadioGroup
              value={filters.pricing}
              onValueChange={(value) => handleRadioChange('pricing', value)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high-to-low" id="high-to-low" />
                  <Label htmlFor="high-to-low" className="text-sm text-gray-600">
                    High to Low
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low-to-high" id="low-to-high" />
                  <Label htmlFor="low-to-high" className="text-sm text-gray-600">
                    Low to High
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="text-sm text-gray-600">
                    Set a Custom limit
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Price Range Slider */}
            {filters.pricing === 'custom' && (
              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
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
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear All Filters
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterModal;
