import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthWrapper } from '../components/AuthWrapper';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { useAuth } from '@/hooks/useAuth';
import { RoleSelectionModal } from '../components/RoleSelectionModal';
import { authService } from '../services/authService';
import useAuthStore from '@/stores/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '', // Default password for testing
    },
  });

  const { handleSubmit } = methods;

  // Check for content parameter in URL (new Google user without role)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const content = params.get('content');
    console.log('cont', content);
    if (content) {
      setPendingUserId(content);
      setShowRoleModal(true);
    }
  }, [location.search]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Login data:', data);
      console.log('Starting login process...');

      // Call the actual login function from AuthProvider
      await login(data.email, data.password);

      // Show success toast

      // Get the user from the store after login
      const currentUser = useAuthStore.getState().user;

      // Handle navigation based on user role and status
      if (currentUser) {
        if (currentUser.role === 'driver') {
          // Check driver's vehicle and license status
          const hasVehicles = (currentUser as any).isVehicles || false;
          const hasLicense = (currentUser as any).isLicense || false;

          console.log('Driver login - hasVehicles:', hasVehicles, 'hasLicense:', hasLicense);

          if (!hasVehicles) {
            navigate('/auth/vehicle-information');
            toast.error('Please upload your vehicle information!', {
              icon: '⚠️',
              style: {
                background: '#FEF8C6',
                color: '#000',
                border: '1px solid #FCE992',
              },
            });
          } else if (!hasLicense) {
            navigate('/auth/driver-license');
            toast.error('Please upload your driving license!', {
              icon: '⚠️',
              style: {
                background: '#FEF8C6',
                color: '#000',
                border: '1px solid #FCE992',
              },
            });
          } else {
            navigate('/driver/dashboard');
            toast.success('Login successful!');
          }
        } else if (currentUser.role === 'seller') {
          navigate('/seller/dashboard');
          toast.success('Login successful!');
        } else {
          navigate('/');
          toast.success('Login successful!');
        }
      } else {
        // Default navigation if user is not available
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Check if the error is due to unverified account
      if (error.response?.data?.message === 'Account is not verified') {
        // Store email in session storage for OTP verification
        sessionStorage.setItem('signup_email', data.email);

        // Show warning toast
        toast('Your account is not verified. Sending OTP to your email...', {
          icon: '⚠️',
          style: {
            background: '#FEF8C6',
            color: '#000',
            border: '1px solid #FCE992',
          },
        });

        // Create OTP for the user
        try {
          await authService.createOtp({
            email: data.email,
            type: 'UR', // User Registration type
          });

          // Store the timestamp for OTP resend cooldown
          localStorage.setItem('otp_resend_timestamp', Date.now().toString());

          toast.success('OTP sent to your email successfully!');

          // Navigate to OTP verification page
          navigate('/auth/verify-otp');
        } catch (otpError: any) {
          console.error('Failed to send OTP:', otpError);

          // Check if it's a rate limit error
          const errorMessage = otpError.response?.data?.message || '';
          if (errorMessage.includes('Please wait')) {
            // Extract the seconds from the error message
            const match = errorMessage.match(/(\d+) seconds/);
            const seconds = match ? match[1] : 'a few';

            toast(`Please wait ${seconds} seconds before requesting another OTP`, {
              icon: '⏰',
              style: {
                background: '#FEF8C6',
                color: '#000',
                border: '1px solid #FCE992',
              },
            });

            // Still navigate to OTP page where they can use the resend button after cooldown
            navigate('/auth/verify-otp');
          } else {
            // For other OTP errors
            toast.error('Failed to send OTP. You can resend it from the next page.');
            // Still navigate to OTP page even if OTP creation fails
            // User can use the resend button
            navigate('/auth/verify-otp');
          }
        }
      } else {
        // Show generic error for other cases
        toast.error(
          error.response?.data?.message || 'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // No need to send role parameter for login
    // Backend will check if user exists and handle accordingly
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
    const googleAuthUrl = `${apiBaseUrl}/auth/google`;

    // Redirect to backend Google OAuth endpoint
    window.location.href = googleAuthUrl;
  };

  return (
    <AuthWrapper>
      <RoleSelectionModal
        isOpen={showRoleModal}
        userId={pendingUserId}
        onClose={() => setShowRoleModal(false)}
      />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            className=" text-base px-4 border-gray-300"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="text-base px-4 border-gray-300"
          />

          <Button
            type="submit"
            className="w-full  bg-primary   hover:bg-primary/80 text-white font-medium text-base"
            loading={isLoading}
          >
            Login
          </Button>

          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full  flex justify-center items-center  border-gray-300 font-medium text-base"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue With Google
          </Button>

          <Button
            type="button"
            className="w-full  flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium text-base"
            onClick={() => navigate('/auth/signup')}
          >
            Create New Account
          </Button>
        </form>
      </FormProvider>
    </AuthWrapper>
  );
}

export default LoginPage;
