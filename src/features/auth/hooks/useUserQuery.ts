import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { User } from '@/stores/authStore';

export const USER_QUERY_KEY = ['user', 'me'];

export interface ApiUser {
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
  isVerified?: boolean;
  localDelivery?: boolean;
  einNumber?: string;
  salesTaxId?: string;
  createdAt?: string;
  updatedAt?: string;
  region?: string;
  address?: string;
  description?: string;
  avatar?: string;
}

export const transformApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id || apiUser._id || '',
    email: apiUser.email,
    avatar: apiUser.avatar,
    displayName: apiUser.displayName || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email,
    role: (apiUser.role || apiUser.accountType || 'seller') as 'driver' | 'seller' | 'admin' | 'buyer',
    isVerified: apiUser.isVerified || false,
    firstName: apiUser.firstName || '',
    lastName: apiUser.lastName || '',
    company: apiUser.businessName || '',
    region: apiUser.region || '',
    address: apiUser.businessAddress || apiUser.address || '',
    description: apiUser.description || '',
    phone: apiUser.phone,
    createdAt: apiUser.createdAt || new Date().toISOString(),
  };
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return null;
      }

      // For development/testing purposes, check if it's a mock token
      if (token.startsWith('mock_access_token_')) {
        // Return a mock user for development
        const mockUser: User = {
          id: '1',
          email: 'zimmCorp@gmail.com',
          displayName: 'Smith',
          role: 'seller',
          avatar: undefined,
          phone: undefined,
          isVerified: true,
          createdAt: new Date().toISOString(),
          firstName: 'Smith',
          lastName: 'Smith',
          company: 'Smith',
          region: 'Smith',
          address: 'Smith',
          description: 'Smith',
        };
        return mockUser;
      }

      try {
        const response = await authService.getProfile();
        
        if (response.data && response.data.user) {
          return transformApiUserToUser(response.data.user as ApiUser);
        }
        
        return null;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};