import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { profileService, UpdateProfilePayload } from '../services/profileService';
import { fileService } from '../services/fileService';
import useAuthStore from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { USER_QUERY_KEY } from '@/features/auth/hooks/useUserQuery';

export function useUpdateProfileMutation() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfilePayload & { avatarFile?: File }) => {
      let avatarUrl = data.avatar;

      // If there's a new avatar file to upload
      if (data.avatarFile) {
        try {
          const uploadResponse = await fileService.uploadFile(data.avatarFile);
          avatarUrl = uploadResponse.data.url;
        } catch (error) {
          console.error('Failed to upload avatar:', error);
          toast.error('Failed to upload avatar image');
          throw error;
        }
      }

      // Remove the avatarFile from the payload
      const { avatarFile, ...profileData } = data;

      // Update profile with the avatar URL
      const updateData = {
        ...profileData,
        avatar: avatarUrl,
      };

      return await profileService.updateProfile(updateData);
    },
    onSuccess: (response) => {
      // Update local user state
      if (response.data?.user) {
        const user = response.data.user;
        updateUser({
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
          company: user.company || user.businessName || '',
          region: user.region || '',
          address: user.address || user.businessAddress || '',
          description: user.description || '',
          avatar: user.avatar,
        });
      }

      // Invalidate user and profile queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success(response.message || 'Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      console.error('Update profile error:', error);
    },
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFileUploadMutation() {
  return useMutation({
    mutationFn: (file: File) => fileService.uploadFile(file),
    onSuccess: (response) => {
      toast.success(response.message || 'File uploaded successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload file';
      toast.error(message);
      console.error('File upload error:', error);
    },
  });
}
