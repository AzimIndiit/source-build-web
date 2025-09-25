import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  cmsService,
  ContentType,
  CreateCmsContentPayload,
  UpdateCmsContentPayload,
} from '../services/cmsService';
import { queryClient } from '@/lib/queryClient';

const CMS_QUERY_KEY = ['cms'];

// Query hooks for sellers - for single content type
export function useCmsContentQuery(type?: ContentType) {
  console.log('type', type)
  // Use public landing page endpoint to get populated data
  if (type === ContentType.LANDING_PAGE) {
    return useQuery({
      queryKey: [...CMS_QUERY_KEY, 'public', 'landing-page'],
      queryFn: () => cmsService.getPublicLandingPage(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      enabled: true,
    });
  }
  return useQuery({
    queryKey: type ? [...CMS_QUERY_KEY, type] : [...CMS_QUERY_KEY, 'disabled'],
    queryFn: () => type ? cmsService.getContent(type) : Promise.resolve({} as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!type,
  });
}

export function useAllCmsContentQuery() {
  return useQuery({
    queryKey: CMS_QUERY_KEY,
    queryFn: () => cmsService.getAllContent(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Query hooks for public content (buyers viewing seller content)
export function usePublicCmsContentQuery(sellerId: string, type?: ContentType) {
  return useQuery({
    queryKey: ['cms-public', sellerId, type],
    queryFn: () =>
      type ? cmsService.getPublicContent(sellerId, type) : cmsService.getAllPublicContent(sellerId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!sellerId,
  });
}

// Mutation hooks
export function useCreateOrUpdateCmsMutation() {
  return useMutation({
    mutationFn: (data: CreateCmsContentPayload) => cmsService.createOrUpdateContent(data),
    onSuccess: async (response, variables) => {
      await queryClient.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, variables.type] });
      toast.success(response.message || 'Content saved successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save content';
      toast.error(message);
      console.error('Save CMS content error:', error);
    },
  });
}

export function useUpdateCmsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: { type: ContentType; data: UpdateCmsContentPayload }) =>
      cmsService.updateContent(type, data),
    onSuccess: async (response, variables) => {
      await queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, variables.type] });
      toast.success(response.message || 'Content updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update content';
      toast.error(message);
      console.error('Update CMS content error:', error);
    },
  });
}

export function useDeleteCmsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: ContentType) => cmsService.deleteContent(type),
    onSuccess: async (response, type) => {
      await queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: [...CMS_QUERY_KEY, type] });
      toast.success(response.message || 'Content deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete content';
      toast.error(message);
      console.error('Delete CMS content error:', error);
    },
  });
}
