import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { QuoteResponse, Quote } from '../types';
import { queryClient } from '@/lib/queryClient';

// Fetch quotes with filters
export const useQuotesQuery = (params?: any) => {
  return useQuery<QuoteResponse>({
    queryKey: ['quotes', params],
    queryFn: async () => {
      const { data } = await axios.get('/quotes', { params });
      return data;
    },
  });
};

// Get single quote
export const useQuoteQuery = (id: string) => {
  return useQuery<Quote>({
    queryKey: ['quote', id],
    queryFn: async () => {
      const { data } = await axios.get(`/quotes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Delete quote mutation
export const useDeleteQuote = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/quotes/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete quote');
    },
  });
};

// Update quote mutation
export const useUpdateQuote = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Quote>) => {
      const { data: response } = await axios.patch(`/quotes/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update quote');
    },
  });
};

// Create quote mutation
export const useCreateQuote = () => {
  return useMutation({
    mutationFn: async (data: Partial<Quote>) => {
      const { data: response } = await axios.post('/quotes', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create quote');
    },
  });
};
