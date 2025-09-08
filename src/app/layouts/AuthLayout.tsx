import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function AuthLayout() {
  const { user } = useAuth();
  const location = useLocation();
 console.log('user', user)
  // Allow authenticated drivers to access vehicle-information and driver-license pages
  if (user) {
    // If user is on vehicle-information or driver-license page, allow them to stay
    if (location.pathname === '/auth/vehicle-information' || location.pathname === '/auth/driver-license' || location.pathname === '/auth/driving-license') {
      // Only allow drivers on these pages
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
