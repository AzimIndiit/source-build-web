import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { subcategoryService, SubcategoryFilters } from '../services/subcategoryService';
import { queryClient } from '@/lib/queryClient';
import { CreateSubcategoryDto, UpdateSubcategoryDto } from '../types';

export const useCreateSubcategory = () => {
  return useMutation({
    mutationFn: (data: CreateSubcategoryDto) => subcategoryService.createSubcategory(data),
    onSuccess: () => {
      toast.success('Subcategory created successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create subcategory');
    },
  });
};

export const useUpdateSubcategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubcategoryDto }) =>
      subcategoryService.updateSubcategory(id, data),
    onSuccess: () => {
      toast.success('Subcategory updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update subcategory');
    },
  });
};

export const useDeleteSubcategory = () => {
  return useMutation({
    mutationFn: (id: string) => subcategoryService.deleteSubcategory(id),
    onSuccess: () => {
      toast.success('Subcategory deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete subcategory');
    },
  });
};

export const useToggleSubcategoryStatus = () => {
  return useMutation({
    mutationFn: (id: string) => subcategoryService.toggleSubcategoryStatus(id),
    onSuccess: (data) => {
      toast.success(data.data.isActive ? 'Subcategory activated' : 'Subcategory deactivated');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle subcategory status');
    },
  });
};

export const useSubcategoriesQuery = (params: SubcategoryFilters) => {
  return useQuery({
    queryKey: ['subcategories', params],
    queryFn: () => subcategoryService.getSubcategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubcategoryByIdQuery = (subcategoryId: string, enabled = true) => {
  return useQuery({
    queryKey: ['subcategory', subcategoryId],
    queryFn: () => subcategoryService.getSubcategoryById(subcategoryId),
    enabled: enabled && !!subcategoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubcategoriesByCategoryQuery = (
  categoryId: string,
  filters?: SubcategoryFilters
) => {
  return useQuery({
    queryKey: ['subcategories', 'category', categoryId, filters],
    queryFn: () => subcategoryService.getSubcategoriesByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubcategoryStatsQuery = () => {
  return useQuery({
    queryKey: ['subcategory-stats'],
    queryFn: () => subcategoryService.getSubcategoryStats(),
    staleTime: 5 * 60 * 1000,
  });
};
