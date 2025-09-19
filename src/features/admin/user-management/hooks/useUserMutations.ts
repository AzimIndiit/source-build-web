import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userService, UserFilters } from '../services/userService';
import { queryClient } from '@/lib/queryClient';

// User role enum to match backend
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

// User interface to match backend structure
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  authType: string;
  stripeCustomerId?: string;
  currentLocationId?: string;
  currentLocation?: any;
  profile?: any;
  status: string;
}

// Formatted user response interface
export interface FormattedUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  accountType: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  currentLocationId?: string;
  currentLocation?: any;
  authType: string;
  stripeCustomerId?: string;
  // Role-specific fields
  phone?: string;
  businessName?: string;
  businessAddress?: string;
  cellPhone?: string;
  localDelivery?: boolean;
  einNumber?: string;
  salesTaxId?: string;
  region?: string;
  address?: string;
  description?: string;
  isVehicles?: boolean;
  isLicense?: boolean;
  department?: string;
  adminLevel?: string;
  lastLoginIP?: string;
  twoFactorEnabled?: boolean;
  status: string;
}

/**
 * Formats user data based on their role, similar to backend formatUserResponse
 * @param user - Raw user data from API
 * @returns Formatted user response with role-specific fields
 */
export const formatUserResponse = (user: IUser): FormattedUserResponse => {
  const userProfile = user.profile as any;

  // Base fields common to all users
  const baseResponse: FormattedUserResponse = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    role: user.role,
    accountType: user.role, // For compatibility
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    avatar: userProfile?.avatar,
    currentLocationId: user.currentLocationId,
    currentLocation: user.currentLocation || null, // Include populated location
    authType: user.authType,
    stripeCustomerId: user.stripeCustomerId,
    status: user.status,
  };

  // Add role-specific fields based on user role
  switch (user.role) {
    case UserRole.SELLER:
      return {
        ...baseResponse,
        phone: userProfile?.phone,
        businessName: userProfile?.businessName,
        businessAddress: userProfile?.businessAddress || userProfile?.address,
        cellPhone: userProfile?.cellPhone,
        localDelivery: userProfile?.localDelivery,
        einNumber: userProfile?.einNumber,
        salesTaxId: userProfile?.salesTaxId,
        region: userProfile?.region,
        address: userProfile?.address,
        description: userProfile?.description,
      };

    case UserRole.DRIVER:
      return {
        ...baseResponse,
        phone: userProfile?.phone,
        address: userProfile?.address,
        isVehicles: userProfile?.isVehicles,
        isLicense: userProfile?.isLicense,
      };

    case UserRole.BUYER:
      return {
        ...baseResponse,
        address: userProfile?.address,
        region: userProfile?.region,
        description: userProfile?.description,
      };

    case UserRole.ADMIN:
      return {
        ...baseResponse,
        phone: user.phone,
        department: userProfile?.department,
        adminLevel: userProfile?.adminLevel,
        lastLoginIP: userProfile?.lastLoginIP,
        twoFactorEnabled: userProfile?.twoFactorEnabled || false,
      };

    default:
      // Fallback for any other roles
      return {
        ...baseResponse,
        phone: user.phone,
        address: userProfile?.address,
      };
  }
};

export const useUsersQuery = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const response = await userService.getUsers(filters);
      // Format each user response
      console.log('response', response)
      return  {
        users: response.data.map((user: any) => formatUserResponse(user)),
        pagination: response.meta.pagination,
        stats: response.meta.stats,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Block user mutation
export const useBlockUser = () => {
  
  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User blocked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to block user');
    },
  });
};

// Unblock user mutation
export const useUnblockUser = () => {
  
  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User unblocked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to unblock user');
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    },
  });
};

