import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function AuthLayout() {
  const { user } = useAuth();
  const location = useLocation();
  console.log('user', user);
  // Allow authenticated drivers to access vehicle-information and driver-license pages
  if (user) {
    // Special handling for drivers - force onboarding completion
    if (user.role === 'driver') {
      const hasVehicles = (user as any)?.isVehicles || (user as any)?.profile?.isVehicles;
      const hasLicense = (user as any)?.isLicense || (user as any)?.profile?.isLicense;

      // Priority 1: Complete vehicle information first
      if (!hasVehicles) {
        // Force redirect to vehicle-information page
        if (location.pathname !== '/auth/vehicle-information') {
          return <Navigate to="/auth/vehicle-information" replace />;
        }
        // Allow them to stay on vehicle-information page
        return (
          <div className="min-h-screen flex items-center">
            <ScrollToTop />
            <div className=" w-full space-y-8">
              <Outlet />
            </div>
          </div>
        );
      }

      // Priority 2: Complete license information after vehicle
      if (!hasLicense) {
        // Force redirect to driver-license page
        if (
          location.pathname !== '/auth/driver-license' &&
          location.pathname !== '/auth/driving-license'
        ) {
          return <Navigate to="/auth/driver-license" replace />;
        }
        // Allow them to stay on driver-license page
        return (
          <div className="min-h-screen flex items-center">
            <ScrollToTop />
            <div className=" w-full space-y-8">
              <Outlet />
            </div>
          </div>
        );
      }

      // Both completed - redirect away from auth pages to dashboard
      if (location.pathname.startsWith('/auth/')) {
        return <Navigate to="/driver/dashboard" replace />;
      }
    }

    // For non-drivers, redirect away from driver-specific auth pages
    if (
      location.pathname === '/auth/vehicle-information' ||
      location.pathname === '/auth/driver-license' ||
      location.pathname === '/auth/driving-license'
    ) {
      return <Navigate to={user.role !== 'buyer' ? `/${user.role}/dashboard` : '/'} replace />;
    }

    // Otherwise redirect based on role for other auth pages
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
