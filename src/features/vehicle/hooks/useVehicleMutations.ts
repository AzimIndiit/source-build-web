import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  vehicleService,
  CreateVehiclePayload,
  Vehicle,
  VehiclesListResponse,
} from '../services/vehicleService';
import { queryClient } from '@/lib/queryClient';

export const VEHICLES_QUERY_KEY = ['vehicles'];
export const VEHICLE_QUERY_KEY = (id: string) => ['vehicle', id];

interface CreateVehicleWithFiles extends Omit<CreateVehiclePayload, 'vehicleImages' | 'insuranceImages'> {
  vehicleImageFiles: File[];
  insuranceImageFiles: File[];
}

interface UpdateVehicleWithFiles extends Partial<Omit<CreateVehiclePayload, 'vehicleImages' | 'insuranceImages'>> {
  id: string;
  vehicleImageFiles?: File[];
  insuranceImageFiles?: File[];
  existingVehicleImages?: string[];
  existingInsuranceImages?: string[];
}

export function useCreateVehicleMutation() {
  return useMutation({
    mutationFn: async (data: CreateVehicleWithFiles) => {
      // Upload vehicle and insurance images in parallel
      const [vehicleImageUrls, insuranceImageUrls] = await Promise.all([
        vehicleService.uploadVehicleImages(data.vehicleImageFiles),
        vehicleService.uploadInsuranceImages(data.insuranceImageFiles),
      ]);

      // Check if at least one vehicle image was uploaded
      if (vehicleImageUrls.length === 0) {
        throw new Error('Failed to upload vehicle images. Please try again.');
      }

      // Prepare payload with uploaded image URLs
      const payload: CreateVehiclePayload = {
        vehicleType: data.vehicleType,
        vehicleManufacturer: data.vehicleManufacturer,
        vehicleModel: data.vehicleModel,
        vehicleRegistrationNumber: data.vehicleRegistrationNumber,
        vehicleImages: vehicleImageUrls,
        insuranceImages: insuranceImageUrls,
      };

      return await vehicleService.createVehicle(payload);
    },
    onSuccess: (response) => {
      // Invalidate vehicles list query
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      
      toast.success(response.message || 'Vehicle information submitted successfully!');
      
    
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to submit vehicle information';
      toast.error(message);
      console.error('Error submitting vehicle information:', error);
    },
  });
}

export function useUpdateVehicleMutation() {
  return useMutation({
    mutationFn: async (data: UpdateVehicleWithFiles) => {
      let vehicleImageUrls = data.existingVehicleImages || [];
      let insuranceImageUrls = data.existingInsuranceImages || [];

      // Upload new images if provided
      const uploadPromises: Promise<string[]>[] = [];
      
      if (data.vehicleImageFiles && data.vehicleImageFiles.length > 0) {
        uploadPromises.push(vehicleService.uploadVehicleImages(data.vehicleImageFiles));
      }
      
      if (data.insuranceImageFiles && data.insuranceImageFiles.length > 0) {
        uploadPromises.push(vehicleService.uploadInsuranceImages(data.insuranceImageFiles));
      }

      if (uploadPromises.length > 0) {
        const uploadResults = await Promise.all(uploadPromises);
        let index = 0;
        
        if (data.vehicleImageFiles && data.vehicleImageFiles.length > 0) {
          vehicleImageUrls = [...vehicleImageUrls, ...uploadResults[index++]];
        }
        
        if (data.insuranceImageFiles && data.insuranceImageFiles.length > 0) {
          insuranceImageUrls = [...insuranceImageUrls, ...uploadResults[index]];
        }
      }

      // Prepare update payload
      const { id, vehicleImageFiles, insuranceImageFiles, existingVehicleImages, existingInsuranceImages, ...updateData } = data;
      
      const payload: Partial<CreateVehiclePayload> = {
        ...updateData,
        vehicleImages: vehicleImageUrls,
        insuranceImages: insuranceImageUrls,
      };

      return await vehicleService.updateVehicle(id, payload);
    },
    onSuccess: (response) => {
      // Invalidate both the list and specific vehicle queries
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEY(response.data.id) });
      
      toast.success(response.message || 'Vehicle updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update vehicle';
      toast.error(message);
      console.error('Error updating vehicle:', error);
    },
  });
}

export function useDeleteVehicleMutation() {
  return useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: (response) => {
      // Invalidate vehicles list query
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      
      toast.success(response.message || 'Vehicle deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete vehicle';
      toast.error(message);
      console.error('Error deleting vehicle:', error);
    },
  });
}

export function useRestoreVehicleMutation() {
  return useMutation({
    mutationFn: (id: string) => vehicleService.restoreVehicle(id),
    onSuccess: (response) => {
      // Invalidate vehicles list query
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      
      toast.success(response.message || 'Vehicle restored successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to restore vehicle';
      toast.error(message);
      console.error('Error restoring vehicle:', error);
    },
  });
}

// Query hooks
export function useVehiclesQuery() {
  return useQuery<VehiclesListResponse>({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: () => vehicleService.getVehicles(),
  });
}

export function useVehicleQuery(id: string) {
  return useQuery({
    queryKey: VEHICLE_QUERY_KEY(id),
    queryFn: () => vehicleService.getVehicleById(id),
    enabled: !!id,
  });
}