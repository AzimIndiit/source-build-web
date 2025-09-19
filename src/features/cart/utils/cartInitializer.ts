import useCartStore from '@/stores/cartStore';
import { cartService } from '@/services/cart.service';

/**
 * Initialize cart on app load
 * - For authenticated users: sync local cart with backend
 * - For guest users: keep local cart
 */
export const initializeCart = async (isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    // Guest user - keep local cart
    useCartStore.setState({ isSynced: false });
    return;
  }

  try {
    // Check if user has local cart items
    const localItems = useCartStore.getState().items;
    const hasLocalItems = localItems.length > 0;

    // Fetch backend cart
    const backendCart = await cartService.getCart();
    const hasBackendItems = backendCart.items.length > 0;

    if (hasLocalItems && !hasBackendItems) {
      // User has local items but backend is empty - push all to backend
      console.log('Syncing local cart to empty backend cart...');
      await useCartStore.getState().syncLocalToAPI();
    } else if (hasLocalItems && hasBackendItems) {
      // Both have items - merge unique items
      console.log('Merging local and backend carts...');

      // Find items that exist in local but not in backend
      const uniqueLocalItems = localItems.filter((localItem) => {
        return !backendCart.items.some(
          (backendItem) =>
            backendItem.productId === localItem.productId &&
            backendItem.variantId === localItem.variantId
        );
      });

      if (uniqueLocalItems.length > 0) {
        // Add unique local items to backend
        for (const item of uniqueLocalItems) {
          await cartService.addToCart({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        }
        console.log(`Added ${uniqueLocalItems.length} unique items from local to backend`);
      }

      // Fetch updated cart
      await useCartStore.getState().fetchCart();
    } else if (!hasLocalItems && hasBackendItems) {
      // Only backend has items - sync to local
      console.log('Syncing backend cart to local...');
      useCartStore.getState().syncWithAPI(backendCart);
    } else {
      // Both empty - just mark as synced
      useCartStore.setState({ isSynced: true, cartData: backendCart });
    }
  } catch (error) {
    console.error('Failed to initialize cart:', error);
    // Keep local cart on error
    useCartStore.setState({ isSynced: false });
  }
};

/**
 * Clear local cart when user logs out
 */
export const clearLocalCartOnLogout = () => {
  // Keep items in local storage for guest experience
  // Just mark as not synced
  useCartStore.setState({
    isSynced: false,
    cartData: null,
  });
};
