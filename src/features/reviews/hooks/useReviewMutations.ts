import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

// Create review mutation
export const useCreateReview = () => {

  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      // toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    },
  });
};

// Get product reviews query
export const useProductReviews = (productId: string, params?: any) => {
  return useQuery({
    queryKey: ['product-reviews', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

// Get user reviews query
export const useUserReviews = (params?: any) => {
  return useQuery({
    queryKey: ['user-reviews', params],
    queryFn: () => reviewService.getUserReviews(params),
  });
};

// Update review mutation
export const useUpdateReview = () => {
  

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: any }) =>
      reviewService.updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast.success('Review updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update review';
      toast.error(message);
    },
  });
};

// Delete review mutation
export const useDeleteReview = () => {
  

  return useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete review';
      toast.error(message);
    },
  });
};

// Mark review as helpful mutation
export const useMarkReviewHelpful = () => {
  

  return useMutation({
    mutationFn: ({ reviewId, helpful }: { reviewId: string; helpful: boolean }) =>
      reviewService.markReviewHelpful(reviewId, helpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark review';
      toast.error(message);
    },
  });
};

// Add response to review mutation (for sellers)
export const useAddReviewResponse = () => {
  

  return useMutation({
    mutationFn: ({ reviewId, comment }: { reviewId: string; comment: string }) =>
      reviewService.addReviewResponse(reviewId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast.success('Response added successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add response';
      toast.error(message);
    },
  });
};