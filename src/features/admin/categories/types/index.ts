export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | Category;
  image?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateSubcategoryDto {
  name: string;
  description?: string;
  category: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSubcategoryDto {
  name?: string;
  description?: string;
  category?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubcategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  meta: { pagination: PaginationMeta };
}

export interface SubcategoriesResponse {
  data: Subcategory[];
  meta: { pagination: PaginationMeta };
}

export interface SubcategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
