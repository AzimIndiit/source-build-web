import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ allowedRoles = [], redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication');
  console.log('ProtectedRoute: User:', user);
  console.log('ProtectedRoute: IsLoading:', isLoading);
  console.log('ProtectedRoute: AllowedRoles:', allowedRoles);
  console.log('ProtectedRoute: RedirectTo:', redirectTo);
  console.log('ProtectedRoute: Current location:', location.pathname);

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute: Authentication successful, rendering protected content');
  return <Outlet />;
}
