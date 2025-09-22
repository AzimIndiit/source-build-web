import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAvailableCategoriesQuery } from '@/features/admin/categories/hooks/useCategoryMutations';

interface CategoryFilterProps {
  isCollapsed?: boolean;
  onCategorySelect?: (category: string, subcategory?: string) => void;
  selectedCategories?: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  isCollapsed = false,
  onCategorySelect,
  selectedCategories = [],
}) => {
  const navigate = useNavigate();
  
  // Fetch available categories with their subcategories (single API call)
  const { data: categoriesResponse } = useAvailableCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Check if any subcategories are selected for a category and auto-select parent (only on initial load)
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length > 0) {
      // Only run this once when categories are loaded
      const timer = setTimeout(() => {
        categories.forEach((category: any) => {
          // Check if any subcategories for this category are selected
          const hasSelectedSubcategories = selectedCategories.some((cat) =>
            cat.startsWith(`${category.slug}:`)
          );

          // If subcategories are selected but parent isn't, select the parent
          if (hasSelectedSubcategories && !selectedCategories.includes(category.slug)) {
            onCategorySelect?.(category.slug);
          }
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [categories.length]); // Only depend on categories length to run once when loaded

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

  const handleCategoryCheck = (category: any, subcategorySlug?: string) => {
    if (subcategorySlug) {
      // Handle subcategory selection - just toggle the single subcategory
      onCategorySelect?.(category.slug, subcategorySlug);
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
    <div className="flex flex-col">
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
            <div key={category._id} className="flex flex-col">
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
                    <Plus className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-45')} />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && categorySubcategories.length > 0 && (
                <div className="ml-10 mr-3 mb-2 flex flex-col gap-1">
                  {categorySubcategories.map((subcategory: any) => {
                    const subcategoryChecked = isSubcategoryChecked(
                      category.slug,
                      subcategory.slug
                    );

                    return (
                      <div
                        key={subcategory._id}
                        onClick={() => handleCategoryCheck(category, subcategory.slug)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors',
                          'hover:bg-gray-50',
                          subcategoryChecked ? 'bg-blue-50/50' : 'bg-gray-50'
                        )}
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