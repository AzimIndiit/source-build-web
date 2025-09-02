import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { profileService, ChangePasswordPayload } from '../services/profileService';

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => profileService.changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      console.error('Change password error:', error);
    },
  });
}
