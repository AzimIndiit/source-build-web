import type { BaseApiResponse, User, AuthTokens } from '@/types/api.types';
import type { SignupFormData, LoginFormData } from '../schemas/authSchemas';

/**
 * Signup payload sent to backend
 */
export interface SignupPayload extends SignupFormData {
  localDelivery: string;
  role: string;
}

/**
 * Auth responses
 */
export type RegisterResponse = BaseApiResponse<{
  user: User;
  tokens: AuthTokens;
  otpSent?: boolean;
}>;

export type LoginResponse = BaseApiResponse<{
  user: User;
  tokens: AuthTokens;
}>;

export type VerifyOtpResponse = BaseApiResponse<{
  user: User;
  tokens: AuthTokens;
}>;

export type ResendOtpResponse = BaseApiResponse<{
  otpSent: boolean;
  expiresIn?: number;
}>;

export type CreateOtpResponse = BaseApiResponse<{
  otpSent: boolean;
  expiresIn: number;
}>;

export type ForgotPasswordResponse = BaseApiResponse<{
  resetToken?: string; // Only in development mode
}>;

export type VerifyResetTokenResponse = BaseApiResponse<{
  valid: boolean;
}>;

export type ResetPasswordResponse = BaseApiResponse<null>;

export type RefreshTokenResponse = BaseApiResponse<{
  tokens: AuthTokens;
}>;

export type ProfileResponse = BaseApiResponse<{
  user: User;
}>;

export type LogoutResponse = BaseApiResponse<null>;

export type ChangePasswordResponse = BaseApiResponse<null>;

/**
 * Request payloads
 */
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
  type: string;
}

export interface CreateOtpPayload {
  email: string;
  type?: 'UR' | 'FP' | 'UU' | 'RP';
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
