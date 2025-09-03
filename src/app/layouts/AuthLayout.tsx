import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function AuthLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Allow authenticated drivers to access vehicle-information page
  if (user) {
    // If user is on vehicle-information page, allow them to stay
    if (location.pathname === '/auth/vehicle-information') {
      // Only allow drivers on this page
      if (user.role === 'driver') {
        return (
          <div className="min-h-screen flex items-center">
            <ScrollToTop />
            <div className=" w-full space-y-8">
              <Outlet />
            </div>
          </div>
        );
      }
    }

    // Otherwise redirect based on role
    return <Navigate to={user.role !== 'buyer' ? `/${user.role}/dashboard` : '/'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center">
      <ScrollToTop />
      <div className=" w-full space-y-8">
        <Outlet />
      </div>
    </div>
  );
}
