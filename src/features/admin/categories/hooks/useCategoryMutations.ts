import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { categoryService, CategoryFilters } from '../services/categoryService';
import { queryClient } from '@/lib/queryClient';
import { CreateCategoryDto, UpdateCategoryDto } from '../types';

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    },
  });
};

export const useToggleCategoryStatus = () => {
  return useMutation({
    mutationFn: (id: string) => categoryService.toggleCategoryStatus(id),
    onSuccess: (data) => {
      toast.success(data.data.isActive ? 'Category activated' : 'Category deactivated');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle category status');
    },
  });
};

export const useCategoriesQuery = (params: CategoryFilters) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryByIdQuery = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId),
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryStatsQuery = () => {
  return useQuery({
    queryKey: ['category-stats'],
    queryFn: () => categoryService.getCategoryStats(),
    staleTime: 5 * 60 * 1000,
  });
};
