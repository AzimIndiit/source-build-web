import axiosInstance from '@/lib/axios';
import { fileService } from '@/features/profile/services/fileService';

export interface CreateProductPayload {
  title: string;
  price: number;
  description: string;
  category: string;
  subCategory: string;
  quantity: number;
  brand: string;
  color: string;
  locationIds: string[];
  productTag: string[];
  variants?: Array<{
    color: string;
    quantity: number;
    price: number;
    discount: {
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
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
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
}

export interface SaveDraftPayload {
  title: string;
  images: string[];
  price?: number;
  description?: string;
  category?: string;
  subCategory?: string;
  quantity?: number;
  brand?: string;
  color?: string;
  locationIds?: string[];
  productTag?: string[];
  variants?: Array<{
    color: string;
    quantity: number;
    price: number;
    discount: {
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
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
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
  category: string;
  subCategory: string;
  quantity: number;
  brand: string;
  color: string;
  locationIds: any[]; // Changed to any[] to handle location objects
  productTag: string[];
  variants?: Array<{
    id?: string;
    color: string;
    quantity: number;
    price: number;
    discount: {
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
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
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

  async updateDraft(id: string, data: Partial<SaveDraftPayload> & { status?: string }): Promise<ProductResponse> {
    const response = await axiosInstance.patch<ProductResponse>(`/products/${id}`, {
      ...data,
      status: 'draft'
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
    search?: string;
  }): Promise<ProductsListResponse> {
    const response = await axiosInstance.get<ProductsListResponse>('/products', { params });
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

  async uploadProductImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => fileService.uploadFile(file));
    const responses = await Promise.all(uploadPromises);
    return responses.map((response) => response.data.url);
  }
}

export const productService = new ProductService();
