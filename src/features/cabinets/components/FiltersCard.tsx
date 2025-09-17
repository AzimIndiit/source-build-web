import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { FilterOption } from '../types';

interface FiltersCardProps {
  filters: FilterOption[];
  onFilterChange: (filterId: string) => void;
  onClearFilters: () => void;
}

const FiltersCard: React.FC<FiltersCardProps> = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <Card>
      <CardContent className="">
        <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200">
          <h5 className="font-semibold">Filters</h5>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            Clear filter
          </Button>
        </div>
        <RadioGroup value={filters.find((f) => f.checked)?.id} onValueChange={onFilterChange}>
          <div className="space-y-1">
            {filters.map((filter) => (
              <label
                key={filter.id}
                htmlFor={filter.id}
                className="flex items-center space-x-2 border border-gray-200 p-3 rounded-sm cursor-pointer"
              >
                <RadioGroupItem value={filter.id} id={filter.id} />
                <Label htmlFor={filter.id} className="cursor-pointer font-normal">
                  {filter.label}
                </Label>
              </label>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default FiltersCard;
