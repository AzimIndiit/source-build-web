import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicleService';
import { queryClient } from '@/lib/queryClient';

export const LICENSE_QUERY_KEY = ['license'];

interface CreateLicenseWithFiles {
  licenseNumber: string;
  licenseImageFiles: File[];
}

interface LicenseResponse {
  success: boolean;
  message: string;
  data: any;
}

export function useCreateLicenseMutation() {
  return useMutation<LicenseResponse, Error, CreateLicenseWithFiles>({
    mutationFn: async (data: CreateLicenseWithFiles) => {
      // Upload license images in parallel
      const licenseImageUrls = await vehicleService.uploadVehicleImages(data.licenseImageFiles);

      // Check if at least one license image was uploaded
      if (licenseImageUrls.length === 0) {
        throw new Error('Failed to upload license images. Please try again.');
      }

      // TODO: Replace with actual license API endpoint
      // For now, we'll just simulate the API call
      const payload = {
        licenseNumber: data.licenseNumber,
        licenseImages: licenseImageUrls,
      };

      // Simulate API call - replace with actual service call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'License information submitted successfully!',
            data: payload,
          });
        }, 1000);
      });
    },
    onSuccess: (response) => {
      // Invalidate license query
      queryClient.invalidateQueries({ queryKey: LICENSE_QUERY_KEY });

      toast.success(response.message || 'License information submitted successfully!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to submit license information';
      toast.error(message);
      console.error('Error submitting license information:', error);
    },
  });
}
