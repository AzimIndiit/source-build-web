import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface AttributeValue {
  value: string;
  order?: number;
  _id: string;
}

interface Attribute {
  _id: string;
  name: string;
  inputType: 'text' | 'number' | 'dropdown' | 'multiselect' | 'boolean' | 'radio';
  required?: boolean;
  values?: AttributeValue[];
  order?: number;
  isActive?: boolean;
}

interface AttributeFilterProps {
  subcategoriesWithAttributes: any[];
  onAttributeSelect?: (attributeId: string, value: string) => void;
  selectedAttributes?: Record<string, string[]>;
  className?: string;
}

export const AttributeFilter: React.FC<AttributeFilterProps> = ({
  subcategoriesWithAttributes,
  onAttributeSelect,
  selectedAttributes = {},
  className,
}) => {
  // Combine and deduplicate attributes from all selected subcategories
  const groupedAttributesByName = useMemo(() => {
    const attributeGroups: Record<string, { 
      name: string; 
      values: Map<string, { value: string; _id: string; order?: number }>;
      inputType: string;
    }> = {};

    subcategoriesWithAttributes.forEach((subcategory) => {
      if (subcategory.attributes && Array.isArray(subcategory.attributes)) {
        subcategory.attributes.forEach((attr: Attribute) => {
          if (attr.isActive !== false) {
            if (!attributeGroups[attr.name]) {
              attributeGroups[attr.name] = {
                name: attr.name,
                values: new Map(),
                inputType: attr.inputType
              };
            }
            
            // Merge values, deduplicating by value text
            if (attr.values) {
              attr.values.forEach(val => {
                if (!attributeGroups[attr.name].values.has(val.value)) {
                  attributeGroups[attr.name].values.set(val.value, {
                    value: val.value,
                    _id: val._id,
                    order: val.order
                  });
                }
              });
            }
          }
        });
      }
    });

    return attributeGroups;
  }, [subcategoriesWithAttributes]);

  const handleValueSelect = (attributeName: string, value: string) => {
    // Use attribute name as the key for better deduplication
    onAttributeSelect?.(attributeName, value);
  };

  const isValueSelected = (attributeName: string, value: string) => {
    return selectedAttributes[attributeName]?.includes(value) || false;
  };

  if (subcategoriesWithAttributes.length === 0) {
    return null;
  }

  if (Object.keys(groupedAttributesByName).length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(groupedAttributesByName).map(([attrName, attrData]) => {
        const values = Array.from(attrData.values.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (values.length === 0) return null;

        return (
          <div key={attrName} className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">{attrName}</h3>
            <div className="flex flex-wrap gap-3">
              {values.map((value) => (
                <label
                  key={value._id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    handleValueSelect(attrName, value.value);
                  }}
                >
                  <Checkbox
                    checked={isValueSelected(attrName, value.value)}
                    onCheckedChange={() => {}}
                    className="pointer-events-none h-4 w-4"
                  />
                  <span className="text-sm select-none">{value.value}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};