import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addressService,
  CreateSavedAddressPayload,
  UpdateSavedAddressPayload,
} from '../services/addressService';

const SAVED_ADDRESSES_QUERY_KEY = ['savedAddresses'];

export function useSavedAddresssQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: SAVED_ADDRESSES_QUERY_KEY,
    queryFn: () => addressService.getAddresses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled, // Only run query if enabled is true
  });
}

export function useCreateSavedAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavedAddressPayload) => addressService.createAddress(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      toast.success(response.message || 'Saved address added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add saved address';
      toast.error(message);
      console.error('Create saved address error:', error);
    },
  });
}

export function useUpdateSavedAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedAddressPayload }) =>
      addressService.updateAddress(id, data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      toast.success(response.message || 'Saved address updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update saved address';
      toast.error(message);
      console.error('Update saved address error:', error);
    },
  });
}

export function useDeleteSavedAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      toast.success(response.message || 'Saved address deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete saved address';
      toast.error(message);
      console.error('Delete saved address error:', error);
    },
  });
}

export function useSetDefaultSavedAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: SAVED_ADDRESSES_QUERY_KEY });
      toast.success(response.message || 'Default saved address updated');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to set default saved address';
      toast.error(message);
      console.error('Set default saved address error:', error);
    },
  });
}
