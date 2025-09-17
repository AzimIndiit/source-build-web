import { useMutation, useQuery } from '@tanstack/react-query';
import { cartService, AddToCartRequest, UpdateCartItemRequest } from '@/services/cart.service';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

const CART_QUERY_KEY = 'cart';
const CART_COUNT_QUERY_KEY = 'cartCount';

// Get cart with real-time prices
export const useCart = () => {
  return useQuery({
    queryKey: [CART_QUERY_KEY],
    queryFn: () => cartService.getCart(),
    staleTime: 5000, // Cache for 5 seconds to prevent duplicate calls
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: 'always', // Ensure fresh data on mount
  });
};

// Get cart count
export const useCartCount = () => {
  return useQuery({
    queryKey: [CART_COUNT_QUERY_KEY],
    queryFn: () => cartService.getCartCount(),
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Add to cart mutation
export const useAddToCart = () => {
  

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartService.addToCart(data),
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Item added to cart');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    },
  });
};

// Update cart item mutation
export const useUpdateCartItem = () => {
  

  return useMutation({
    mutationFn: (data: UpdateCartItemRequest) => cartService.updateCartItem(data),
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Cart updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    },
  });
};

// Remove from cart mutation
export const useRemoveFromCart = () => {
  

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) => 
      cartService.removeFromCart(productId, variantId),
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    },
  });
};

// Clear cart mutation
export const useClearCart = () => {
  

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    },
  });
};