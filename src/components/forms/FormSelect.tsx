import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge'; // Assuming you have a Badge component
import { X } from 'lucide-react'; // For remove icons

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  optionsPerPage?: number;
  disabled?: boolean;
  multiple?: boolean;
  maxSelections?: number;
  showSelectAll?: boolean;
  customError?: any;
  creatable?: boolean;
  createPlaceholder?: string;
  onCreateOption?: (value: string) => void;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  placeholder,
  options,
  searchable = false,
  searchPlaceholder = 'Search options...',
  optionsPerPage = 10,
  disabled = false,
  multiple = false,
  maxSelections,
  showSelectAll = false,
  customError,
  creatable = false,
  createPlaceholder = 'Create "{search}"',
  onCreateOption,
  className = '',
}) => {
  const formContext = useFormContext();
  if (!formContext) {
    console.error('FormSelect must be used within a FormProvider');
  }
  const {
    control,
    watch,
    formState: { errors },
  } = formContext || { control: undefined, watch: () => undefined, formState: { errors: {} } };
  const fieldValue = watch(name);
  console.log('fieldValue', fieldValue, name);
  console.log('form context exists:', !!formContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(optionsPerPage);
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<SelectOption[]>(options);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const error = errors[name] || customError;

  // Update localOptions when options prop changes
  useEffect(() => {
    console.log(`FormSelect ${name} - options updated:`, options.length, 'options');
    setLocalOptions(options);
  }, [options, name]);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(optionsPerPage);
  }, [searchTerm, optionsPerPage]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return localOptions;
    }

    const filtered = localOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered;
  }, [localOptions, searchTerm, searchable]);

  // Get visible options based on current visible count
  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, visibleCount);
  }, [filteredOptions, visibleCount]);

  // Check if there are more options to load
  const hasMoreOptions = visibleCount < filteredOptions.length;

  const handleSingleSelectChange = (value: string, fieldOnChange: (value: string) => void) => {
    fieldOnChange(value);
    setSearchTerm(''); // Clear search when option is selected
    setIsOpen(false);
  };

  const handleMultiSelectChange = (
    value: string,
    currentValues: string[],
    fieldOnChange: (value: string[]) => void
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : maxSelections && currentValues.length >= maxSelections
        ? currentValues
        : [...currentValues, value];

    fieldOnChange(newValues);
  };

  const handleRemoveSelection = (
    valueToRemove: string,
    currentValues: string[],
    fieldOnChange: (value: string[]) => void
  ) => {
    const newValues = currentValues.filter((v) => v !== valueToRemove);
    fieldOnChange(newValues);
  };

  const handleSelectAll = (currentValues: string[], fieldOnChange: (value: string[]) => void) => {
    const allFilteredValues = filteredOptions.map((option) => option.value);
    const isAllSelected = allFilteredValues.every((value) => currentValues.includes(value));

    if (isAllSelected) {
      // Deselect all filtered options
      const newValues = currentValues.filter((value) => !allFilteredValues.includes(value));
      fieldOnChange(newValues);
    } else {
      // Select all filtered options (respecting maxSelections)
      const newValues = [...new Set([...currentValues, ...allFilteredValues])];
      if (maxSelections && newValues.length > maxSelections) {
        fieldOnChange(newValues.slice(0, maxSelections));
      } else {
        fieldOnChange(newValues);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreOptions) {
      setVisibleCount((prev) => Math.min(prev + optionsPerPage, filteredOptions.length));
    }
  };

  const getSelectedLabels = (values: string[] | string): string[] => {
    if (!multiple) return [];
    const valueArray = Array.isArray(values) ? values : [];
    return valueArray.map(
      (value) => localOptions.find((option) => option.value === value)?.label || value
    );
  };

  const handleClearAll = (fieldOnChange: (value: string[]) => void) => {
    fieldOnChange([]);
  };

  const handleCreateOption = (
    value: string,
    currentValues: string[] | string,
    fieldOnChange: (value: string[] | string) => void
  ) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    // Check if option already exists
    const exists = localOptions.some(
      (opt) =>
        opt.value.toLowerCase() === trimmedValue.toLowerCase() ||
        opt.label.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (!exists) {
      const newOption: SelectOption = {
        value: trimmedValue.toLowerCase().replace(/\s+/g, '-'),
        label: trimmedValue,
      };

      setLocalOptions((prev) => [...prev, newOption]);

      // If multiple mode, add to selection
      if (multiple) {
        const valuesArray = Array.isArray(currentValues) ? currentValues : [];
        fieldOnChange([...valuesArray, newOption.value]);
      } else {
        fieldOnChange(newOption.value);
      }

      // Call the callback if provided
      if (onCreateOption) {
        onCreateOption(trimmedValue);
      }

      setSearchTerm('');
      if (!multiple) {
        setIsOpen(false);
      }
    }
  };

  const renderMultiSelectTrigger = (field: any) => {
    const selectedValues = Array.isArray(field.value) ? field.value : [];
    const selectedLabels = getSelectedLabels(selectedValues);

    if (selectedValues.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>;
    }

    // Show different badge counts based on screen size
    const mobileMaxBadges = 2; // Mobile: 2 badges
    const tabletMaxBadges = 5; // Tablet: 5 badges
    const desktopMaxBadges = 3; // Desktop: 3 badges

    // Get labels for different screen sizes
    const mobileLabels = selectedLabels.slice(0, mobileMaxBadges);
    const tabletLabels = selectedLabels.slice(0, tabletMaxBadges);
    const desktopLabels = selectedLabels.slice(0, desktopMaxBadges);
    const mobileRemainingCount = selectedValues.length - mobileMaxBadges;
    const tabletRemainingCount = selectedValues.length - tabletMaxBadges;
    const desktopRemainingCount = selectedValues.length - desktopMaxBadges;

    return (
      <div className="flex items-center w-full gap-1">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0 items-center">
          {/* Mobile view - show 2 badges */}
          <div className="flex gap-1 items-center sm:hidden">
            {mobileLabels.map((label, index) => (
              <Badge
                key={selectedValues[index]}
                variant="secondary"
                className="text-xs inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-primary/10 max-w-[100px] group"
              >
                <span className="truncate flex-1 min-w-0">{label}</span>
                <button
                  type="button"
                  className="ml-0.5 p-0.5 hover:bg-red-200/50 rounded-sm transition-colors duration-150 inline-flex items-center justify-center flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveSelection(selectedValues[index], selectedValues, field.onChange);
                  }}
                  tabIndex={-1}
                >
                  <X size={12} className="text-gray-500 hover:text-red-600" />
                </button>
              </Badge>
            ))}
            {mobileRemainingCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-md whitespace-nowrap">
                +{mobileRemainingCount} more
              </Badge>
            )}
          </div>

          {/* Tablet view - show 5 badges */}
          <div className="hidden sm:flex lg:hidden gap-1 items-center">
            {tabletLabels.map((label, index) => (
              <Badge
                key={selectedValues[index]}
                variant="secondary"
                className="text-xs inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-primary/10 max-w-[120px] group"
              >
                <span className="truncate flex-1 min-w-0">{label}</span>
                <button
                  type="button"
                  className="ml-0.5 p-0.5 hover:bg-red-200/50 rounded-sm transition-colors duration-150 inline-flex items-center justify-center flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveSelection(selectedValues[index], selectedValues, field.onChange);
                  }}
                  tabIndex={-1}
                >
                  <X size={12} className="text-gray-500 hover:text-red-600" />
                </button>
              </Badge>
            ))}
            {tabletRemainingCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-md whitespace-nowrap">
                +{tabletRemainingCount} more
              </Badge>
            )}
          </div>

          {/* Desktop view - show 3 badges */}
          <div className="hidden lg:flex gap-1 items-center">
            {desktopLabels.map((label, index) => (
              <Badge
                key={selectedValues[index]}
                variant="secondary"
                className="text-xs inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-primary/10 max-w-[120px] group"
              >
                <span className="truncate flex-1 min-w-0">{label}</span>
                <button
                  type="button"
                  className="ml-0.5 p-0.5 hover:bg-red-200/50 rounded-sm transition-colors duration-150 inline-flex items-center justify-center flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveSelection(selectedValues[index], selectedValues, field.onChange);
                  }}
                  tabIndex={-1}
                >
                  <X size={12} className="text-gray-500 hover:text-red-600" />
                </button>
              </Badge>
            ))}
            {desktopRemainingCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-md whitespace-nowrap">
                +{desktopRemainingCount} more
              </Badge>
            )}
          </div>
        </div>

        {/* Clear All Button */}
        {selectedValues.length > 0 && (
          <button
            type="button"
            className="p-1 hover:bg-red-100 rounded-sm transition-colors duration-150 flex items-center justify-center flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll(field.onChange);
            }}
            title="Clear all selections"
            tabIndex={-1}
          >
            <X size={16} className="text-gray-400 hover:text-red-600" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={name} className="">
          {label}
        </Label>
      )}
      {control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const currentSelectedOption = multiple
              ? null
              : localOptions.find((option) => option.value === field.value);

            // Compute final visible options without useMemo (can't use hooks in render callback)
            let finalVisibleOptions = visibleOptions;
            if (!multiple && currentSelectedOption) {
              const hasSelectedInVisible = visibleOptions.some(
                (option) => option.value === field.value
              );
              if (!hasSelectedInVisible) {
                finalVisibleOptions = [currentSelectedOption, ...visibleOptions];
              }
            }

            if (multiple) {
              return (
                <div className="relative">
                  <div
                    ref={field.ref}
                    id={name}
                    className={`${label ? 'mt-2' : ''} rounded-sm w-full min-h-[40px] px-3 py-1.5 border cursor-pointer flex items-center ${
                      error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'} ${className}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                  >
                    {renderMultiSelectTrigger(field)}
                  </div>

                  {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg">
                      {searchable && (
                        <div
                          className="p-2 border-b border-gray-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className="h-8 rounded-sm"
                            autoFocus
                            autoComplete="off"
                          />
                        </div>
                      )}

                      {showSelectAll && filteredOptions.length > 0 && (
                        <div
                          className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                          onClick={() =>
                            handleSelectAll(
                              Array.isArray(field.value) ? field.value : [],
                              field.onChange
                            )
                          }
                        >
                          {filteredOptions.every((option) =>
                            (Array.isArray(field.value) ? field.value : []).includes(option.value)
                          )
                            ? 'Deselect All'
                            : 'Select All'}
                        </div>
                      )}

                      <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="max-h-60 overflow-y-auto"
                      >
                        {creatable && searchTerm && filteredOptions.length === 0 && (
                          <div
                            className="p-2 cursor-pointer hover:bg-blue-50 text-blue-600 flex items-center gap-2 border-b"
                            onClick={() =>
                              handleCreateOption(
                                searchTerm,
                                Array.isArray(field.value) ? field.value : [],
                                field.onChange
                              )
                            }
                          >
                            <span className="flex-1">
                              {createPlaceholder.replace('{search}', searchTerm)}
                            </span>
                          </div>
                        )}
                        {finalVisibleOptions.length > 0 ? (
                          <>
                            {finalVisibleOptions.map((option) => {
                              const currentValues = Array.isArray(field.value) ? field.value : [];
                              const isSelected = currentValues.includes(option.value);
                              const isMaxReached =
                                maxSelections && currentValues.length >= maxSelections;
                              const isDisabled = !isSelected && isMaxReached;

                              return (
                                <div
                                  key={option.value}
                                  className={`p-2 flex items-center gap-2 ${
                                    isDisabled
                                      ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                      : 'cursor-pointer hover:bg-gray-50'
                                  } ${isSelected ? 'bg-blue-50 text-primary' : ''}`}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      handleMultiSelectChange(
                                        option.value,
                                        currentValues,
                                        field.onChange
                                      );
                                    }
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled ? true : undefined}
                                    onChange={() => {}} // handled by onClick above
                                    className="rounded"
                                  />
                                  <span className="flex-1">{option.label}</span>
                                </div>
                              );
                            })}
                            {hasMoreOptions && (
                              <div className="p-2 text-xs text-gray-400 text-center border-t">
                                Scroll for more options... ({filteredOptions.length - visibleCount}{' '}
                                remaining)
                              </div>
                            )}
                          </>
                        ) : (
                          !creatable &&
                          searchable &&
                          searchTerm && (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              No options found for "{searchTerm}"
                            </div>
                          )
                        )}
                      </div>

                      {maxSelections && (
                        <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
                          {(() => {
                            const selectedCount = Array.isArray(field.value)
                              ? field.value.length
                              : 0;
                            const remainingSlots = maxSelections - selectedCount;

                            if (selectedCount === maxSelections) {
                              return `Maximum ${maxSelections} tags selected`;
                            } else if (selectedCount > 0) {
                              return `${selectedCount} selected • ${remainingSlots} more available`;
                            } else {
                              return `Select up to ${maxSelections} tags`;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Backdrop to close dropdown */}
                  {isOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  )}
                </div>
              );
            }

            console.log('field.value ', field.value, name);
            console.log('available options:', localOptions);

            // Single select mode (original behavior)
            // Force the value to be a string and ensure it exists in options
            const selectValue = field.value ? String(field.value) : '';

            // For creatable selects, always allow the current value
            let finalValue = '';
            if (selectValue) {
              if (creatable) {
                // For creatable selects, always use the value even if not in options
                finalValue = selectValue;
                // Add to localOptions if not present
                if (!localOptions.some((opt) => opt.value === selectValue)) {
                  localOptions.push({ value: selectValue, label: selectValue });
                }
              } else {
                // For non-creatable, only use if in options
                const valueExistsInOptions = localOptions.some((opt) => opt.value === selectValue);
                finalValue = valueExistsInOptions ? selectValue : '';
              }
            }

            console.log(
              'Select value:',
              selectValue,
              'final value:',
              finalValue,
              'creatable:',
              creatable
            );

            return (
              <Select
                onValueChange={(value) => handleSingleSelectChange(value, field.onChange)}
                value={finalValue}
                disabled={disabled}
                key={`${name}-${finalValue}-${localOptions.length}`} // Force re-render when value or options change
              >
                <SelectTrigger
                  id={name}
                  ref={field.ref}
                  className={`${label ? 'mt-2' : ''} rounded-sm w-full ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
                  disabled={disabled}
                >
                  <SelectValue placeholder={placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent className="w-full bg-white">
                  {searchable && !disabled && (
                    <div
                      className="p-2 border-b border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        className="h-8 rounded-sm"
                        autoFocus
                        autoComplete="off"
                      />
                    </div>
                  )}
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="max-h-60 overflow-y-auto"
                  >
                    {finalVisibleOptions.length > 0 ? (
                      <>
                        {finalVisibleOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                        {hasMoreOptions && (
                          <div className="p-2 text-xs text-gray-400 text-center border-t">
                            Scroll for more options... ({filteredOptions.length - visibleCount}{' '}
                            remaining)
                          </div>
                        )}
                      </>
                    ) : (
                      searchable &&
                      searchTerm && (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No options found for "{searchTerm}"
                        </div>
                      )
                    )}
                  </div>
                </SelectContent>
              </Select>
            );
          }}
        />
      ) : (
        <div className="text-red-500 text-xs">FormSelect must be used within a FormProvider</div>
      )}
      {error && <p className="text-red-500 text-xs mt-2">{error.message?.toString()}</p>}
    </div>
  );
};
