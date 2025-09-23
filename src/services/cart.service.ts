import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';

export interface Product {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  images?: string[];
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  attributes?: Record<string, any>;
  seller?: any;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: string;
  // Real-time product data
  product: Product | null;
  currentPrice: number;
  originalPrice: number;
  discount?: any;
  inStock: boolean;
  stockQuantity: number;
  outOfStock: boolean;
  isDeleted: boolean;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  totalItems: number;
  subtotal: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

class CartService {
  private baseUrl = '/cart';

  // Get user's cart with real-time prices
  async getCart(): Promise<Cart> {
    const response = await axios.get<ApiResponse<Cart>>(this.baseUrl);
    return response.data.data;
  }

  // Get cart item count
  async getCartCount(): Promise<number> {
    const response = await axios.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/count`);
    return response.data.data.count;
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    // Clean up the data - remove empty variantId
    const cleanData = {
      productId: data.productId,
      quantity: data.quantity || 1,
      ...(data.variantId && data.variantId.trim() !== '' && { variantId: data.variantId }),
    };

    console.log('Sending to cart API:', cleanData);

    const response = await axios.post<ApiResponse<Cart>>(`${this.baseUrl}/add`, cleanData);
    return response.data.data;
  }

  // Update item quantity in cart
  async updateCartItem(data: UpdateCartItemRequest): Promise<Cart> {
    // Clean up the data - remove empty variantId
    const cleanData = {
      productId: data.productId,
      quantity: data.quantity,
      ...(data.variantId && data.variantId !== '' && { variantId: data.variantId }),
    };

    const response = await axios.put<ApiResponse<Cart>>(`${this.baseUrl}/update`, cleanData);
    return response.data.data;
  }

  // Remove item from cart
  async removeFromCart(productId: string, variantId?: string): Promise<Cart> {
    // Don't include variantId in URL if it's empty string
    const url =
      variantId && variantId !== ''
        ? `${this.baseUrl}/remove/${productId}/${variantId}`
        : `${this.baseUrl}/remove/${productId}`;
    const response = await axios.delete<ApiResponse<Cart>>(url);
    return response.data.data;
  }

  // Clear entire cart
  async clearCart(): Promise<Cart> {
    const response = await axios.delete<ApiResponse<Cart>>(`${this.baseUrl}/clear`);
    return response.data.data;
  }
}

export const cartService = new CartService();
