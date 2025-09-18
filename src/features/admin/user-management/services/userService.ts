import axiosInstance from '@/lib/axios';
import { User } from '@/types/api.types';

export interface UserListResponse {
  success: boolean;
  message?: string;
  data: User[];
  meta: {
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    stats?: {
      total: number;
      active: number;
      inactive: number;
      pending: number;
      deleted: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface UserFilters {
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class UserService {
  // Get all orders with filters
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<UserListResponse>('/user', { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<OrderResponse> {
    const response = await axiosInstance.get<OrderResponse>(`/user/${userId}`);
    return response.data;
  }

  // Block user
  async blockUser(userId: string): Promise<OrderResponse> {
    const response = await axiosInstance.put<OrderResponse>(`/user/${userId}/block`);
    return response.data;
  }

  // Unblock user
  async unblockUser(userId: string): Promise<OrderResponse> {
    const response = await axiosInstance.put<OrderResponse>(`/user/${userId}/unblock`);
    return response.data;
  }

  // Delete user (soft delete)
  async deleteUser(userId: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string; data: any }>(`/user/${userId}`);
    return response.data;
  }

  // Restore deleted user
  async restoreUser(userId: string): Promise<OrderResponse> {
    const response = await axiosInstance.put<OrderResponse>(`/user/${userId}/restore`);
    return response.data;
  }
}

export const userService = new UserService();
