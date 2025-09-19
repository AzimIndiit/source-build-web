import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { SubcategoryDataTable } from '../components/SubcategoryDataTable';
import { SubcategoryModal } from '../components/SubcategoryModal';
import {
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
  useToggleSubcategoryStatus,
  useSubcategoriesQuery,
} from '../hooks/useSubcategoryMutations';
import { Subcategory, Category } from '../types';
import { PaginationWrapper } from '@/components/ui';
import { CategoryDataTable } from '../components/CategoryDataTable';
import { CategoryModal } from '../components/CategoryModal';

const SubcategoryPage: React.FC = () => {
  const {id: categoryId} = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Get category from URL query params if present
  useEffect(() => {
    const categoryFromUrl = categoryId;
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryId]);

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

    // Add category filter if selected
    if (selectedCategory) {
      params.category = selectedCategory;
    }

    return params;
  }, [currentPage, itemsPerPage, searchValue, selectedCategory]);

  // Fetch subcategories from API with filters
  const { data, isLoading } = useSubcategoriesQuery(queryParams);
  const responseData = data?.data;
  console.log('responseData', responseData)

  const subcategories = responseData || [];
  const pagination = responseData?.meta?.pagination;
  const totalPages = pagination?.pages || 1;

  // Mutations
  const createMutation = useCreateSubcategory();
  const updateMutation = useUpdateSubcategory();
  const deleteMutation = useDeleteSubcategory();
  const toggleStatusMutation = useToggleSubcategoryStatus();

  const handleOpenModal = (subcategory?: Subcategory | Category) => {
    setSelectedSubcategory(subcategory as Subcategory || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSubcategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    if (selectedSubcategory) {
      await updateMutation.mutateAsync({
        id: selectedSubcategory._id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    handleCloseModal();
  };

  const handleDelete = async (subcategoryId: string) => {
    await deleteMutation.mutateAsync(subcategoryId);
  };

  const handleToggleStatus = async (subcategoryId: string) => {
    await toggleStatusMutation.mutateAsync(subcategoryId);
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
     {/* Sub Categories Table */}
     <CategoryDataTable
        title="Subcategories"
        categories={subcategories}
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
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Category Modal */}
   { isModalOpen &&  <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        category={selectedSubcategory}
        categoryId={selectedCategory}
        isLoading={isActionLoading}
        edit={!!selectedSubcategory}
      />}
    </div>
  );
};

export default SubcategoryPage;