import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { LoginFormData } from '../schemas/authSchemas';
import useAuthStore from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { USER_QUERY_KEY } from './useUserQuery';
import { adminAuthService } from '../services/adminAuthService';

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

      navigate('/admin/dashboard');
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
    mutationFn: (email: string) => adminAuthService.forgotPassword(email),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset link sent to your email!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(message);
      console.error('Forgot password error:', error);
    },
  });
}

export function useResetPasswordMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      adminAuthService.resetPassword(token, password),
    onSuccess: (response) => {
      toast.success(response.message || 'Password reset successfully!');
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(message);
      console.error('Reset password error:', error);
    },
  });
}
