import axiosInstance from '@/lib/axios';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  company?: string;
  region?: string;
  address?: string;
  description?: string;
  avatar?: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      displayName?: string;
      role: string;
      isVerified: boolean;
      company?: string;
      region?: string;
      address?: string;
      description?: string;
      avatar?: string;
      phone?: string;
      businessName?: string;
      businessAddress?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

class ProfileService {
  async updateProfile(data: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    const response = await axiosInstance.put<UpdateProfileResponse>('/user/profile', data);
    return response.data;
  }

  async getProfile(): Promise<UpdateProfileResponse> {
    const response = await axiosInstance.get<UpdateProfileResponse>('/auth/me');
    return response.data;
  }

  async changePassword(data: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await axiosInstance.post<ChangePasswordResponse>(
      '/auth/change-password',
      data
    );
    return response.data;
  }
}

export const profileService = new ProfileService();
