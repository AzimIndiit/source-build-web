import { ReactNode } from 'react';
import { useCartSync } from '@/hooks/useCartSync';

interface CartSyncProviderProps {
  children: ReactNode;
}

export function CartSyncProvider({ children }: CartSyncProviderProps) {
  // This hook will sync cart when auth state changes
  useCartSync();

  return <>{children}</>;
}
