import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bankAccountService, CreateBankAccountPayload } from '../services/bankAccountService';
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
    mutationFn: ({ id, data }: { id: string; data: CreateBankAccountPayload }) =>
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankAccountService.setDefaultBankAccount(id),
    // Optimistic update
    onMutate: async (newDefaultId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(BANK_ACCOUNTS_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(BANK_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old?.data) return old;

        // Update all accounts: set the new one as default, unset all others
        const updatedAccounts = old.data.map((account: any) => ({
          ...account,
          isDefault: account.id === newDefaultId,
        }));

        return {
          ...old,
          data: updatedAccounts,
        };
      });

      // Return a context object with the snapshotted value
      return { previousAccounts };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error: any, newDefaultId, context) => {
      queryClient.setQueryData(BANK_ACCOUNTS_QUERY_KEY, context?.previousAccounts);
      const message = error.response?.data?.message || 'Failed to set default bank account';
      toast.error(message);
      console.error('Set default bank account error:', error);
    },
    // Always refetch after error or success to ensure we're in sync
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEY });
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Default bank account updated');
    },
  });
}
