import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { cartService, CartItem as APICartItem, Cart } from '@/services/cart.service';
import toast from 'react-hot-toast';

// Map API cart item to local cart item format for backward compatibility
export interface CartItem {
  id: string; // Will use productId + variantId as unique identifier
  productId: string;
  variantId?: string;
  title: string;
  slug?: string;
  price: number; // Current price with real-time updates
  originalPrice?: number; // Original price before discount
  discount?: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  };
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  seller?: {
    id: string;
    businessName: string;
  };
  maxQuantity: number;
  marketplaceOptions?: {
    pickup?: boolean;
    shipping?: boolean;
    delivery?: boolean;
  };
  shippingPrice?: number;
  selectedOptions?: {
    color?: string;
    size?: string;
    [key: string]: any;
  };
  // Additional fields from API
  inStock?: boolean;
  isDeleted?: boolean;
  outOfStock?: boolean;
  addedPrice?: number; // Price when item was added to cart
  // Sync tracking
  syncStatus?: 'local' | 'synced' | 'pending'; // Track sync status per item
  lastModified?: number; // Timestamp for conflict resolution
}

interface SyncQueue {
  operation: 'add' | 'update' | 'remove' | 'clear';
  data: any;
  timestamp: number;
  retries: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  cartData: Cart | null;
  isSynced: boolean; // Track if cart is synced with backend
  syncQueue: SyncQueue[]; // Queue for pending operations
  lastServerSync: number; // Last time we synced with server
  syncInterval: NodeJS.Timeout | null; // Interval for periodic sync

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  syncWithAPI: (cart: Cart, mergeStrategy?: 'replace' | 'merge') => void;
  syncLocalToAPI: () => Promise<void>; // Sync local items to API when user logs in
  processSyncQueue: () => Promise<void>; // Process pending sync operations
  startPeriodicSync: () => void; // Start periodic sync with server
  stopPeriodicSync: () => void; // Stop periodic sync
  mergeCartsOnLogin: () => Promise<void>; // Smart merge when user logs in

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

// Helper function to generate unique item ID
const generateItemId = (productId: string, variantId?: string): string => {
  return `${productId}${variantId ? `-${variantId}` : ''}`;
};

// Helper function to convert API cart item to local format
const mapAPICartItemToLocal = (apiItem: APICartItem): CartItem => {
  const id = generateItemId(apiItem.productId, apiItem.variantId);
  
  // Calculate discount if prices differ
  let discount: CartItem['discount'] = { discountType: 'none' };
  const currentPrice = apiItem.currentPrice ?? 0;
  const originalPrice = apiItem.originalPrice ?? 0;
  
  if (originalPrice > currentPrice) {
    const discountAmount = originalPrice - currentPrice;
    const discountPercent = Math.round((discountAmount / originalPrice) * 100);
    discount = {
      discountType: 'percentage',
      discountValue: discountPercent
    };
  }

  return {
    id,
    productId: apiItem.productId,
    variantId: apiItem.variantId,
    title: apiItem.product?.title || 'Unknown Product',
    slug: apiItem.product?.slug,
    price: currentPrice,
    originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
    discount,
    quantity: apiItem.quantity,
    image: apiItem.product?.images?.[0],
    color: apiItem.product?.color,
    size: apiItem.product?.size,
    maxQuantity: apiItem.stockQuantity ?? 99,
    inStock: apiItem.inStock && !apiItem.outOfStock,
    isDeleted: apiItem.isDeleted === true,
    outOfStock: apiItem.outOfStock === true,
    addedPrice: currentPrice,
    selectedOptions: {
      ...(apiItem.product?.color && { color: apiItem.product.color }),
      ...(apiItem.product?.size && { size: apiItem.product.size }),
      ...apiItem.product?.attributes
    },
    syncStatus: 'synced',
    lastModified: Date.now()
  };
};

// Merge strategy for conflicting items
const mergeCartItems = (localItem: CartItem, serverItem: CartItem): CartItem => {
  // Use the one with the latest modification
  if ((localItem.lastModified || 0) > (serverItem.lastModified || 0)) {
    return { ...localItem, syncStatus: 'pending' };
  }
  return { ...serverItem, syncStatus: 'synced' };
};

const useCartStore = create<CartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        isLoading: false,
        cartData: null,
        isSynced: false,
        syncQueue: [],
        lastServerSync: 0,
        syncInterval: null,

        fetchCart: async () => {
          set({ isLoading: true });
          try {
            const cart = await cartService.getCart();
            get().syncWithAPI(cart, 'merge');
            set({ isSynced: true, lastServerSync: Date.now() });
          } catch (error: any) {
            console.error('Failed to fetch cart:', error);
            // If user is not authenticated, keep local cart state
            if (error.response?.status === 401) {
              set({ isSynced: false });
            }
          } finally {
            set({ isLoading: false });
          }
        },

