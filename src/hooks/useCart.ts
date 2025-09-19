import { useMutation, useQuery } from '@tanstack/react-query';
import { cartService, AddToCartRequest, UpdateCartItemRequest } from '@/services/cart.service';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';

const CART_QUERY_KEY = 'cart';
const CART_COUNT_QUERY_KEY = 'cartCount';

// Get cart with real-time prices
export const useCart = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';
  return useQuery({
    queryKey: [CART_QUERY_KEY],
    queryFn: () => cartService.getCart(),
    enabled: isBuyer, // Only fetch if user is a buyer
    staleTime: 5000, // Cache for 5 seconds to prevent duplicate calls
    refetchOnWindowFocus: isBuyer, // Only refetch when window regains focus if buyer
    refetchOnMount: isBuyer ? 'always' : false, // Ensure fresh data on mount only for buyers
  });
};

// Get cart count
export const useCartCount = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';

  return useQuery({
    queryKey: [CART_COUNT_QUERY_KEY],
    queryFn: () => cartService.getCartCount(),
    enabled: isBuyer, // Only fetch if user is a buyer
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Add to cart mutation
export const useAddToCart = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';

  return useMutation({
    mutationFn: (data: AddToCartRequest) => {
      if (!isBuyer) {
        return Promise.reject(new Error('Only buyers can add items to cart'));
      }
      return cartService.addToCart(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Item added to cart');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to add item to cart');
    },
  });
};

// Update cart item mutation
export const useUpdateCartItem = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';

  return useMutation({
    mutationFn: (data: UpdateCartItemRequest) => {
      if (!isBuyer) {
        return Promise.reject(new Error('Only buyers can update cart items'));
      }
      return cartService.updateCartItem(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Cart updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update cart');
    },
  });
};

// Remove from cart mutation
export const useRemoveFromCart = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) => {
      if (!isBuyer) {
        return Promise.reject(new Error('Only buyers can remove cart items'));
      }
      return cartService.removeFromCart(productId, variantId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to remove item');
    },
  });
};

// Clear cart mutation
export const useClearCart = () => {
  const user = useAuthStore((state) => state.user);
  const isBuyer = user?.role === 'buyer';

  return useMutation({
    mutationFn: () => {
      if (!isBuyer) {
        return Promise.reject(new Error('Only buyers can clear cart'));
      }
      return cartService.clearCart();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([CART_QUERY_KEY], data);
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });
      // toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to clear cart');
    },
  });
};
