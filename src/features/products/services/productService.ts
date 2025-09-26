import axiosInstance from '@/lib/axios';
import { fileService } from '@/features/profile/services/fileService';
import { Category } from '@/features/admin/categories/types';

export interface CreateProductPayload {
  title: string;
  price: number;
  priceType?: 'sqft' | 'linear' | 'pallet';
  description: string;
  category: string | Category;
  subCategory: string | Category;
  quantity: number;
  brand?: string;
  color?: string;
  locationIds: string[];
  productTag: string[];
  outOfStock: boolean;
  variants?: Array<{
    color: string;
    quantity: number;
    price: number;
    outOfStock: boolean;
    discount?: {
      discountType: 'none' | 'flat' | 'percentage';
      discountValue?: number;
    } | null;
    images?: string[];
  }>;
  marketplaceOptions?: {
    pickup?: boolean;
    shipping?: boolean;
    delivery?: boolean;
  };
  deliveryDistance?: number;
  pickupHours?: string;
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
  readyByDays?: number;
  localDeliveryFree?: boolean;
  discount?: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  } | null;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
  };
  images: string[];
  productAttributes?: Array<{
    attributeName: string;
    inputType: string;
    value: any;
    required?: boolean;
  }>;
}

export interface SaveDraftPayload {
  title: string;
  images: string[];
  price?: number;
  priceType?: 'sqft' | 'linear' | 'pallet';
  description?: string;
  category?: string | Category;
  subCategory?: string | Category;
  quantity?: number;
  outOfStock?: boolean;
  brand?: string;
  color?: string;
  locationIds?: string[];
  productTag?: string[];
  variants?: Array<{
    color: string;
    quantity: number;
    price: number;
    priceType?: 'sqft' | 'linear' | 'pallet';
    outOfStock?: boolean;
    discount?: {
      discountType: 'none' | 'flat' | 'percentage';
      discountValue?: number;
    };
    images?: string[];
  }>;
  marketplaceOptions?: {
    pickup?: boolean;
    shipping?: boolean;
    delivery?: boolean;
  };
  pickupHours?: string;
  localDeliveryFree?: boolean;
  deliveryDistance?: number;
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
  readyByDays?: string | number;
  discount?: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  };
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
  };
  isDraft: boolean;
  productAttributes?: Array<{
    attributeName: string;
    inputType: string;
    value: any;
    required?: boolean;
  }>;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  description: string;
  category: string | Category;
  subCategory: string | Category;
  priceType?: 'sqft' | 'linear' | 'pallet';
  quantity: number;
  outOfStock?: boolean;
  brand: string;
  color: string;
  locationIds: any[]; // Changed to any[] to handle location objects
  productTag: string[];
  variants?: Array<{
    id?: string;
    color: string;
    quantity: number;
    price: number;
    outOfStock?: boolean;
    discount?: {
      discountType: 'none' | 'flat' | 'percentage';
      discountValue?: number;
    };
    images?: string[];
  }>;
  marketplaceOptions?: {
    pickup?: boolean;
    shipping?: boolean;
    delivery?: boolean;
  };
  localDeliveryFree?: boolean;
  deliveryDistance?: number | string;
  pickupHours?: string;
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
  readyByDays?: number | string;
  discount: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  };
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
  };
  images: string[];
  userId?: string;
  seller?: {
    _id: string;
    email: string;
    displayName: string;
    avatar?: string;
    id: string;
  };
  isDraft?: boolean;
  status?: string;
  views?: number;
  likes?: number;
  rating?: number;
  totalReviews?: number;
  sold?: number;
  featured?: boolean;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductsListResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ProductService {
  async createProduct(data: CreateProductPayload): Promise<ProductResponse> {
    const response = await axiosInstance.post<ProductResponse>('/products', data);
    return response.data;
  }

  async saveDraft(data: SaveDraftPayload): Promise<ProductResponse> {
    const response = await axiosInstance.post<ProductResponse>('/products/draft', data);
    return response.data;
  }

  async updateDraft(
    id: string,
    data: Partial<SaveDraftPayload> & { status?: string }
  ): Promise<ProductResponse> {
    const response = await axiosInstance.patch<ProductResponse>(`/products/${id}`, {
      ...data,
      status: 'draft',
    });
    return response.data;
  }

  async updateProduct(id: string, data: Partial<CreateProductPayload>): Promise<ProductResponse> {
    const response = await axiosInstance.put<ProductResponse>(`/products/${id}`, data);
    return response.data;
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    subCategory?: string;
    search?: string;
    attributes?: Record<string, string[]>;
    [key: string]: any;
  }): Promise<ProductsListResponse> {
    // Process attributes to send as query params
    const processedParams = { ...params };
    
    if (params?.attributes && Object.keys(params.attributes).length > 0) {
      // Convert attributes object to query string format
      // Backend might expect attributes in a specific format
      processedParams.attributes = JSON.stringify(params.attributes);
    }
    
    const response = await axiosInstance.get<ProductsListResponse>('/products', { params: processedParams });
    return response.data;
  }

  async getProductBySlug(slug: string): Promise<ProductResponse> {
    console.log('slug', slug);
    const response = await axiosInstance.get<ProductResponse>(`/products/${slug}`);
    return response.data;
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const response = await axiosInstance.get<ProductResponse>(`/products/id/${id}`);
    return response.data;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/products/${id}`
    );
    return response.data;
  }

  async toggleProductStatus(
    id: string,
    status: 'active' | 'inactive'
  ): Promise<{ message: string; data: any }> {
    const response = await axiosInstance.patch(`/products/${id}/status`, { status });
    return response.data;
  }

  async updateProductStock(
    id: string,
    data: {
      quantity: number;
      variants?: Array<{ index: number; quantity: number; outOfStock?: boolean }>;
      outOfStock?: boolean;
    }
  ): Promise<ProductResponse> {
    const response = await axiosInstance.patch<ProductResponse>(`/products/${id}/stock`, data);
    return response.data;
  }

  async uploadProductImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => fileService.uploadFile(file));
    const responses = await Promise.all(uploadPromises);
    return responses.map((response) => response.data.url);
  }

  async getRelatedProducts(productId: string, limit: number = 8): Promise<ProductsListResponse> {
    const response = await axiosInstance.get<ProductsListResponse>(
      `/products/${productId}/related?limit=${limit}`
    );
    return response.data;
  }
}

export const productService = new ProductService();
