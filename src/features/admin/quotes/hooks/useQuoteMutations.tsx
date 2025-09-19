import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { quoteService, QuoteFilters, CreateQuotePayload } from '../services/quoteService';
import { queryClient } from '@/lib/queryClient';
import { Quote } from '../types';

// Fetch quotes with filters
export const useQuotesQuery = (params?: QuoteFilters) => {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => quoteService.getQuotes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single quote
export const useQuoteQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => quoteService.getQuoteById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Delete quote mutation
export const useDeleteQuote = () => {
  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      toast.success('Quote deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete quote');
    },
  });
};

// Update quote mutation
export const useUpdateQuote = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      quoteService.updateQuote(id, data),
    onSuccess: (data) => {
      toast.success('Quote updated successfully');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.data.id || data.data._id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update quote');
    },
  });
};

// Create quote mutation
export const useCreateQuote = () => {
  return useMutation({
    mutationFn: (data: CreateQuotePayload) => quoteService.createQuote(data),
    onSuccess: () => {
      toast.success('Quote created successfully');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create quote');
    },
  });
};

// Update quote status mutation
export const useUpdateQuoteStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      quoteService.updateQuoteStatus(id, status),
    onSuccess: (data) => {
      toast.success('Quote status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.data.id || data.data._id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update quote status');
    },
  });
};

// Respond to quote mutation (admin response)
export const useRespondToQuote = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        quotedPrice?: number;
        estimatedTime?: string;
        responseNotes?: string;
        status?: 'completed' | 'rejected';
      };
    }) => quoteService.respondToQuote(id, data),
    onSuccess: (data) => {
      toast.success('Quote response sent successfully');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.data.id || data.data._id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to respond to quote');
    },
  });
};

// Get quote statistics
export const useQuoteStatsQuery = (period?: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: ['quote-stats', period],
    queryFn: () => quoteService.getQuoteStats(period),
    staleTime: 5 * 60 * 1000,
  });
};
