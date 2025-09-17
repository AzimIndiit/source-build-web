import axiosInstance from '@/lib/axios';
import type {  LoginFormData } from '../schemas/authSchemas';
import type {
  SignupPayload,
  RegisterResponse,
  LoginResponse,

  ForgotPasswordResponse,
  VerifyResetTokenResponse,
  ResetPasswordResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ProfileResponse,
  LogoutResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../types/auth.types';

class AdminAuthService {
  /**
   * Login user
   */
  async login(data: LoginFormData): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post<LogoutResponse>('/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      {
        email,
      }
    );
    return response.data;
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
    const response = await axiosInstance.post<VerifyResetTokenResponse>(
      '/auth/verify-reset-token',
      { token }
    );
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    const response = await axiosInstance.post<ResetPasswordResponse>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenPayload = { refreshToken };
    const response = await axiosInstance.post<RefreshTokenResponse>('/admin/auth/refresh', payload);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    // Try the me endpoint first, then fallback to profile
    try {
      const response = await axiosInstance.get<ProfileResponse>('/auth/me');
      return response.data;
    } catch (error) {
      // Fallback to profile endpoint if me doesn't exist
      const response = await axiosInstance.get<ProfileResponse>('/user/profile');
      return response.data;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await axiosInstance.post<ChangePasswordResponse>(
      '/auth/change-password',
      data
    );
    return response.data;
  }
}

export const adminAuthService = new AdminAuthService();

// Export types for external use
export type {
  SignupPayload,
  RegisterResponse,
  LoginResponse,
  ForgotPasswordResponse,
  VerifyResetTokenResponse,
  ResetPasswordResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ProfileResponse,
  LogoutResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
};
