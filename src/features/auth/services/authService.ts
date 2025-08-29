import axiosInstance from '@/lib/axios';
import type { SignupFormData, LoginFormData } from '../schemas/authSchemas';

export interface SignupPayload extends SignupFormData {
  localDelivery: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      businessName: string;
      accountType: string;
      phone: string;
      cellPhone?: string;
      einNumber: string;
      salesTaxId: string;
      localDelivery: boolean;
      isVerified: boolean;
      createdAt: string;
    };
    tokens?: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      accountType: string;
      isVerified: boolean;
    };
    tokens: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id?: string;
      _id?: string;
      email: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
      businessName?: string;
      businessAddress?: string;
      phone?: string;
      cellPhone?: string;
      role?: string;
      accountType?: string;
      isVerified: boolean;
      localDelivery?: boolean;
      einNumber?: string;
      salesTaxId?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    tokens: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

export interface ResendOtpPayload {
  email: string;
  type: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export interface CreateOtpPayload {
  email: string;
  type?:  'UR' | 'FP' | 'UU' | 'RP'
}

export interface CreateOtpResponse {
  success: boolean;
  message: string;
  data?: {
    otpSent: boolean;
    expiresIn: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  cellPhone?: string;
  accountType: string;
  role: string;
  isVerified: boolean;
  localDelivery: boolean;
  einNumber: string;
  salesTaxId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
}

class AuthService {
  async signup(data: SignupPayload): Promise<AuthResponse> {

    const payload = {
      ...data,
      localDelivery: data.localDelivery === 'yes',
      role: data.accountType, // Map accountType to role for backend
    };
    
    const response = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    return response.data;
  }

  async login(data: LoginFormData): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async verifyOtp(data: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    const response = await axiosInstance.post<VerifyOtpResponse>('/otp/verify', data);
    return response.data;
  }

  async resendOtp(data: ResendOtpPayload): Promise<ResendOtpResponse> {
    const response = await axiosInstance.post<ResendOtpResponse>('/otp/resend', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  }

  async verifyResetToken(token: string): Promise<{ success: boolean; message: string; valid?: boolean }> {
    const response = await axiosInstance.post('/auth/verify-reset-token', { token });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await axiosInstance.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  async createOtp(data: CreateOtpPayload): Promise<CreateOtpResponse> {
    const response = await axiosInstance.post<CreateOtpResponse>('/otp/create', data);
    return response.data;
  }



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
}

export const authService = new AuthService();