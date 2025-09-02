import api from '@/lib/axios';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
  BOTH = 'both',
}

export interface SavedAddress {
  id: string;
  _id?: string;
  name: string;
  phoneNumber: string;
  city: string;
  location?: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  isDefault: boolean;
  type: AddressType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedAddressPayload {
  name: string;
  phoneNumber: string;
  location?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  isDefault: boolean;
  type: AddressType;
}

export interface UpdateSavedAddressPayload extends Partial<CreateSavedAddressPayload> {}

export interface AddressQueryParams {
  type?: AddressType;
  isDefault?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddressResponse {
  success: boolean;
  data: SavedAddress | SavedAddress[];
  message: string;
  meta?: {
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AddressStatistics {
  total: number;
  byType: Record<string, number>;
  defaultAddresses: Record<string, boolean>;
}

export const addressService = {
  // Get all addresses
  async getAddresses(params?: AddressQueryParams): Promise<AddressResponse> {
    const response = await api.get('/addresses', { params });
    return response.data;
  },

  // Get single address
  async getAddress(id: string): Promise<AddressResponse> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Create new address
  async createAddress(data: CreateSavedAddressPayload): Promise<AddressResponse> {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  // Update address
  async updateAddress(id: string, data: UpdateSavedAddressPayload): Promise<AddressResponse> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // Delete address
  async deleteAddress(id: string): Promise<AddressResponse> {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // Set as default address
  async setDefaultAddress(id: string): Promise<AddressResponse> {
    const response = await api.post(`/addresses/${id}/set-default`);
    return response.data;
  },

  // Get default address
  async getDefaultAddress(type?: AddressType): Promise<AddressResponse> {
    const response = await api.get('/addresses/default', {
      params: type ? { type } : undefined,
    });
    return response.data;
  },

  // Get address statistics
  async getStatistics(): Promise<{ success: boolean; data: AddressStatistics }> {
    const response = await api.get('/addresses/statistics');
    return response.data;
  },

  // Validate ownership
  async validateOwnership(id: string): Promise<{ success: boolean; data: { isOwner: boolean } }> {
    const response = await api.get(`/addresses/${id}/validate-ownership`);
    return response.data;
  },
};
