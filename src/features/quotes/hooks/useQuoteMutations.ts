import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quoteService, CreateQuoteRequest, QuoteResponse } from '../services/quoteService';
import { queryClient } from '@/lib/queryClient';

const QUERY_KEYS = {
  quotes: ['quotes'],
  quote: (id: string) => ['quote', id],
};

// Create quote request mutation
export const useCreateQuoteMutation = () => {
  return useMutation({
    mutationFn: (data: CreateQuoteRequest) => quoteService.createQuoteRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes });
      toast.success('Quote request submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit quote request';
      toast.error(message);
    },
  });
};

// Get all quotes query
export const useQuotesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.quotes,
    queryFn: () => quoteService.getQuotes(),
  });
};

// Get single quote query
export const useQuoteByIdQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.quote(id),
    queryFn: () => quoteService.getQuoteById(id),
    enabled: !!id,
  });
};

// Update quote status mutation
export const useUpdateQuoteStatusMutation = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteResponse['status'] }) =>
      quoteService.updateQuoteStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote(variables.id) });
      toast.success('Quote status updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update quote status';
      toast.error(message);
    },
  });
};

// Delete quote mutation
export const useDeleteQuoteMutation = () => {
  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes });
      toast.success('Quote deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete quote';
      toast.error(message);
    },
  });
};
