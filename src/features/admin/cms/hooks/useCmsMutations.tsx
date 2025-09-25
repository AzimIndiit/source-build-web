import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { cmsService } from '../services/cmsService';
import { CreateCmsPagePayload, UpdateCmsPagePayload } from '../types';

// Fetch all CMS pages
export const usePagesQuery = () => {
  return useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsService.getPages(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single page by slug
export const usePageQuery = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => cmsService.getPageBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Create page mutation
export const useCreatePage = () => {
  return useMutation({
    mutationFn: (data: CreateCmsPagePayload) => cmsService.createPage(data),
    onSuccess: () => {
      toast.success('Page created successfully');
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create page');
    },
  });
};

// Update page mutation
export const useUpdatePage = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCmsPagePayload }) =>
      cmsService.updatePage(id, data),
    onSuccess: () => {
      toast.success('Page updated successfully');
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update page');
    },
  });
};

// Update banner section mutation
export const useUpdateBannerSection = () => {
  return useMutation({
    mutationFn: ({ pageId, sectionId, data }: { pageId: string; sectionId: string; data: any }) =>
      cmsService.updateBannerSection(pageId, sectionId, data),
    onSuccess: () => {
      toast.success('Banner section updated successfully');
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update banner section');
    },
  });
};

// Update collection section mutation
export const useUpdateCollectionSection = () => {
  return useMutation({
    mutationFn: ({ pageId, sectionId, data }: { pageId: string; sectionId: string; data: any }) =>
      cmsService.updateCollectionSection(pageId, sectionId, data),
    onSuccess: () => {
      toast.success('Collection section updated successfully');
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update collection section');
    },
  });
};

// Update product section mutation
export const useUpdateProductSection = () => {
  return useMutation({
    mutationFn: ({ pageId, sectionId, data }: { pageId: string; sectionId: string; data: any }) =>
      cmsService.updateProductSection(pageId, sectionId, data),
    onSuccess: () => {
      toast.success('Product section updated successfully');
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product section');
    },
  });
};