        syncWithAPI: (cart: Cart, mergeStrategy = 'replace') => {
          const serverItems = cart.items.map(mapAPICartItemToLocal);
          
          if (mergeStrategy === 'merge') {
            // Smart merge: combine local and server items
            const { items: localItems } = get();
            const mergedItems: CartItem[] = [];
            const processedIds = new Set<string>();

            // First, process all server items
            serverItems.forEach(serverItem => {
              const localItem = localItems.find(l => l.id === serverItem.id);
              if (localItem && localItem.syncStatus === 'local') {
                // Conflict: merge based on last modified
                mergedItems.push(mergeCartItems(localItem, serverItem));
              } else {
                // No conflict: use server version
                mergedItems.push(serverItem);
              }
              processedIds.add(serverItem.id);
            });

            // Add local-only items (not in server)
            localItems.forEach(localItem => {
              if (!processedIds.has(localItem.id) && localItem.syncStatus === 'local') {
                mergedItems.push({ ...localItem, syncStatus: 'pending' });
              }
            });

            set({ 
              items: mergedItems, 
              cartData: cart,
              isSynced: true 
            });
          } else {
            // Replace strategy: just use server data
            set({ 
              items: serverItems, 
              cartData: cart,
              isSynced: true 
            });
          }
        },

        mergeCartsOnLogin: async () => {
          const { items: localItems } = get();
          
          if (localItems.length === 0) {
            // No local items, just fetch server cart
            await get().fetchCart();
            return;
          }

          try {
            // Get current backend cart
            const backendCart = await cartService.getCart();
            const backendItems = backendCart.items || [];
            
            // Find items that exist only locally
            const uniqueLocalItems = localItems.filter(localItem => {
              return !backendItems.some(backendItem => 
                backendItem.productId === localItem.productId && 
                backendItem.variantId === localItem.variantId
              );
            });
            
            // Add unique local items to server
            for (const item of uniqueLocalItems) {
              try {
                await cartService.addToCart({
                  productId: item.productId,
                  variantId: item.variantId || undefined,
                  quantity: item.quantity
                });
              } catch (error) {
                console.error('Failed to sync item:', error);
              }
            }
            
            // Fetch the merged cart from server
            await get().fetchCart();
          } catch (error) {
            console.error('Failed to merge carts:', error);
            // Keep local items on error
          }
        },

        processSyncQueue: async () => {
          const { syncQueue, isSynced } = get();
          if (!isSynced || syncQueue.length === 0) return;

          const queue = [...syncQueue];
          const failedOps: SyncQueue[] = [];

          for (const op of queue) {
            try {
              switch (op.operation) {
                case 'add':
                  await cartService.addToCart(op.data);
                  break;
                case 'update':
                  await cartService.updateCartItem(op.data);
                  break;
                case 'remove':
                  await cartService.removeFromCart(op.data.productId, op.data.variantId);
                  break;
                case 'clear':
                  await cartService.clearCart();
                  break;
              }
            } catch (error) {
              console.error('Sync operation failed:', op, error);
              if (op.retries < 3) {
                failedOps.push({ ...op, retries: op.retries + 1 });
              }
            }
          }

          set({ syncQueue: failedOps });
        },

        startPeriodicSync: () => {
          const { syncInterval } = get();
          if (syncInterval) return; // Already running

          // Sync every 60 seconds (reduced from 30 to avoid excessive calls)
          const interval = setInterval(async () => {
            const { isSynced } = get();
            if (isSynced) {
              // Only fetch if tab is visible
              if (!document.hidden) {
                await get().fetchCart();
              }
              await get().processSyncQueue();
            }
          }, 60000);

          set({ syncInterval: interval });
        },

        stopPeriodicSync: () => {
          const { syncInterval } = get();
          if (syncInterval) {
            clearInterval(syncInterval);
            set({ syncInterval: null });
          }
        },

        addItem: async (item) => {
          const cartItemId = generateItemId(item.productId, item.variantId);
          const timestamp = Date.now();
          
          // LOCAL-FIRST: Update local state immediately
          set((state) => {
            const existingItemIndex = state.items.findIndex(i => i.id === cartItemId);

            if (existingItemIndex > -1) {
              // Update existing item quantity
              const existingItem = state.items[existingItemIndex];
              const newQuantity = Math.min(
                existingItem.quantity + item.quantity,
                item.maxQuantity || 99
              );

              const updatedItems = [...state.items];
              updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                syncStatus: 'local',
                lastModified: timestamp
              };

              return { items: updatedItems };
            } else {
              // Add new item
              const newItem: CartItem = {
                ...item,
                id: cartItemId,
                inStock: item.inStock !== false && item.outOfStock !== true,
                outOfStock: item.outOfStock === true || item.inStock === false,
                syncStatus: 'local',
                lastModified: timestamp
              };

              return { items: [...state.items, newItem] };
            }
          });

          // toast.success('Product added to cart');

