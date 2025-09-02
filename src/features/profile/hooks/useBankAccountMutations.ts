import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bankAccountService, CreateBankAccountPayload, de } from '../services/bankAccountService';
import { queryClient } from '@/lib/queryClient';

const BANK_ACCOUNTS_QUERY_KEY = ['bankAccounts'];

export function useBankAccountsQuery() {
  return useQuery({
    queryKey: BANK_ACCOUNTS_QUERY_KEY,
    queryFn: () => bankAccountService.getBankAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateBankAccountMutation() {
  return useMutation({
    mutationFn: (data: CreateBankAccountPayload) => bankAccountService.createBankAccount(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      toast.success(response.message || 'Bank account added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add bank account';
      toast.error(message);
      console.error('Create bank account error:', error);
    },
  });
}

export function useUpdateBankAccountMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountPayload }) =>
      bankAccountService.updateBankAccount(id, data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      toast.success(response.message || 'Bank account updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update bank account';
      toast.error(message);
      console.error('Update bank account error:', error);
    },
  });
}

export function useDeleteBankAccountMutation() {
  return useMutation({
    mutationFn: (id: string) => bankAccountService.deleteBankAccount(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      toast.success(response.message || 'Bank account deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete bank account';
      toast.error(message);
      console.error('Delete bank account error:', error);
    },
  });
}

export function useSetDefaultBankAccountMutation() {
  return useMutation({
    mutationFn: (id: string) => bankAccountService.setDefaultBankAccount(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
      toast.success(response.message || 'Default bank account updated');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to set default bank account';
      toast.error(message);
      console.error('Set default bank account error:', error);
    },
  });
}
