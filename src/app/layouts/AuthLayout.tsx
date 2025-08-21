import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center">
      <div className=" w-full space-y-8">
        <Outlet />
      </div>
    </div>
  );
}