          // BACKGROUND SYNC: Try to sync with API
          const { isSynced } = get();
          if (isSynced) {
            try {
              const cart = await cartService.addToCart({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
              });
              
              // Update item with server data (prices, stock, etc)
              set((state) => ({
                items: state.items.map(i => {
                  if (i.id === cartItemId) {
                    const serverItem = cart.items.find(si => 
                      si.productId === item.productId && 
                      si.variantId === item.variantId
                    );
                    if (serverItem) {
                      return { ...mapAPICartItemToLocal(serverItem), quantity: i.quantity };
                    }
                  }
                  return i;
                }),
                cartData: cart
              }));
            } catch (error: any) {
              console.error('Background sync failed:', error);
              
              // Add to sync queue for retry
              set((state) => ({
                syncQueue: [...state.syncQueue, {
                  operation: 'add',
                  data: {
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                  },
                  timestamp,
                  retries: 0
                }]
              }));
              
              if (error.response?.status === 401) {
                set({ isSynced: false });
              }
            }
          }
        },

        removeItem: async (id: string) => {
          const { items } = get();
          const item = items.find(i => i.id === id);
          
          if (!item) return;
          
          // LOCAL-FIRST: Remove immediately
          set((state) => ({
            items: state.items.filter((item) => item.id !== id)
          }));

          // toast.success('Product removed from cart');

          // BACKGROUND SYNC
          const { isSynced } = get();
          if (isSynced && item.productId) {
            try {
              const cart = await cartService.removeFromCart(item.productId, item.variantId);
              // Update with fresh server data
              set({ cartData: cart });
            } catch (error: any) {
              console.error('Background sync failed:', error);
              
              // Add to sync queue
              set((state) => ({
                syncQueue: [...state.syncQueue, {
                  operation: 'remove',
                  data: { productId: item.productId, variantId: item.variantId },
                  timestamp: Date.now(),
                  retries: 0
                }]
              }));
              
              if (error.response?.status === 401) {
                set({ isSynced: false });
              }
            }
          }
        },

        updateQuantity: async (id: string, quantity: number) => {
          if (quantity < 1) return;
          
          const { items } = get();
          const item = items.find(i => i.id === id);
          
          if (!item) return;
          
          const timestamp = Date.now();
          
          // LOCAL-FIRST: Update immediately
          set((state) => ({
            items: state.items.map((item) => 
              item.id === id 
                ? { 
                    ...item, 
                    quantity: Math.min(quantity, item.maxQuantity || 99),
                    syncStatus: 'local',
                    lastModified: timestamp
                  }
                : item
            )
          }));

          // BACKGROUND SYNC
          const { isSynced } = get();
          if (isSynced && item.productId) {
            try {
              const cart = await cartService.updateCartItem({
                productId: item.productId,
                variantId: item.variantId,
                quantity
              });
              
              // Update with server data
              set((state) => ({
                items: state.items.map(i => {
                  if (i.id === id) {
                    const serverItem = cart.items.find(si => 
                      si.productId === item.productId && 
                      si.variantId === item.variantId
                    );
                    if (serverItem) {
                      return mapAPICartItemToLocal(serverItem);
                    }
                  }
                  return i;
                }),
                cartData: cart
              }));
            } catch (error: any) {
              console.error('Background sync failed:', error);
              
              // Add to sync queue
              set((state) => ({
                syncQueue: [...state.syncQueue, {
                  operation: 'update',
                  data: {
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity
                  },
                  timestamp,
                  retries: 0
                }]
              }));
              
              if (error.response?.status === 401) {
                set({ isSynced: false });
              }
            }
          }
        },

        clearCart: async () => {
          // LOCAL-FIRST: Clear immediately
          set({ items: [] });
          
          // toast.success('Cart cleared');

          // BACKGROUND SYNC
          const { isSynced } = get();
          if (isSynced) {
            try {
              const cart = await cartService.clearCart();
              set({ cartData: cart });
            } catch (error: any) {
              console.error('Background sync failed:', error);
              
              // Add to sync queue
              set((state) => ({
                syncQueue: [...state.syncQueue, {
                  operation: 'clear',
                  data: {},
                  timestamp: Date.now(),
                  retries: 0
                }]
              }));
              
              if (error.response?.status === 401) {
                set({ isSynced: false });
              }
            }
          }
        },

        toggleCart: () => {
          set((state) => ({ isOpen: !state.isOpen }));
        },

        getTotalItems: () => {
          const { items } = get();
          return items.reduce((total, item) => total + item.quantity, 0);
        },

        getTotalPrice: () => {
          const { items } = get();
          return items.reduce((total, item) => total + item.price * item.quantity, 0);
        },

        getItemCount: () => {
          const { items } = get();
          return items.length;
        },

        syncLocalToAPI: async () => {
          // This is now handled by mergeCartsOnLogin
          await get().mergeCartsOnLogin();
        }
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          items: state.items,
          syncQueue: state.syncQueue,
          lastServerSync: state.lastServerSync
        }),
      }
    )
  )
);

// Auto-start periodic sync when store is created
if (typeof window !== 'undefined') {
  useCartStore.getState().startPeriodicSync();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    useCartStore.getState().stopPeriodicSync();
  });
}

export default useCartStore;