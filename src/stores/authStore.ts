import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '@/lib/axios';
import socketService from '@/lib/socketService';
import {
  USER_QUERY_KEY,
  transformApiUserToUser,
  type ApiUser,
} from '@/features/auth/hooks/useUserQuery';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'driver' | 'seller' | 'admin' | 'buyer';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
  company: string;
  region: string;
  address: string;
  description: string;
  currentLocationId?: string;
  currentLocation?: any;
  authType?: string;
  profile?: {
    isVehicles?: boolean;
    isLicense?: boolean;
  };
}

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface SignupData {
  email: string;
  password: string;
  displayName: string;
  role: 'driver' | 'seller';
  phone?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentLocation: LocationData | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentLocation: (location: LocationData | null) => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      currentLocation: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        // Set current location from user data if available
        if (user && user.currentLocation) {
          const location = user.currentLocation;
          set({
            currentLocation: {
              address: location.address || '',
              city: location.city || '',
              state: location.state || '',
              country: location.country || '',
              zipCode: location.zipCode || '',
              lat: location.latitude || 0,
              lng: location.longitude || 0,
              formattedAddress: location.formattedAddress || '',
            },
          });
        }

        // Handle socket connection
        if (user) {
          socketService.connect(user.id);

          // Check if driver needs to complete onboarding
          if (user.role === 'driver') {
            // Check both direct properties and profile properties
            const hasVehicles = (user as any)?.isVehicles || user.profile?.isVehicles;
            const hasLicense = (user as any)?.isLicense || user.profile?.isLicense;

            console.log('Driver onboarding check:', { hasVehicles, hasLicense });

            // Delay navigation slightly to ensure React Router is ready
            setTimeout(() => {
              // Priority 1: Complete vehicle information first
              if (!hasVehicles) {
                console.log('Redirecting to vehicle information page');
                if (window.location.pathname !== '/auth/vehicle-information') {
                  window.location.href = '/auth/vehicle-information';
                }
              }
              // Priority 2: Complete license information after vehicle
              else if (!hasLicense) {
                console.log('Redirecting to driver license page');
                if (
                  window.location.pathname !== '/auth/driver-license' &&
                  window.location.pathname !== '/auth/driving-license'
                ) {
                  window.location.href = '/auth/driver-license';
                }
              }
            }, 100);
          }
        } else {
          socketService.disconnect();
        }
      },

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setLoading: (loading) => set({ isLoading: loading }),

      setCurrentLocation: (location) => set({ currentLocation: location }),

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            set({ isLoading: false, user: null, isAuthenticated: false });
            return;
          }

          // For development/testing purposes, check if it's a mock token
          if (token.startsWith('mock_access_token_')) {
            // Create a mock user for development
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
              currentLocationId: '1',
              currentLocation: {
                address: 'Smith',
                city: 'Smith',
                state: 'Smith',
                country: 'Smith',
                zipCode: 'Smith',
                lat: 0,
                lng: 0,
                formattedAddress: 'Smith',
              },
              authType: 'email',
            };

            get().setUser(mockUser);
            set({ isLoading: false });
            return;
          }

          // Use the query client to fetch user data
          const { queryClient } = await import('@/lib/queryClient');

          try {
            get().setLoading(true);
            // Fetch user data using the query client
            const user = await queryClient.fetchQuery({
              queryKey: USER_QUERY_KEY,
              queryFn: async () => {
                const response = await axiosInstance.get('/auth/me');

                if (response.data && response.data.data && response.data.data.user) {
                  const apiUser = response.data.data.user as ApiUser;
                  return transformApiUserToUser(apiUser);
                }
                get().setLoading(true);
                throw new Error('Invalid user data from API');
              },
            });

            if (user) {
              console.log('user', user);
              get().setUser(user);
            } else {
              throw new Error('No user data received');
            }
          } catch (error) {
            // If query fails, clear the cache and auth
            queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
            throw error;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          console.log('AuthStore: Starting login process');

          // Call the actual API
          const response = await axiosInstance.post('/auth/login', {
            email,
            password,
          });

          console.log('AuthStore: API response received', response);

          // Extract tokens from response
          const { tokens } = response.data.data;

          // Store tokens - handle both naming conventions
          const accessToken = tokens.access_token || tokens.accessToken;
          const refreshToken = tokens.refresh_token || tokens.refreshToken;

          if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
          }

          // Now fetch the complete user profile from /me endpoint
          console.log('AuthStore: Fetching user profile from /me');
          const { queryClient } = await import('@/lib/queryClient');

          try {
            const user = await queryClient.fetchQuery({
              queryKey: USER_QUERY_KEY,
              queryFn: async () => {
                const meResponse = await axiosInstance.get('/auth/me');

                if (meResponse.data && meResponse.data.data && meResponse.data.data.user) {
                  const apiUser = meResponse.data.data.user as ApiUser;
                  return transformApiUserToUser(apiUser);
                }

                throw new Error('Invalid user data from /me API');
              },
            });

            if (user) {
              console.log('AuthStore: User profile fetched', user);
              get().setUser(user);

              // Check if driver needs onboarding after login
              if (user.role === 'driver') {
                const hasVehicles = (user as any)?.isVehicles || (user as any)?.profile?.isVehicles;
                const hasLicense = (user as any)?.isLicense || (user as any)?.profile?.isLicense;

                // Return early to let setUser handle the navigation
                // This ensures the navigation happens after state is updated
                return;
              }
            } else {
              throw new Error('No user data received from /me');
            }
          } catch (meError) {
            console.error(
              'AuthStore: Failed to fetch user from /me, using login response',
              meError
            );
            // Fallback to using the user from login response if /me fails
            if (response.data.data.user) {
              const transformedUser = transformApiUserToUser(response.data.data.user as ApiUser);
              get().setUser(transformedUser);
            } else {
              throw meError;
            }
          }

          console.log('AuthStore: Login process completed');
        } catch (error) {
          console.error('AuthStore: Login error:', error);
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        try {
          const response = await axiosInstance.post('/auth/signup', data);
          const { user, access_token, refresh_token } = response.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          get().setUser(user);
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API to invalidate tokens on server
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with local cleanup even if API call fails
        } finally {
          // Clear all auth-related state
          get().clearAuth();

          // Clear query cache
          const { queryClient } = await import('@/lib/queryClient');
          queryClient.clear();
          queryClient.removeQueries({ queryKey: USER_QUERY_KEY });

          // Clear all localStorage items
          localStorage.clear();

          // Clear all sessionStorage items
          sessionStorage.clear();

          // Optionally, keep only non-auth related items if needed
          // For example, theme preferences:
          // const theme = localStorage.getItem('source-build-theme');
          // localStorage.clear();
          // if (theme) localStorage.setItem('source-build-theme', theme);
        }
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      clearAuth: () => {
        // Disconnect socket
        socketService.disconnect();

        // Clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Clear user data from localStorage
        localStorage.removeItem('user');

        // Clear auth storage (Zustand persist)
        localStorage.removeItem('auth-storage');

        // Clear any session storage items
        sessionStorage.removeItem('signup_email');
        sessionStorage.removeItem('otp_resend_timestamp');

        // Clear state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Only persist user, isAuthenticated, and currentLocation, not isLoading
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentLocation: state.currentLocation,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if the stored auth is still valid
        if (state) {
          console.log('Auth store rehydrated, checking auth validity...');
          // Set loading to false after rehydration
          state.setLoading(false);
          // Reconnect socket if user exists
          if (state.user) {
            socketService.connect(state.user.id);
          }
        }
      },
    }
  )
);

export { useAuthStore };
export default useAuthStore;
