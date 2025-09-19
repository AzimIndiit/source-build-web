import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useCartStore from '@/stores/cartStore';

/**
 * Hook to sync cart with backend when user authentication state changes
 * Implements local-first with background sync and two-way merge
 */
export const useCartSync = () => {
  const { user } = useAuth();
  const {
    isSynced,
    mergeCartsOnLogin,
    fetchCart,
    processSyncQueue,
    startPeriodicSync,
    stopPeriodicSync,
  } = useCartStore();

  const hasInitialSyncRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        // User is logged in
        const userChanged = previousUserIdRef.current !== user.id;
        previousUserIdRef.current = user.id;

        if (userChanged && !hasInitialSyncRef.current) {
          hasInitialSyncRef.current = true;

          try {
            // Merge local cart with server cart on login
            await mergeCartsOnLogin();

            // Process any pending operations in the sync queue
            await processSyncQueue();

            // Start periodic sync for two-way updates
            startPeriodicSync();
          } catch (error) {
            console.error('Failed to sync cart on login:', error);
            hasInitialSyncRef.current = false;
          }
        } else if (!userChanged && isSynced) {
          // User was already logged in, just fetch latest
          await fetchCart();
        }
      } else {
        // User is logged out
        hasInitialSyncRef.current = false;
        previousUserIdRef.current = null;

        // Stop periodic sync when logged out
        stopPeriodicSync();

        // Mark as not synced but keep local items
        useCartStore.setState({ isSynced: false, cartData: null });
      }
    };

    syncCart();
  }, [user?.id]); // Only depend on user ID to avoid unnecessary re-runs

  // Process sync queue on reconnection
  useEffect(() => {
    const handleOnline = async () => {
      if (user && isSynced) {
        await processSyncQueue();
        await fetchCart();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, isSynced]);

  // Handle visibility change for two-way sync
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = async () => {
      if (!document.hidden && user && isSynced) {
        // Debounce to prevent multiple rapid calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          // Fetch latest cart when tab becomes visible (with debounce)
          await fetchCart();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isSynced]);

  return { isSynced };
};

export default useCartSync;
