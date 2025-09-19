import axiosInstance from '@/lib/axios';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
  CategoriesResponse,
  PaginationMeta,
} from '../types';

export type { CategoryFilters };

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface CategoriesListResponse {
  success: boolean;
  message?: string;
  data: CategoriesResponse;
  meta: { pagination: PaginationMeta };
}

class CategoryService {
  // Get all categories with filters
  async getCategories(filters?: CategoryFilters): Promise<CategoriesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<CategoriesListResponse>('/categories', { params });
    return response.data;
  }

  // Get single category by ID
  async getCategoryById(categoryId: string): Promise<CategoryResponse> {
    const response = await axiosInstance.get<CategoryResponse>(`/categories/${categoryId}`);
    return response.data;
  }

  // Create new category
  async createCategory(data: CreateCategoryDto): Promise<CategoryResponse> {
    const response = await axiosInstance.post<CategoryResponse>('/categories', data);
    return response.data;
  }

  // Update category
  async updateCategory(categoryId: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    const response = await axiosInstance.put<CategoryResponse>(`/categories/${categoryId}`, data);
    return response.data;
  }

  // Delete category
  async deleteCategory(categoryId: string): Promise<{ success: boolean; message?: string }> {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response.data;
  }

  // Toggle category status
  async toggleCategoryStatus(categoryId: string): Promise<CategoryResponse> {
    const response = await axiosInstance.patch<CategoryResponse>(`/categories/${categoryId}/toggle-status`);
    return response.data;
  }

  // Get category statistics
  async getCategoryStats() {
    const response = await axiosInstance.get('/categories/stats');
    return response.data;
  }
}

export const categoryService = new CategoryService();
