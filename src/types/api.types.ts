/**
 * Base API Response structure matching backend ApiResponse class
 */
export interface BaseApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  errors?: any[];
}

/**
 * User model matching backend IUser
 */
export interface User {
  _id: string;
  id?: string; // Frontend often uses id instead of _id
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'driver' | 'admin';
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  isVerified?: boolean; // Alias for isEmailVerified
  authType: 'email' | 'google';
  termsAccepted: boolean;
  phone?: string; // Direct phone property
  businessName?: string; // Direct business name property
  businessAddress?: string; // Direct business address property
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile types for different roles
 */
export interface BuyerProfile {
  phone?: string;
  cellPhone?: string;
  addresses?: Address[];
}

export interface SellerProfile {
  phone: string;
  cellPhone?: string;
  businessName: string;
  einNumber: string;
  salesTaxId: string;
  businessAddress?: string;
  localDelivery: boolean;
  addresses?: Address[];
}

export interface DriverProfile {
  phone: string;
  cellPhone?: string;
  driverLicense: {
    number: string;
    licenceImages: string[];
    verified: boolean;
  };
  vehicles?: Vehicle[];
  addresses?: Address[];
}

export type UserProfile = BuyerProfile | SellerProfile | DriverProfile;

/**
 * Address type
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

/**
 * Vehicle type for drivers
 */
export interface Vehicle {
  make: string;
  model: string;
  vehicleImages: string[];
  insuranceImages: string[];
  registrationNumber: string;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
