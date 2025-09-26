import axiosInstance from '@/lib/axios';
import {
  Subcategory,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  SubcategoryFilters,
  SubcategoriesResponse,
} from '../types';

export type { SubcategoryFilters };

export interface SubcategoryResponse {
  success: boolean;
  message?: string;
  data: Subcategory;
}

export interface SubcategoriesListResponse {
  success: boolean;
  message?: string;
  data: SubcategoriesResponse;
}

class SubcategoryService {
  // Get all subcategories with filters
  async getSubcategories(filters?: SubcategoryFilters): Promise<SubcategoriesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<SubcategoriesListResponse>('/subcategories', {
      params,
    });
    return response.data;
  }

  // Get single subcategory by ID
  async getSubcategoryById(subcategoryId: string): Promise<SubcategoryResponse> {
    const response = await axiosInstance.get<SubcategoryResponse>(
      `/subcategories/${subcategoryId}`
    );
    return response.data;
  }

  // Create new subcategory
  async createSubcategory(data: CreateSubcategoryDto): Promise<SubcategoryResponse> {
    const response = await axiosInstance.post<SubcategoryResponse>('/subcategories', data);
    return response.data;
  }

  // Update subcategory
  async updateSubcategory(
    subcategoryId: string,
    data: UpdateSubcategoryDto
  ): Promise<SubcategoryResponse> {
    const response = await axiosInstance.put<SubcategoryResponse>(
      `/subcategories/${subcategoryId}`,
      data
    );
    return response.data;
  }

  // Delete subcategory
  async deleteSubcategory(subcategoryId: string): Promise<{ success: boolean; message?: string }> {
    const response = await axiosInstance.delete(`/subcategories/${subcategoryId}`);
    return response.data;
  }

  // Toggle subcategory status
  async toggleSubcategoryStatus(subcategoryId: string): Promise<SubcategoryResponse> {
    const response = await axiosInstance.patch<SubcategoryResponse>(
      `/subcategories/${subcategoryId}/toggle-status`
    );
    return response.data;
  }

  // Get subcategories by category
  async getSubcategoriesByCategory(
    categoryId: string,
    filters?: SubcategoryFilters
  ): Promise<SubcategoriesListResponse> {
    const params = new URLSearchParams();
    params.append('category', categoryId);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'category') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<SubcategoriesListResponse>('/subcategories', {
      params,
    });
    return response.data;
  }

  // Get subcategory statistics
  async getSubcategoryStats() {
    const response = await axiosInstance.get('/subcategories/stats');
    return response.data;
  }

  // Get available subcategories (subcategories with active products)
  async getAvailableSubcategories(categoryId?: string): Promise<SubcategoriesListResponse> {
    const params = new URLSearchParams();
    if (categoryId) {
      params.append('categoryId', categoryId);
    }
    const response = await axiosInstance.get<SubcategoriesListResponse>(
      '/subcategories/available',
      { params }
    );
    return response.data;
  }
}

export const subcategoryService = new SubcategoryService();
