import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  SearchResultSkeleton, 
  RecentSearchesSkeleton, 
  CategoriesSkeleton, 
  PopularProductsSkeleton 
} from './SearchResultSkeleton';

interface SearchItem {
  id: string;
  query: string;
  timestamp: number;
  category?: string;
}

interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  images?: string[];
  category?: {
    _id: string;
    name: string;
    isActive: boolean;
  };
  subCategory?: {
    _id: string;
    name: string;
    isActive: boolean;
  };
  brand?: string;
  status: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProductsResponse {
  data: {
    products: Product[];
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<SearchItem[]>('recentSearches', []);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery<CategoriesResponse>({
    queryKey: ['categories-search'],
    queryFn: async () => {
      const response = await axios.get('/categories', {
        params: {
          limit: 10,
          isActive: true,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Search products when user types
  const { data: searchResults, isLoading: isSearching } = useQuery<ProductsResponse>({
    queryKey: ['product-search', debouncedQuery],
    queryFn: async () => {
      const response = await axios.get('/products', {
        params: {
          search: debouncedQuery,
          status: 'active',
          limit: 5,
        },
      });
      return response.data;
    },
    enabled: debouncedQuery.length > 0 && isOpen,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const newSearch: SearchItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    setIsOpen(false);
    
    // Navigate to products page with search query
    // navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const handleProductClick = (product: Product) => {
    // Add to recent searches
    const newSearch: SearchItem = {
      id: Date.now().toString(),
      query: product.title,
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== product.title),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    setIsOpen(false);
    
    // Navigate to product details page
    navigate(`/products/${product.slug || product._id}`);
  };

  const handleCategoryClick = (category: Category) => {
    setIsOpen(false);
    // Navigate to products page with category filter
    navigate(`/marketplace?category=${category.slug}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Filter active categories
  const activeCategories = categoriesData?.data?.filter(cat => cat.isActive) || [];

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Search the marketplace"
          className="pr-10 h-[40px] border-gray-300"
        />
        <Button
          onClick={() => handleSearch()}
          size="sm"
          className="absolute right-0 h-[40px] w-[40px] p-0 rounded-l-none rounded-r-sm bg-primary"
        >
          <Search className="w-5 h-5 text-white" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
          {/* Show search results if user has typed something */}
          {debouncedQuery && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Search Results
                </h3>
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
              
              {isSearching ? (
                <SearchResultSkeleton />
              ) : (() => {
                const searchProducts = Array.isArray(searchResults?.data?.products) 
                  ? searchResults.data.products 
                  : [];
                
                if (searchProducts.length > 0) {
                  return (
                    <div className="space-y-1">
                      {searchProducts.map((product: Product) => (
                        <button
                          key={product._id || product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Avatar className="w-10 h-10 rounded-md">
                            {product.images && product.images.length > 0 ? (
                              <AvatarImage 
                                src={product.images[0]} 
                                alt={product.title}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-gray-200 rounded-md">
                                <Package className="w-5 h-5 text-gray-500" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 line-clamp-1 capitalize">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${product.price.toFixed(2)}
                              {product.brand && ` • ${product.brand}`}
                            </p>
                          </div>
                        </button>
                      ))}
                      
                      {searchResults?.pagination && searchResults.pagination.totalItems > 5 && (
                        <button
                          onClick={() => handleSearch()}
                          className="w-full px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-md transition-colors text-center"
                        >
                          View all {searchResults.pagination.totalItems} results
                        </button>
                      )}
                    </div>
                  );
                } else if (!isSearching) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No products found
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Recent searches */}
          {!debouncedQuery && recentSearches.length >0  &&(
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            
                <div className="space-y-1">
                  {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentSearchClick(item.query)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 capitalize line-clamp-1">{item.query}</span>
                  </button>
                  ))}
                </div>
              
            </div>
          )}

          {/* Categories */}
          {!debouncedQuery && (
            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
              {isCategoriesLoading ? (
                <CategoriesSkeleton />
              ) : activeCategories.length > 0 ? (
                <div className="space-y-1">
                  {activeCategories.slice(0, 5).map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Popular products - shown when not searching */}
          {!debouncedQuery && (
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Products</h3>
              <PopularProducts onProductClick={handleProductClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for popular products
const PopularProducts: React.FC<{ onProductClick: (product: Product) => void }> = ({ onProductClick }) => {
  const { data: popularProducts, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const response = await axios.get('/products', {
        params: {
          status: 'active',
          limit: 3,
          sort: '-createdAt', // Get newest products as "popular"
        },
      });
      console.log('Popular products response:', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return <PopularProductsSkeleton />;
  }

  if (error) {
    console.error('Error fetching popular products:', error);
    return null;
  }
console.log('popularProducts', popularProducts)
  // Check if products are in data array
  const products = Array.isArray(popularProducts?.data?.products) 
    ? popularProducts.data.products 
    : [];

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {products.map((product) => (
        <button
          key={product._id || product.id}
          onClick={() => onProductClick(product)}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
        >
          <Avatar className="w-10 h-10 rounded-md">
            {product.images && product.images.length > 0 ? (
              <AvatarImage 
                src={product.images[0]} 
                alt={product.title}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gray-200 rounded-md">
                <Package className="w-5 h-5 text-gray-500" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 line-clamp-1 capitalize">
              {product.title}
            </p>
            <p className="text-xs text-gray-500">
              ${product.price.toFixed(2)}
              {product.brand && ` • ${product.brand}`}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};