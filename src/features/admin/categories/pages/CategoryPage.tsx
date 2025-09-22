import React, { useState, useMemo } from 'react';

import { CategoryDataTable } from '../components/CategoryDataTable';
import { CategoryModal } from '../components/CategoryModal';
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useCategoriesQuery,
} from '../hooks/useCategoryMutations';
import { Category } from '../types';
import { PaginationWrapper } from '@/components/ui';

const CategoryPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search parameter if there's a search value
    if (searchValue) {
      params.search = searchValue;
    }

    return params;
  }, [currentPage, itemsPerPage, searchValue]);

  // Fetch categories from API with filters
  const { data, isLoading } = useCategoriesQuery(queryParams);
  const categories = data?.data || [];
  const pagination = data?.meta?.pagination;
  const totalPages = pagination?.pages || 1;
  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();

  // const handleSortChange = (value: string, range?: { from: Date; to: Date }) => {
  //   setSortValue(value);
  //   if (range) {
  //     setDateRange(range);
  //   }
  //   setCurrentPage(1); // Reset to first page on sort change
  // };

  const handleOpenModal = (category?: Category) => {
    setSelectedCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({
        id: selectedCategory._id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    handleCloseModal();
  };

  const handleDelete = async (categoryId: string) => {
    await deleteMutation.mutateAsync(categoryId);
  };

  const handleToggleStatus = async (categoryId: string) => {
    await toggleStatusMutation.mutateAsync(categoryId);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const isActionLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleStatusMutation.isPending;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Categories Table */}
      <CategoryDataTable
        title="Categories"
        categories={categories as Category[]}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
        actionLoading={isActionLoading}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        showSort={false}
        showFilter={false}
        onAddCategory={handleOpenModal}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-2'>
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={selectedCategory}
          isLoading={isActionLoading}
          edit={!!selectedCategory}
        />
      )}
    </div>
  );
};

export default CategoryPage;
