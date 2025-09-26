import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { useProductsQuery } from '../hooks/useProductMutations';
import { ProductDataTable } from '../components/ProductDataTable';
import toast from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const itemsPerPage = 10;

  // Fetch products from API
  const { data, isLoading } = useProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleProductClick = (slug: string, status: string) => {
    if (status === 'draft') {
      toast('Draft products are not available for preview', {
        icon: '⚠️',
        style: {
          background: '#FEF8C6',
          color: '#000',
          border: '1px solid #FCE992',
        },
      });
      return;
    } else {
      navigate(`/admin/products/${slug}`);
    }
  };

  // Handle both old and new API response structures
  const responseData: any = data?.data;
  const products = Array.isArray(responseData) ? responseData : responseData?.products || [];

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Product Table */}
      <ProductDataTable
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        products={products}
        onViewDetails={handleProductClick}
        title="Products"
        isLoading={isLoading}
      />

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

export default ProductsPage;
