import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cardService,
  CreateCardPayload,
  CreateCardWithTokenPayload,
  UpdateCardPayload,
} from '../services/cardService';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

const CARDS_QUERY_KEY = ['user', 'cards'];

// Query to fetch all cards
export function useCardsQuery() {
  return useQuery({
    queryKey: CARDS_QUERY_KEY,
    queryFn: () => cardService.getCards(),
  });
}

// Mutation to create a new card with token
export function useCreateCardMutation() {
   

  return useMutation({
    mutationFn: (data: CreateCardWithTokenPayload) => cardService.createCardWithToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
      toast.success('Card added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add card';
      toast.error(message);
    },
  });
}

// Legacy mutation to create a new card (for backwards compatibility)
export function useCreateCardLegacyMutation() {
   

  return useMutation({
    mutationFn: (data: CreateCardPayload) => cardService.createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
      toast.success('Card added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add card';
      toast.error(message);
    },
  });
}

// Mutation to update a card
export function useUpdateCardMutation() {
   

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardPayload }) =>
      cardService.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
      toast.success('Card updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update card';
      toast.error(message);
    },
  });
}

// Mutation to set a card as default
export function useSetDefaultCardMutation() {
   

  return useMutation({
    mutationFn: (id: string) => cardService.setDefaultCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
      toast.success('Default card updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update default card';
      toast.error(message);
    },
  });
}

// Mutation to delete a card
export function useDeleteCardMutation() {
   

  return useMutation({
    mutationFn: (id: string) => cardService.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
      toast.success('Card removed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove card';
      toast.error(message);
    },
  });
}
