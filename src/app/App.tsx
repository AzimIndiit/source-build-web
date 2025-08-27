import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Providers } from './providers';
import { router } from './routes/router';
import { RouterErrorBoundary } from '@/features/error/pages/RouterErrorBoundary';

function ErrorFallback() {
  return <RouterErrorBoundary />;
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}
