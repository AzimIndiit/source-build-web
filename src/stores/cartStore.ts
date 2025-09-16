import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  price: number; // This is the final price after discount
  originalPrice?: number; // Original price before discount
  discount?: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  };
  quantity: number;
  image: string;
  color?: string;
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
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          // Check if the same product with same color/variant already exists
          // Compare by productId and either variantId or color
          const existingItemIndex = state.items.findIndex((i) => {
            // If both have variantId, compare by variantId
            if (item.variantId && i.variantId) {
              return i.productId === item.productId && i.variantId === item.variantId;
            }
            // If no variantId, compare by productId and color
            return i.productId === item.productId && i.color === item.color;
          });

          if (existingItemIndex > -1) {
            // Same product and variant/color exists - update quantity
            const existingItem = state.items[existingItemIndex];
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              existingItem.maxQuantity
            );

            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };

            const variantInfo = item.color ? ` (${item.color})` : '';
            // toast.success(`Updated ${item.title}${variantInfo} quantity in cart`);
            return { items: updatedItems };
          } else {
            // New item or different variant - add as separate item
            // Use consistent ID based on product and variant/color (no timestamp for same items)
            const cartItemId = `${item.productId}${item.variantId ? `-${item.variantId}` : item.color ? `-${item.color}` : ''}-${Date.now()}`;

            const newItem: CartItem = {
              ...item,
              id: cartItemId,
            };

            const variantInfo = item.color ? ` (${item.color})` : '';
            // toast.success(`Added ${item.title}${variantInfo} to cart`);

            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            // toast.success(`Removed ${item.title} from cart`);
          }
          return { items: state.items.filter((item) => item.id !== id) };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.min(quantity, item.maxQuantity);
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        // toast.success('Cart cleared');
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
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);

export default useCartStore;
