import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface BuyerOrPublicRouteProps {
  redirectTo?: string;
}

export function BuyerOrPublicRoute({ redirectTo = '/' }: BuyerOrPublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access if:
  // 1. User is not authenticated (public access)
  // 2. User is authenticated and has 'buyer' role
  if (!isAuthenticated || user?.role === 'buyer') {
    return <Outlet />;
  }

  // Redirect authenticated non-buyers to their appropriate dashboard
  if (user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  if (user?.role === 'driver') {
    return <Navigate to="/driver/dashboard" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Fallback redirect
  return <Navigate to={redirectTo} replace />;
}
