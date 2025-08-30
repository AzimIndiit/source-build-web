import { useEffect, ReactNode, createContext } from 'react';
import useAuthStore from '@/stores/authStore';

// Re-export types for backward compatibility
export type { User } from '@/stores/authStore';

// Deprecated: AuthContext is kept for backward compatibility but not used
// The actual auth state is managed by Zustand store
export const AuthContext = createContext<any>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that initializes authentication on mount.
 * The actual auth state is managed by Zustand store with persistence.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status on mount
    // This will validate the persisted auth state and reconnect socket if needed
    checkAuth();
  }, [checkAuth]);

  // Since we're using Zustand, we don't need Context.Provider
  // The store is globally accessible
  return <>{children}</>;
}
