import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  subcategories?: string[];
}

const categories: Category[] = [
  {
    id: 'adhesives',
    name: 'Adhesives',
    subcategories: ['Glue', 'Tape', 'Epoxy', 'Sealants'],
  },
  {
    id: 'appliances',
    name: 'Appliances',
    subcategories: ['Kitchen Appliances', 'Laundry', 'Small Appliances', 'HVAC'],
  },
  {
    id: 'baseboards',
    name: 'Baseboards, Casing, Trim & Crown',
    subcategories: ['Baseboards', 'Casing', 'Crown Molding', 'Chair Rail', 'Trim'],
  },
  {
    id: 'cabinetry',
    name: 'Cabinetry',
    subcategories: ['Kitchen Cabinets', 'Bathroom Vanities', 'Cabinet Hardware', 'Cabinet Doors'],
  },
  {
    id: 'caulk',
    name: 'Caulk & Sealants',
    subcategories: ['Silicone Caulk', 'Acrylic Caulk', 'Latex Caulk', 'Specialty Sealants'],
  },
  {
    id: 'carpet',
    name: 'Carpet',
    subcategories: ['Area Rugs', 'Carpet Tiles', 'Wall-to-Wall', 'Carpet Padding'],
  },
];

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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleCategoryCheck = (categoryId: string, subcategory?: string) => {
    onCategorySelect?.(categoryId, subcategory);
  };

  const isCategoryChecked = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  const isSubcategoryChecked = (categoryId: string, subcategory: string) => {
    return selectedCategories.includes(`${categoryId}:${subcategory}`);
  };

  if (isCollapsed) {
    return null; // Don't show categories when sidebar is collapsed
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-base font-bold text-gray-900 px-3 mb-4">Categories</h3>

      <div className="flex flex-col">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const categoryChecked = isCategoryChecked(category.id);

          return (
            <div key={category.id} className="flex flex-col">
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
                    onClick={() => handleCategoryCheck(category.id)}
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center transition-all',
                      categoryChecked ? 'bg-blue-600' : 'border-2 border-blue-400 bg-white'
                    )}
                  >
                    {categoryChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>

                  {/* Category Name */}
                  <span
                    onClick={() => handleCategoryCheck(category.id)}
                    className={cn(
                      'text-sm font-medium flex-1',
                      categoryChecked ? 'text-gray-900' : 'text-gray-700'
                    )}
                  >
                    {category.name}
                  </span>
                </div>

                {/* Expand Button */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      'border-2 border-blue-500 text-blue-600 bg-white',
                      'hover:bg-blue-50'
                    )}
                  >
                    <Plus
                      className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-45')}
                    />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && category.subcategories && (
                <div className="ml-10 mr-3 mb-2 flex flex-col gap-1">
                  {category.subcategories.map((subcategory) => {
                    const subcategoryChecked = isSubcategoryChecked(category.id, subcategory);

                    return (
                      <div
                        key={subcategory}
                        onClick={() => handleCategoryCheck(category.id, subcategory)}
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
                            subcategoryChecked ? 'bg-blue-600' : 'border-2 border-blue-400 bg-white'
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
                          {subcategory}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
