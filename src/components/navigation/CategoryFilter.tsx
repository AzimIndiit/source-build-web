import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailableCategoriesQuery } from '@/features/admin/categories/hooks/useCategoryMutations';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryFilterProps {
  isCollapsed?: boolean;
  onCategorySelect?: (category: string, subcategory?: string) => void;
  selectedCategories?: string[];
  onAttributeSelect?: (attributeId: string, value: string) => void;
  selectedAttributes?: Record<string, string[]>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  isCollapsed = false,
  onCategorySelect,
  selectedCategories = [],
  onAttributeSelect,
  selectedAttributes = {},
}) => {
  // Fetch available categories with their subcategories (single API call)
  const { data: categoriesResponse } = useAvailableCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const isExpanded = prev.includes(categoryId);
      if (isExpanded) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => {
      const isExpanded = prev.includes(subcategoryId);
      if (isExpanded) {
        return prev.filter((id) => id !== subcategoryId);
      } else {
        return [...prev, subcategoryId];
      }
    });
  };

  const handleCategoryCheck = (category: any, subcategorySlug?: string) => {
    if (subcategorySlug) {
      // Handle subcategory selection
      const isSubcategoryCurrentlyChecked = isSubcategoryChecked(category.slug, subcategorySlug);

      if (!isSubcategoryCurrentlyChecked) {
        // When selecting a subcategory, also select the parent category if not already selected
        if (!isCategoryChecked(category.slug)) {
          onCategorySelect?.(category.slug); // Select parent category first
        }
        onCategorySelect?.(category.slug, subcategorySlug); // Then select subcategory
      } else {
        // When deselecting a subcategory
        onCategorySelect?.(category.slug, subcategorySlug); // Deselect subcategory

        // Check if all subcategories are now unchecked
        const categorySubcategories = category.subcategories || [];
        const anySubcategoryStillChecked = categorySubcategories.some(
          (sub: any) =>
            sub.slug !== subcategorySlug && isSubcategoryChecked(category.slug, sub.slug)
        );

        // If no subcategories are selected, deselect the parent category
        if (!anySubcategoryStillChecked && isCategoryChecked(category.slug)) {
          onCategorySelect?.(category.slug); // Deselect parent category
        }
      }
    } else {
      const categorySlug = category.slug;
      const isCategorySelected = isCategoryChecked(categorySlug);
      const categorySubcategories = category.subcategories || [];

      // First, perform the selection/deselection
      if (isCategorySelected) {
        // Deselect category and all its subcategories
        onCategorySelect?.(categorySlug); // Deselect category

        // Deselect all subcategories
        categorySubcategories.forEach((sub: any) => {
          if (isSubcategoryChecked(categorySlug, sub.slug)) {
            onCategorySelect?.(categorySlug, sub.slug);
          }
        });
      } else {
        // Select category and all its subcategories
        onCategorySelect?.(categorySlug); // Select category

        // Select all subcategories
        categorySubcategories.forEach((sub: any) => {
          if (!isSubcategoryChecked(categorySlug, sub.slug)) {
            onCategorySelect?.(categorySlug, sub.slug);
          }
        });
      }
    }
  };

  const isCategoryChecked = (categorySlug: string) => {
    return selectedCategories.includes(categorySlug);
  };

  const isSubcategoryChecked = (categorySlug: string, subcategorySlug: string) => {
    return selectedCategories.includes(`${categorySlug}:${subcategorySlug}`);
  };

  // Check if category is partially selected (some but not all subcategories selected)
  const isCategoryPartiallyChecked = (category: any) => {
    const categorySubcategories = category.subcategories || [];
    if (categorySubcategories.length === 0) return false;

    const checkedCount = categorySubcategories.filter((sub: any) =>
      isSubcategoryChecked(category.slug, sub.slug)
    ).length;

    return checkedCount > 0 && checkedCount < categorySubcategories.length;
  };

  if (isCollapsed) {
    return null; // Don't show categories when sidebar is collapsed
  }

  return (
    <div className="flex flex-col max-h-full overflow-y-auto">
      <div className="px-3 mb-4">
        <h3 className="text-base font-bold text-gray-900">Categories</h3>
      </div>

      <div className="flex flex-col">
        {categories?.map((category: any) => {
          const isExpanded = expandedCategories.includes(category._id);
          const categoryChecked = isCategoryChecked(category.slug);
          const categoryPartiallyChecked = isCategoryPartiallyChecked(category);
          const categorySubcategories = category.subcategories || [];

          return (
            <div key={category._id} className="flex flex-col mb-1">
              {/* Category Item */}
              <div
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors mx-3 mb-2',
                  'hover:bg-blue-50/50',
                  categoryChecked ? 'bg-blue-50' : 'bg-gray-100/60'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleCategoryCheck(category)}
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center transition-all relative',
                      categoryChecked ? 'bg-primary' : 'border-2 border-blue-400 bg-white'
                    )}
                  >
                    {categoryChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    {categoryPartiallyChecked && !categoryChecked && (
                      <div className="absolute w-2.5 h-0.5 bg-primary"></div>
                    )}
                  </button>

                  {/* Category Name */}
                  <span
                    onClick={() => handleCategoryCheck(category)}
                    className={cn(
                      'text-sm font-medium flex-1',
                      categoryChecked ? 'text-gray-900' : 'text-gray-700'
                    )}
                  >
                    {category.name}
                  </span>
                </div>

                {/* Expand Button - Only show if there are subcategories */}
                {categorySubcategories.length > 0 && (
                  <button
                    onClick={() => toggleCategory(category._id)}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center cursor-pointer justify-center transition-all',
                      'border-2 border-primary text-primary bg-white',
                      'hover:bg-blue-50'
                    )}
                  >
                    <Plus
                      className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-45')}
                    />
                  </button>
                )}
              </div>

              {/* Category Attributes - Show automatically when category is checked and has attributes */}
              {categoryChecked && category.attributes && category.attributes.length > 0 && (
                <div className="ml-10 mr-3 mb-3 space-y-3">
                  {category.attributes.map((attribute: any) => {
                    const attributeKey = `${category._id}_${attribute.name}`;
                    const selectedValues = selectedAttributes[attributeKey] || [];
                    
                    return (
                      <div key={attribute._id} className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">{attribute.name}</h4>
                        <div className="space-y-1">
                          {attribute.values?.map((valueObj: any) => {
                            const value = typeof valueObj === 'string' ? valueObj : valueObj.value;
                            return (
                              <label
                                key={value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                              >
                                <Checkbox
                                  checked={selectedValues.includes(value)}
                                  onCheckedChange={() => onAttributeSelect?.(attributeKey, value)}
                                  className="w-3.5 h-3.5"
                                />
                                <span className="text-xs text-gray-600">{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subcategories */}
              {isExpanded && categorySubcategories.length > 0 && (
                <div className="ml-10 mr-3 mb-2 flex flex-col gap-1">
                  {categorySubcategories.map((subcategory: any) => {
                    const subcategoryChecked = isSubcategoryChecked(
                      category.slug,
                      subcategory.slug
                    );
                    const hasAttributes = subcategory.attributes && subcategory.attributes.length > 0;
                    const isSubcategoryExpanded = expandedSubcategories.includes(subcategory._id);

                    return (
                      <div key={subcategory._id}>
                        <div
                          className={cn(
                            'flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                            'hover:bg-gray-50',
                            subcategoryChecked ? 'bg-blue-50/50' : 'bg-gray-50'
                          )}
                        >
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => handleCategoryCheck(category, subcategory.slug)}
                          >
                            {/* Subcategory Checkbox */}
                            <button
                              className={cn(
                                'w-4 h-4 rounded flex items-center justify-center transition-all',
                                subcategoryChecked ? 'bg-primary' : 'border-2 border-blue-400 bg-white'
                              )}
                            >
                              {subcategoryChecked && (
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              )}
                            </button>

                            <span
                              className={cn(
                                'text-sm',
                                subcategoryChecked ? 'text-gray-900 font-medium' : 'text-gray-700'
                              )}
                            >
                              {subcategory.name}
                            </span>
                          </div>
                          
                          {/* Expand button for subcategory attributes */}
                          {hasAttributes && subcategoryChecked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubcategory(subcategory._id);
                              }}
                              className={cn(
                                'w-6 h-6 rounded-full flex items-center cursor-pointer justify-center transition-all',
                                'border border-primary text-primary bg-white',
                                'hover:bg-blue-50'
                              )}
                            >
                              <Plus className={cn('w-4 h-4 transition-transform', isSubcategoryExpanded && 'rotate-45')} />
                            </button>
                          )}
                        </div>
                        
                        {/* Inline Attributes for this subcategory - only show when subcategory expand button is clicked */}
                        {isSubcategoryExpanded && subcategoryChecked && subcategory.attributes && subcategory.attributes.length > 0 && (
                          <div className="ml-8 mt-2 mb-2 space-y-3">
                            {subcategory.attributes
                              .filter((attr: any) => attr.isActive !== false && attr.values && attr.values.length > 0)
                              .map((attribute: any) => (
                                <div key={attribute._id} className="space-y-1.5">
                                  <h4 className="font-medium text-xs text-gray-600">{attribute.name}</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {attribute.values.map((value: any) => (
                                      <div
                                        key={value._id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Use subcategory._id + attribute.name as unique key
                                          const uniqueKey = `${subcategory._id}_${attribute.name}`;
                                          onAttributeSelect?.(uniqueKey, value.value);
                                        }}
                                      >
                                        <Checkbox
                                          checked={selectedAttributes?.[`${subcategory._id}_${attribute.name}`]?.includes(value.value) || false}
                                          onCheckedChange={() => {}}
                                          className="pointer-events-none h-3 w-3"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="select-none text-xs">{value.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Show message if no categories found */}
        {categories.length === 0 && (
          <div className="px-3">
            <p className="text-sm text-gray-500 px-4 py-2">No categories with products available</p>
          </div>
        )}
      </div>

    </div>
  );
};
