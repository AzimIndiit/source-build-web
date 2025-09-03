import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { authService } from '../services';
import { ApiUser, transformApiUserToUser } from '../hooks/useUserQuery';

const AuthRedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const params = new URLSearchParams(location.search);
        console.log('URL params:', params.toString());

        // Get tokens from URL params - note the different parameter names
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const needsAdditionalInfo = params.get('needsAdditionalInfo');

        if (!accessToken) {
          console.error('No access token found in URL');
          navigate('/auth/login', { replace: true });
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Check if additional info is needed
        if (needsAdditionalInfo === 'true') {
          // Redirect to complete profile page
          navigate('/auth/complete-profile', { replace: true });
          return;
        }

        let transformedUser: ReturnType<typeof transformApiUserToUser> | null = null;

        try {
          const response = await authService.getProfile();

          if (response.data && response.data.user) {
            transformedUser = transformApiUserToUser(response.data.user as ApiUser);
            if (transformedUser) {
              updateUser(transformedUser);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          throw error;
        }
        if (!transformedUser) return;
        // Navigate based on role
        if (transformedUser?.role === 'seller') {
          navigate('/seller/dashboard', { replace: true });
        } else if (transformedUser?.role === 'driver') {
          const isVehicles = transformedUser?.profile?.isVehicles;
          const isLicense = transformedUser?.profile?.isLicense;

          if (!isVehicles) {
            navigate('/vehicle-information', { replace: true });
          } else if (!isLicense) {
            navigate('/driving-license', { replace: true });
          } else {
            navigate('/driver/dashboard', { replace: true });
          }
        } else if (transformedUser?.role === 'buyer') {
          navigate('/', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Clear any stored tokens on error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/auth/login', { replace: true });
      }
    };

    fetchProfile();
  }, [location.search, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthRedirectPage;
