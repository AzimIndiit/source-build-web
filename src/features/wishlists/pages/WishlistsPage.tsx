import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';

import { useProductsQuery } from '@/features/products/hooks/useProductMutations';
import { EmptyState } from '@/components/common/EmptyState';
import ProductEmptyIcon from '@/assets/svg/productEmptyState.svg';
import ProductCard from '@/features/dashboard/components/ProductCard';
import { MarketPlacePageSkeleton } from '@/features/dashboard/components/MarketPlacePageSkeleton';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

const WishListPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<any>({
    sorting: 'ascending',
  });
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const itemsPerPage = 10;

  // Fetch products from API
  const { data, isLoading, isError, refetch } = useProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    isInWishlist: true,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
    ...activeFilters,
  });

  const handleProductClick = (slug: string, status: string) => {
    navigate(`/products/${slug}`);
  };

  // Loading state
  if (isLoading) {
    return <MarketPlacePageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="py-4 md:p-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Saved</h1>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Saved</h1>
        </div>
        <EmptyState
          title="No products found"
          description="Check back later for new products"
          icon={<img src={ProductEmptyIcon} alt="Product empty" className="h-64 w-auto" />}
          className="h-64"
        />
      </div>
    );
  }

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Saved</h1>
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
    </div>
  );
};

export default WishListPage;
