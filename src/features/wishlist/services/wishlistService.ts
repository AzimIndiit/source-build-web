import axiosInstance from '@/lib/axios';

export interface WishlistItem {
  product: {
    id: string;
    _id: string;
    title: string;
    price: number;
    images: string[];
    slug: string;
    discount?: {
      discountType: 'none' | 'flat' | 'percentage';
      discountValue?: number;
    };
    rating?: number;
    stock?: number;
    status?: string;
  };
  addedAt: string;
  notificationEnabled?: boolean;
  priceAlert?: {
    targetPrice: number;
    alertEnabled: boolean;
  };
}

export interface Wishlist {
  id: string;
  _id: string;
  user: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: Wishlist;
}

export interface AddToWishlistPayload {
  productId: string;
  notificationEnabled?: boolean;
  priceAlert?: {
    targetPrice: number;
    alertEnabled: boolean;
  };
}

export interface RemoveFromWishlistPayload {
  productId: string;
}

export interface UpdateWishlistItemPayload {
  productId: string;
  notificationEnabled?: boolean;
  priceAlert?: {
    targetPrice: number;
    alertEnabled: boolean;
  } | null;
}

export interface BatchCheckResponse {
  success: boolean;
  message: string;
  data: Record<string, boolean>;
}

class WishlistService {
  async getWishlist(): Promise<WishlistResponse> {
    const response = await axiosInstance.get<WishlistResponse>('/wishlists');
    return response.data;
  }

  async addToWishlist(payload: AddToWishlistPayload): Promise<WishlistResponse> {
    const response = await axiosInstance.post<WishlistResponse>('/wishlists/add', payload);
    return response.data;
  }

  async removeFromWishlist(payload: RemoveFromWishlistPayload): Promise<WishlistResponse> {
    const response = await axiosInstance.post<WishlistResponse>('/wishlists/remove', payload);
    return response.data;
  }

  async updateWishlistItem(payload: UpdateWishlistItemPayload): Promise<WishlistResponse> {
    const response = await axiosInstance.patch<WishlistResponse>('/wishlists/update', payload);
    return response.data;
  }

  async clearWishlist(): Promise<WishlistResponse> {
    const response = await axiosInstance.delete<WishlistResponse>('/wishlists/clear');
    return response.data;
  }

  async checkProductInWishlist(productId: string): Promise<{ success: boolean; data: { isInWishlist: boolean } }> {
    const response = await axiosInstance.get<{ success: boolean; data: { isInWishlist: boolean } }>(
      `/wishlists/check/${productId}`
    );
    return response.data;
  }

  async getWishlistCount(): Promise<{ success: boolean; data: { count: number } }> {
    const response = await axiosInstance.get<{ success: boolean; data: { count: number } }>('/wishlists/count');
    return response.data;
  }

  async getPopularWishlistItems(limit?: number): Promise<{ success: boolean; data: any[] }> {
    const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/wishlists/popular', {
      params: { limit },
    });
    return response.data;
  }

  async batchCheckProducts(productIds: string[]): Promise<BatchCheckResponse> {
    const response = await axiosInstance.post<BatchCheckResponse>('/wishlists/batch-check', { productIds });
    return response.data;
  }
}

export const wishlistService = new WishlistService();