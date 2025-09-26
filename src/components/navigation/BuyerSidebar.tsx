import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Receipt,
  Package,
  Bell,
  MessageSquare,
  Plus,
  Menu,
  X,
  ChevronLeft,
  NotepadText,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';

const navigationItems = [
  { name: 'Marketplace', href: '/marketplace', icon: LayoutGrid },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Buying', href: '/buying', icon: Package },
  { name: 'Saved', href: '/wishlists', icon: Heart },
];

interface BuyerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const BuyerSidebar: React.FC<BuyerSidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Use controlled state if provided, otherwise use local state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setIsCollapsed = onCollapsedChange || setLocalCollapsed;

  // Check if we're on the marketplace page
  const isMarketplacePage = location.pathname.includes('/marketplace');

  // Initialize selected categories from URL on mount
  useEffect(() => {
    if (isMarketplacePage) {
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('category');
      const subCategoryParam = searchParams.get('subCategory');
      const initialCategories: string[] = [];

      // Add categories (these are slugs)
      if (categoryParam) {
        categoryParam.split(',').forEach((catSlug) => {
          if (catSlug) {
            initialCategories.push(catSlug);
          }
        });
      }

      // Add subcategories with their parent category prefix
      if (subCategoryParam && categoryParam) {
        const categorySlugList = categoryParam.split(',');
        const subCategorySlugs = subCategoryParam.split(',');

        // For each subcategory, we need to pair it with its parent category
        // This assumes subcategories are passed in the same order as their parent categories
        subCategorySlugs.forEach((subCatSlug) => {
          if (subCatSlug && categorySlugList.length > 0) {
            // For now, pair with the first category slug (this might need adjustment based on your data structure)
            initialCategories.push(`${categorySlugList[0]}:${subCatSlug}`);
          }
        });
      }

      setSelectedCategories(initialCategories);

      // Parse attributes from URL
      const attributesParam = searchParams.get('attributes');
      if (attributesParam) {
        try {
          const parsedAttributes = JSON.parse(attributesParam);
          setSelectedAttributes(parsedAttributes);
        } catch (e) {
          console.error('Failed to parse attributes from URL', e);
        }
      } else {
        setSelectedAttributes({});
      }
    }
  }, [isMarketplacePage, location.search]);

  // Handle category selection
  const handleAttributeSelect = (attributeId: string, value: string) => {
    setSelectedAttributes((prev) => {
      const newAttributes = { ...prev };

      if (!newAttributes[attributeId]) {
        newAttributes[attributeId] = [];
      }

      const valueIndex = newAttributes[attributeId].indexOf(value);
      if (valueIndex > -1) {
        // Remove value if already selected
        newAttributes[attributeId] = newAttributes[attributeId].filter((v) => v !== value);
        if (newAttributes[attributeId].length === 0) {
          delete newAttributes[attributeId];
        }
      } else {
        // Add value if not selected
        newAttributes[attributeId] = [...newAttributes[attributeId], value];
      }

      // Update URL with attribute filters
      const searchParams = new URLSearchParams(location.search);

      if (Object.keys(newAttributes).length > 0) {
        searchParams.set('attributes', JSON.stringify(newAttributes));
      } else {
        searchParams.delete('attributes');
      }

      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });

      return newAttributes;
    });
  };

  const handleCategorySelect = (category: string, subcategory?: string) => {
    const key = subcategory ? `${category}:${subcategory}` : category;

    setSelectedCategories((prev) => {
      const newCategories = prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key];

      // Update URL with selected categories as query params
      if (isMarketplacePage) {
        const searchParams = new URLSearchParams(location.search);

        // Extract categories and subcategories separately for the API
        const categories = newCategories.filter((cat) => !cat.includes(':')).join(',');

        // Extract unique subcategories (prevent duplicates)
        const uniqueSubcategories = [
          ...new Set(
            newCategories.filter((cat) => cat.includes(':')).map((cat) => cat.split(':')[1])
          ),
        ];
        const subcategories = uniqueSubcategories.join(',');

        // Set or delete category parameter
        if (categories.split(',').length > 1) {
          searchParams.set('type', 'all');
          searchParams.set('category', categories);
        } else if (categories.split(',').length === 1) {
          searchParams.set('category', categories);
          searchParams.delete('type');
        } else {
          searchParams.delete('category');
          searchParams.delete('type');
        }

        // Set or delete subcategory parameter
        if (subcategories) {
          searchParams.set('subCategory', subcategories);
        } else {
          searchParams.delete('subCategory');
        }
        console.log('categories.length', categories, 'subcategories.length', subcategories.length);
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
      }

      return newCategories;
    });
  };

  // Auto-collapse on tablet only if not controlled
  useEffect(() => {
    if (!isMobile && controlledCollapsed === undefined) {
      const handleResize = () => {
        if (window.innerWidth >= 768 && window.innerWidth < 1024) {
          setLocalCollapsed(true);
        } else if (window.innerWidth >= 1024) {
          setLocalCollapsed(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobile, controlledCollapsed]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'bg-white h-screen flex flex-col border-r border-gray-200 transition-all duration-300',
          isMobile ? 'fixed left-0 top-0 z-50' : 'relative',
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0',
          isCollapsed && !isMobile ? 'w-[80px]' : 'w-[260px]'
        )}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6 px-6 pt-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'hidden md:flex absolute -right-3 top-8 z-10 rounded-full text-primary hover:text-primary bg-white border shadow-sm w-6 h-6 p-0',
              'hover:bg-gray-100'
            )}
          >
            <ChevronLeft
              className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')}
            />
          </Button>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="flex flex-col gap-1 px-3">
            {navigationItems.map((item) => {
              const isActive = location.pathname.includes(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                    isActive ? 'bg-blue-50 text-primary' : 'text-gray-800 hover:bg-gray-50',
                    isCollapsed && !isMobile && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full',
                      isActive ? 'bg-primary' : 'bg-gray-100',
                      isCollapsed && !isMobile ? 'w-10 h-10' : 'w-9 h-9'
                    )}
                  >
                    <Icon size={20} className={cn(isActive ? 'text-white' : 'text-gray-600')} />
                  </div>
                  {(!isCollapsed || isMobile) && <span>{item.name}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Category Filter - Only show on marketplace page */}
          {isMarketplacePage && !isMobile && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <CategoryFilter
                isCollapsed={isCollapsed}
                onCategorySelect={handleCategorySelect}
                selectedCategories={selectedCategories}
                onAttributeSelect={handleAttributeSelect}
                selectedAttributes={selectedAttributes}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Mobile Sidebar Toggle Button
export const BuyerSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="fixed bottom-4 left-4 z-30 rounded-full w-12 h-12 bg-primary text-white shadow-lg md:hidden hover:bg-primary/90"
    >
      <Menu className="w-6 h-6" />
    </Button>
  );
};
