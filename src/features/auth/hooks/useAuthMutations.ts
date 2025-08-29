import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, ResendOtpPayload, SignupPayload } from '../services/authService';
import type { LoginFormData } from '../schemas/authSchemas';
import useAuthStore from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { USER_QUERY_KEY } from './useUserQuery';

export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupPayload) => authService.signup(data),
    onSuccess: async (response) => {
      // Store email for OTP verification
      if (response.data.user.email) {
        sessionStorage.setItem('signup_email', response.data.user.email);
        
        // Create OTP for the registered user
        try {
          await authService.createOtp({ 
            email: response.data.user.email,
            type: 'UR' 
          });
          
          // Store the timestamp for OTP resend cooldown
          localStorage.setItem('otp_resend_timestamp', Date.now().toString());
          
          toast.success('OTP sent to your email successfully!');
        } catch (error) {
          console.error('Failed to send OTP:', error);
          // Still navigate to OTP page even if OTP creation fails
          // User can use the resend button
        }
      }
      
     
      // Navigate to OTP verification
      navigate('/auth/verify-otp');
    },
    onError: (error: any) => {
      let message = 'Failed to create account. Please try again.';
      
      if (error.response) {
        message = error.response.data?.message || error.response.data?.error?.message || message;
      } else if (error.request) {
        message = 'No response from server. Please check your connection.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      console.error('Signup error:', error);
    },
  });
}

export function useLoginMutation() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Use the store's login method which handles everything including /me call
      await login(data.email, data.password);
      
      // Get the user from store after login
      const currentUser = useAuthStore.getState().user;
      return { user: currentUser };
    },
    onSuccess: (response) => {
      const user = response.user;
      
      if (!user) {
        toast.error('Failed to fetch user information');
        return;
      }
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Show success message
      toast.success('Login successful!');
      
      // Navigate based on user role
      if (user.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else if (user.role === 'buyer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      // Extract error message from different possible locations
      let message = 'Invalid email or password';
      
      if (error.response) {
        // Axios error with response from server
        message = error.response.data?.message || error.response.data?.error?.message || message;
      } else if (error.request) {
        // Request was made but no response received
        message = 'No response from server. Please check your connection.';
      } else if (error.message) {
        // Something else happened
        message = error.message;
      }
      
      toast.error(message);
      console.error('Login error:', error);
    },
  });
}

export function useVerifyOtpMutation() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, checkAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: { email: string; otp: string ,type:string}) => authService.verifyOtp(data),
    onSuccess: async (response) => {
      
      // Store tokens
      console.log('response.data', response.data)
      if (response.data.tokens) {
        // Handle both camelCase and snake_case token keys
        const accessToken = response.data.tokens.accessToken || response.data.tokens.access_token;
        const refreshToken = response.data.tokens.refreshToken || response.data.tokens.refresh_token;
        
        if (accessToken && refreshToken) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
      }
      
      // Check if user data is in the response
      if (response.data.user) {
        const profile = response.data.user;
        
        // Transform the profile to match the User type in authStore
        const user = {
          id: profile.id || profile._id || '',
          email: profile.email,
          displayName: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
          role: (profile.role || profile.accountType || 'seller') as 'driver' | 'seller' | 'admin' | 'buyer',
          isVerified: true, // Set to true since OTP is verified
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          company: profile.businessName || '',
          region: '',
          address: profile.businessAddress || '',
          description: '',
          phone: profile.phone || '',
          createdAt: profile.createdAt || new Date().toISOString(),
        };
        
        // Store user
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Clear signup email from session
        sessionStorage.removeItem('signup_email');
        
        // Clear OTP resend timestamp
        localStorage.removeItem('otp_resend_timestamp');
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        toast.success(response.message || 'Email verified successfully!');
        
        // Navigate based on user role
        if (user.role !=='buyer') {
          navigate(`/${user.role}/dashboard`);
        }
        else {
          navigate('/');
        }
      } else {
        // If no user data in response, call checkAuth to fetch and set user
        try {
          // Clear signup email from session
          sessionStorage.removeItem('signup_email');
          // Clear OTP resend timestamp
          localStorage.removeItem('otp_resend_timestamp');
          
          // Call checkAuth to fetch user profile and set state properly
          await checkAuth();
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['user'] });
          
          toast.success(response.message || 'Email verified successfully!');
          
          // Get the user from store after checkAuth
          const currentUser = useAuthStore.getState().user;
          
          // Navigate based on user role
          if (currentUser) {
            if (currentUser.role !== 'buyer') {
              navigate(`/${currentUser.role}/dashboard`);
            } else {
              navigate('/');
            }
          } else {
            // Fallback navigation if user is not set
            navigate('/');
          }
        } catch (error) {
          console.error('Failed to fetch profile after verification:', error);
          // Still navigate even if profile fetch fails
          toast.success(response.message || 'Email verified successfully!');
          navigate('/');
        }
      }
    },
    onError: (error: any) => {
      let message = 'Invalid OTP. Please try again.';
      
      if (error.response) {
        message = error.response.data?.message || error.response.data?.error?.message || message;
      } else if (error.request) {
        message = 'No response from server. Please check your connection.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      console.error('OTP verification error:', error);
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (data: ResendOtpPayload) => authService.resendOtp(data),
    onSuccess: (response) => {
      toast.success(response.message || 'OTP resent successfully!');
    },
    onError: (error: any) => {
      let message = 'Failed to resend OTP. Please try again.';
      
      if (error.response) {
        message = error.response.data?.message || error.response.data?.error?.message || message;
      } else if (error.request) {
        message = 'No response from server. Please check your connection.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      console.error('Resend OTP error:', error);
    },
  });
}

export function useLogoutMutation() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Use the store's logout method which handles everything
      await logout();
    },
    onSuccess: () => {
      // Navigate to login
      navigate('/auth/login');
      
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Even if logout fails, we still want to navigate
      console.error('Logout error:', error);
      
      // Navigate to login
      navigate('/auth/login');
      
      toast.success('Logged out successfully');
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset link sent to your email!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(message);
      console.error('Forgot password error:', error);
    },
  });
}

export function useResetPasswordMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => 
      authService.resetPassword(token, password),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset successfully!');
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(message);
      console.error('Reset password error:', error);
    },
  });
}