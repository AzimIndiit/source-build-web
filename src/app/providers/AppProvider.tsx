import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from '@/features/error/pages/ErrorBoundary';
import SuspenseLoader from '@/components/common/SuspenseLoader';

interface AppProviderProps {
  router: any;
  children?: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ router, children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseLoader fullScreen message="Loading application..." />}>
        {router ? <RouterProvider router={router} /> : children}
      </Suspense>
    </ErrorBoundary>
  );
};
