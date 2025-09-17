import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  wishlistService,
  AddToWishlistPayload,
  RemoveFromWishlistPayload,
  UpdateWishlistItemPayload,
  Wishlist,
  WishlistItem,
} from '../services/wishlistService';

const WISHLIST_QUERY_KEY = ['wishlist'];
const WISHLIST_COUNT_QUERY_KEY = ['wishlist', 'count'];
const WISHLIST_CHECK_QUERY_KEY = (productId: string) => ['wishlist', 'check', productId];
const WISHLIST_BATCH_CHECK_QUERY_KEY = (productIds: string[]) => [
  'wishlist',
  'batch-check',
  productIds,
];

export const useWishlist = () => {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const response = await wishlistService.getWishlist();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: WISHLIST_COUNT_QUERY_KEY,
    queryFn: async () => {
      const response = await wishlistService.getWishlistCount();
      return response.data.count;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCheckProductInWishlist = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: WISHLIST_CHECK_QUERY_KEY(productId),
    queryFn: async () => {
      const response = await wishlistService.checkProductInWishlist(productId);
      return response.data.isInWishlist;
    },
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBatchCheckProducts = (productIds: string[], enabled = true) => {
  return useQuery({
    queryKey: WISHLIST_BATCH_CHECK_QUERY_KEY(productIds),
    queryFn: async () => {
      const response = await wishlistService.batchCheckProducts(productIds);
      return response.data;
    },
    enabled: enabled && productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.addToWishlist,
    onMutate: async (payload: AddToWishlistPayload) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: WISHLIST_COUNT_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: WISHLIST_CHECK_QUERY_KEY(payload.productId) });

      const previousWishlist = queryClient.getQueryData<Wishlist>(WISHLIST_QUERY_KEY);
      const previousCount = queryClient.getQueryData<number>(WISHLIST_COUNT_QUERY_KEY);

      const optimisticItem: Partial<WishlistItem> = {
        product: {
          id: payload.productId,
          _id: payload.productId,
          title: '',
          price: 0,
          images: [],
          slug: '',
        },
        addedAt: new Date().toISOString(),
        notificationEnabled: payload.notificationEnabled,
        priceAlert: payload.priceAlert,
      };

      queryClient.setQueryData<Wishlist>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) {
          return {
            id: '',
            _id: '',
            user: '',
            items: [optimisticItem as WishlistItem],
            itemCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return {
          ...old,
          items: [...old.items, optimisticItem as WishlistItem],
          itemCount: old.itemCount + 1,
        };
      });

      queryClient.setQueryData<number>(WISHLIST_COUNT_QUERY_KEY, (old) => (old || 0) + 1);
      queryClient.setQueryData(WISHLIST_CHECK_QUERY_KEY(payload.productId), true);

      return { previousWishlist, previousCount };
    },
    onError: (error, payload, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(WISHLIST_COUNT_QUERY_KEY, context.previousCount);
      }
      queryClient.setQueryData(WISHLIST_CHECK_QUERY_KEY(payload.productId), false);

      toast.error('Failed to add to wishlist');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, data.data);
      queryClient.invalidateQueries({ queryKey: WISHLIST_COUNT_QUERY_KEY });
      // Invalidate products queries to update wishlist status
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added to wishlist');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onMutate: async (payload: RemoveFromWishlistPayload) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: WISHLIST_COUNT_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: WISHLIST_CHECK_QUERY_KEY(payload.productId) });

      const previousWishlist = queryClient.getQueryData<Wishlist>(WISHLIST_QUERY_KEY);
      const previousCount = queryClient.getQueryData<number>(WISHLIST_COUNT_QUERY_KEY);

      queryClient.setQueryData<Wishlist>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.product._id !== payload.productId),
          itemCount: Math.max(0, old.itemCount - 1),
        };
      });

      queryClient.setQueryData<number>(WISHLIST_COUNT_QUERY_KEY, (old) =>
        Math.max(0, (old || 0) - 1)
      );
      queryClient.setQueryData(WISHLIST_CHECK_QUERY_KEY(payload.productId), false);

      return { previousWishlist, previousCount };
    },
    onError: (error, payload, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(WISHLIST_COUNT_QUERY_KEY, context.previousCount);
      }
      queryClient.setQueryData(WISHLIST_CHECK_QUERY_KEY(payload.productId), true);

      toast.error('Failed to remove from wishlist');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, data.data);
      queryClient.invalidateQueries({ queryKey: WISHLIST_COUNT_QUERY_KEY });
      // Invalidate products queries to update wishlist status and refetch if filtering by wishlist
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product removed from wishlist');
    },
  });
};

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.updateWishlistItem,
    onMutate: async (payload: UpdateWishlistItemPayload) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<Wishlist>(WISHLIST_QUERY_KEY);

      queryClient.setQueryData<Wishlist>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => {
            if (item.product._id === payload.productId) {
              return {
                ...item,
                notificationEnabled: payload.notificationEnabled ?? item.notificationEnabled,
                priceAlert:
                  payload.priceAlert === null ? undefined : (payload.priceAlert ?? item.priceAlert),
              };
            }
            return item;
          }),
        };
      });

      return { previousWishlist };
    },
    onError: (error, _payload, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      toast.error('Failed to update wishlist item');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, data.data);
      toast.success('Wishlist item updated');
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.clearWishlist,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: WISHLIST_COUNT_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<Wishlist>(WISHLIST_QUERY_KEY);
      const previousCount = queryClient.getQueryData<number>(WISHLIST_COUNT_QUERY_KEY);

      queryClient.setQueryData<Wishlist>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [],
          itemCount: 0,
        };
      });

      queryClient.setQueryData<number>(WISHLIST_COUNT_QUERY_KEY, 0);
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'check'] });

      return { previousWishlist, previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(WISHLIST_COUNT_QUERY_KEY, context.previousCount);
      }
      toast.error('Failed to clear wishlist');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, data.data);
      queryClient.setQueryData(WISHLIST_COUNT_QUERY_KEY, 0);
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'check'] });
      // Invalidate products queries to update wishlist status
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Wishlist cleared');
    },
  });
};

export const useToggleWishlist = (productId: string) => {
  const { data: isInWishlist } = useCheckProductInWishlist(productId);
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggle = () => {
    if (isInWishlist) {
      removeMutation.mutate({ productId });
    } else {
      addMutation.mutate({ productId });
    }
  };

  return {
    isInWishlist: !!isInWishlist,
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};
