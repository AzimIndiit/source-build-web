import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import FilterDropdown from '@/components/ui/FilterDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import {
  useProductsQuery,
  useDeleteProductMutation,
} from '@/features/products/hooks/useProductMutations';
import ProductCard from '../components/ProductCard';
import { DeleteConfirmationModal } from '@/components/ui';
import { MarketPlacePageSkeleton } from '../components/MarketPlacePageSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import ProductEmptyIcon from '@/assets/svg/productEmptyState.svg';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

const MarketPlacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<any>({
    sorting: 'ascending',
  });
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Store the full filter state to persist it
  const [filterState, setFilterState] = useState<{
    popularity: FilterOption[];
    newest: FilterOption[];
    availability: FilterOption[];
    readyTime: FilterOption[];
    sorting: string;
    pricing: string;
    priceRange: number[];
  }>({
    popularity: [
      { id: 'best-selling', label: 'Best-Selling Products', checked: false },
      { id: 'most-viewed', label: 'Most Viewed', checked: false },
      { id: 'top-rated', label: 'Top-Rated', checked: false },
      { id: 'most-reviewed', label: 'Most Reviewed', checked: false },
      { id: 'featured', label: 'Featured Products', checked: false },
      { id: 'trending', label: 'Trending Now', checked: false },
    ],
    newest: [
      { id: 'recently-updated', label: 'Recently Updated', checked: false },
      { id: 'featured-new', label: 'Featured New Products', checked: false },
      { id: 'sort-by-date', label: 'Sort by Date Added', checked: false },
      { id: 'new-arrivals', label: 'New Arrivals', checked: false },
    ],
    availability: [
      { id: 'delivery', label: 'Delivery', checked: false },
      { id: 'shipping', label: 'Shipping', checked: false },
      { id: 'pickup', label: 'Pickup', checked: false },
    ],
    readyTime: [
      { id: 'next-day', label: 'Ready Next Day', checked: false },
      { id: 'this-week', label: 'Ready This Week', checked: false },
    ],
    sorting: 'ascending',
    pricing: '',
    priceRange: [],
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string;
    productTitle: string;
  }>({
    isOpen: false,
    productId: '',
    productTitle: '',
  });
  const itemsPerPage = 10;

  // Read category and attribute filters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subCategory');
    const attributesParam = searchParams.get('attributes');
    
    let parsedAttributes = {};
    if (attributesParam) {
      try {
        parsedAttributes = JSON.parse(attributesParam);
      } catch (e) {
        console.error('Failed to parse attributes from URL', e);
      }
    }

    setActiveFilters((prev: any) => ({
      ...prev,
      category: categoryParam !== 'All' ? categoryParam : undefined,
      subCategory: subCategoryParam || undefined,
      attributes: parsedAttributes,
    }));
  }, [location.search]);

  // Fetch products from API
  const { data, isLoading, isError, refetch } = useProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
    ...activeFilters,
  });

  const deleteProductMutation = useDeleteProductMutation();

  const handleApplyFilters = (filters: any) => {
    // Save the filter state to persist it
    setFilterState(filters);

    // Transform filters to match backend API expectations
    const transformedFilters: any = {};

    // Preserve category and subcategory filters from URL
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subCategory');

    if (categoryParam && categoryParam !== 'All') {
      transformedFilters.category = categoryParam;
    }
    if (subCategoryParam) {
      transformedFilters.subCategory = subCategoryParam;
    }

    // Popularity filters - collect checked items
    const popularityFilters = filters.popularity
      .filter((opt: any) => opt.checked)
      .map((opt: any) => opt.id);
    if (popularityFilters.length > 0) {
      transformedFilters.popularity = popularityFilters;
    }

    // Newest filters
    const newestFilters = filters.newest
      .filter((opt: any) => opt.checked)
      .map((opt: any) => opt.id);
    if (newestFilters.length > 0) {
      transformedFilters.newest = newestFilters;
    }

    // Availability filters
    const availabilityFilters = filters.availability
      .filter((opt: any) => opt.checked)
      .map((opt: any) => opt.id);
    if (availabilityFilters.length > 0) {
      transformedFilters.availability = availabilityFilters;
    }

    // Ready time filters
    const readyTimeFilters = filters.readyTime
      .filter((opt: any) => opt.checked)
      .map((opt: any) => opt.id);
    if (readyTimeFilters.length > 0) {
      transformedFilters.readyTime = readyTimeFilters;
    }

    // Sorting (A-Z)
    if (filters.sorting !== 'ascending') {
      transformedFilters.sorting = filters.sorting;
    }

    // Pricing
    if (filters.pricing !== 'custom' && filters.pricing !== '') {
      transformedFilters.pricing = filters.pricing;
    } else if (filters.priceRange && filters.pricing !== '') {
      // For custom pricing, send the price range
      transformedFilters.pricing = 'custom';
      transformedFilters.priceRange = filters.priceRange.join(',');
    }

    setActiveFilters(transformedFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    // Preserve category and subcategory filters from URL
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subCategory');

    const clearedFilters: any = {};
    if (categoryParam && categoryParam !== 'All') {
      clearedFilters.category = categoryParam;
    }
    if (subCategoryParam) {
      clearedFilters.subCategory = subCategoryParam;
    }

    setActiveFilters(clearedFilters);
    setCurrentPage(1);
    // Reset filter state to default
    setFilterState({
      popularity: [
        { id: 'best-selling', label: 'Best-Selling Products', checked: false },
        { id: 'most-viewed', label: 'Most Viewed', checked: false },
        { id: 'top-rated', label: 'Top-Rated', checked: false },
        { id: 'most-reviewed', label: 'Most Reviewed', checked: false },
        { id: 'featured', label: 'Featured Products', checked: false },
        { id: 'trending', label: 'Trending Now', checked: false },
      ],
      newest: [
        { id: 'recently-updated', label: 'Recently Updated', checked: false },
        { id: 'featured-new', label: 'Featured New Products', checked: false },
        { id: 'sort-by-date', label: 'Sort by Date Added', checked: false },
        { id: 'new-arrivals', label: 'New Arrivals', checked: false },
      ],
      availability: [
        { id: 'delivery', label: 'Delivery', checked: false },
        { id: 'shipping', label: 'Shipping', checked: false },
        { id: 'pickup', label: 'Pickup', checked: false },
      ],
      readyTime: [
        { id: 'next-day', label: 'Ready Next Day', checked: false },
        { id: 'this-week', label: 'Ready This Week', checked: false },
      ],
      sorting: 'ascending',
      pricing: '',
      priceRange: [],
    });
  };

  const handleProductClick = (slug: string, status: string) => {
    navigate(`/products/${slug}`);
  };

  const handleEditProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    navigate(`/seller/products/${productId}/edit`);
  };

  const handleDeleteProduct = (e: React.MouseEvent, productId: string, productTitle: string) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      productId,
      productTitle,
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteModal.productId);
      setDeleteModal({ isOpen: false, productId: '', productTitle: '' });
      refetch();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, productId: '', productTitle: '' });
  };
  const formattedCategory =
    activeFilters.category && !location.search.includes('type=all')
      ? `${activeFilters.category.split('-').join(' ')}`
      : 'Marketplace';

  // Loading state
  if (isLoading) {
    return <MarketPlacePageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="py-4 md:p-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize max-w-80 sm:max-w-full truncate">
            {formattedCategory}
          </h1>
          <FilterDropdown
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            initialFilters={filterState}
          />
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-600">Failed to load products</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  // Handle both old and new API response structures
  const responseData: any = data?.data;
  const products = Array.isArray(responseData) ? responseData : responseData?.products || [];
  const availableLocations = Array.isArray(responseData)
    ? []
    : responseData?.availableLocations || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // Empty state
  if (products.length === 0) {
    return (
      <div className="py-4 md:p-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize max-w-80 sm:max-w-full truncate">
            {formattedCategory}
          </h1>
          <div className="flex items-center gap-2">
            {/* Location Selector - Visible on tablet and desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-blue-50 flex gap-2 h-[42px] items-center px-2 md:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none cursor-pointer">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-gray-600 hidden md:block">Location</span>
                    <span className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {selectedLocation === 'all' ? (
                        <>
                          <span className="hidden lg:inline">All Locations</span>
                          <span className="lg:hidden">All</span>
                        </>
                      ) : (
                        <>
                          {availableLocations.find((loc: any) => loc._id === selectedLocation)
                            ?.displayName ||
                            availableLocations.find((loc: any) => loc._id === selectedLocation)
                              ?.city ||
                            'Select Location'}
                        </>
                      )}
                      <ChevronDown size={12} />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setSelectedLocation('all')}
                >
                  All Locations
                </DropdownMenuItem>
                {availableLocations.map((location: any) => (
                  <DropdownMenuItem
                    key={location._id}
                    className="cursor-pointer"
                    onClick={() => setSelectedLocation(location._id)}
                  >
                    {location.displayName || `${location.city}, ${location.state}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <FilterDropdown
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              initialFilters={filterState}
            />
          </div>
        </div>
        <div>
          <EmptyState
            title="No products found"
            description="Check back later for new products"
            icon={<img src={ProductEmptyIcon} alt="Product empty" className="h-64 w-auto" />}
            className="h-100"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize max-w-80 sm:max-w-full truncate">
          {formattedCategory}
        </h1>
        <div className="flex items-center gap-2">
          {/* Location Selector - Visible on tablet and desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-blue-50 flex gap-2 h-[42px] items-center px-2 md:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none cursor-pointer">
                <MapPin className="w-5 h-5 text-gray-700" />
                <div className="flex flex-col text-left">
                  <span className="text-xs text-gray-600 hidden md:block">Location</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1">
                    {selectedLocation === 'all' ? (
                      <>
                        <span className="hidden lg:inline">All Locations</span>
                        <span className="lg:hidden">All</span>
                      </>
                    ) : (
                      <>
                        {availableLocations.find((loc: any) => loc._id === selectedLocation)
                          ?.displayName ||
                          availableLocations.find((loc: any) => loc._id === selectedLocation)
                            ?.city ||
                          'Select Location'}
                      </>
                    )}
                    <ChevronDown size={12} />
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSelectedLocation('all')}
              >
                All Locations
              </DropdownMenuItem>
              {availableLocations.map((location: any) => (
                <DropdownMenuItem
                  key={location._id}
                  className="cursor-pointer"
                  onClick={() => setSelectedLocation(location._id)}
                >
                  {location.displayName || `${location.city}, ${location.state}`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <FilterDropdown
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            initialFilters={filterState}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product: any) => (
          <ProductCard
            key={product.id || product._id}
            product={product}
            onProductClick={handleProductClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong className="font-semibold">"{deleteModal.productTitle}"</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
};

export default MarketPlacePage;
