import React, { useState } from "react";
import { ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: "recent", label: "Recent" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "last-6-months", label: "Last 6 Months" },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortOptions = defaultSortOptions,
  selectedSort = "recent",
  onSortChange,
  className = "",
}) => {
  const [value, setValue] = useState<string>(selectedSort);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onSortChange?.(newValue);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 bg-primary/10 hover:bg-primary/20 ${className}`}
        >
          <ArrowUpNarrowWide className="w-4 h-4 text-primary" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-3 space-y-4">
        {/* Time Based Sort */}
        <div>
          <RadioGroup value={value} onValueChange={handleChange}>
            {sortOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center space-x-2 cursor-pointer justify-between ${
                  value === opt.value ? "text-primary" : "text-gray-600"
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                
                <RadioGroupItem value={opt.value} id={opt.value} />
              </label>
            ))}
          </RadioGroup>
        </div>


      </DropdownMenuContent>
    </DropdownMenu>
  );
};
