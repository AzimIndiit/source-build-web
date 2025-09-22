import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCategoriesQuery } from '@/features/admin/categories/hooks/useCategoryMutations';

export function HeaderMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: response } = useCategoriesQuery({ limit: 100,isActive:true });
  
  // Response structure: response (CategoriesListResponse) -> data (CategoriesResponse) -> data (Category[])
  // Filter only active categories
  const allCategories = response?.data || [];
  const categories = Array.isArray(allCategories) ? allCategories.filter((cat: any) => cat.isActive) : [];
  
  // Parse URL params
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type');
  const categoryParam = searchParams.get('category');
  
  // Determine if "All" should be active
  const isAllActive = typeParam === 'all' || !categoryParam || categoryParam === '';
  
  return (
    <nav
      className="border-b border-gray-200"
      style={{
        background: 'linear-gradient(to right, #A0D7FF 0%, #B9DFFE 50%, #E0EFFE 100%)',
      }}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 overflow-x-auto scrollbar-hide">
          <button className="flex-shrink-0 p-2 hover:bg-white/30 rounded-md transition-colors cursor-pointer">
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex items-center ml-4 space-x-1">
            <button
              onClick={() => navigate('/marketplace')}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer',
                isAllActive
                  ? 'bg-white/40 text-gray-900'
                  : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
              )}
            >
              All
            </button>
            {categories.map((category: any) => {
              // Check if this specific category is active (only when type !== 'all')
              const isCategoryActive = typeParam !== 'all' && location.search.includes(`category=${category.slug}`);
              
              return (
                <button
                  key={category._id}
                  onClick={() => navigate(`/marketplace/${category.slug}`)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer',
                    isCategoryActive
                      ? 'bg-white/40 text-gray-900'
                      : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderMenu;
