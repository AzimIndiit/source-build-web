import { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'driver' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: 'driver' | 'seller';
  phone?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // For development/testing purposes, check if it's a mock token
      if (token.startsWith('mock_access_token_')) {
        // Create a mock user for development
        const mockUser: User = {
          id: '1',
          email: 'zimmCorp@gmail.com',
          name: 'Smith',
          role: 'seller',
          avatar: undefined,
          phone: undefined,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setIsLoading(false);
        return;
      }

      // In production, this would call the actual API
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Starting login process');

      // For development/testing purposes, create a mock user
      // In production, this would call the actual API
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Smith',
        role: 'seller',
        avatar: undefined,
        phone: undefined,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      console.log('AuthProvider: Created mock user:', mockUser);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store mock tokens
      const mockAccessToken = 'mock_access_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_token_' + Date.now();

      localStorage.setItem('access_token', mockAccessToken);
      localStorage.setItem('refresh_token', mockRefreshToken);

      console.log('AuthProvider: Setting user state to:', mockUser);
      setUser(mockUser);

      console.log('AuthProvider: Login process completed');

      return mockUser;
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    const response = await axiosInstance.post('/auth/signup', data);
    const { user, access_token, refresh_token } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
