import axiosInstance from '@/lib/axios';
import { fileService } from '@/features/profile/services/fileService';

export interface CreateVehiclePayload {
  vehicleType: string;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleRegistrationNumber: string;
  vehicleImages: string[];
  insuranceImages: string[];
}

export interface CreateLicensePayload{
  licenseNumber: string;
  licenseImages: string[];
}

export interface Vehicle {
  _id: string;
  id: string;
  userId: string;
  vehicleType: string;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleRegistrationNumber: string;
  vehicleImages: string[];
  insuranceImages: string[];
  isActive: boolean;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle;
}

export interface VehiclesListResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
}

class VehicleService {
  async createVehicle(data: CreateVehiclePayload): Promise<VehicleResponse> {
    const response = await axiosInstance.post<VehicleResponse>('/driver/vehicles', data);
    return response.data;
  }
  async createLicense(data: CreateLicensePayload): Promise<VehicleResponse> {
    const response = await axiosInstance.post<VehicleResponse>('/driver/license', data);
    return response.data;
  }
  async updateVehicle(id: string, data: Partial<CreateVehiclePayload>): Promise<VehicleResponse> {
    const response = await axiosInstance.put<VehicleResponse>(`/driver/vehicles/${id}`, data);
    return response.data;
  }

  async getVehicles(): Promise<VehiclesListResponse> {
    const response = await axiosInstance.get<VehiclesListResponse>('/driver/vehicles');
    return response.data;
  }

  async getVehicleById(id: string): Promise<VehicleResponse> {
    const response = await axiosInstance.get<VehicleResponse>(`/driver/vehicles/${id}`);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/driver/vehicles/${id}`
    );
    return response.data;
  }

  async restoreVehicle(id: string): Promise<VehicleResponse> {
    const response = await axiosInstance.patch<VehicleResponse>(`/driver/vehicles/${id}/restore`);
    return response.data;
  }

  async uploadVehicleImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await fileService.uploadFile(file);
        if (response.status === 'success' && response.data.url) {
          return response.data.url;
        }
        throw new Error('Upload failed');
      } catch (error) {
        console.error(`Failed to upload image: ${file.name}`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  }

  async uploadInsuranceImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await fileService.uploadFile(file);
        if (response.status === 'success' && response.data.url) {
          return response.data.url;
        }
        throw new Error('Upload failed');
      } catch (error) {
        console.error(`Failed to upload insurance document: ${file.name}`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  }
}

export const vehicleService = new VehicleService();
