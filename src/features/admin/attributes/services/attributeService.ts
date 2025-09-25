import axiosInstance from '@/lib/axios';
import {
  Attribute,
  AttributesResponse,
  CreateAttributeDto,
  UpdateAttributeDto,
  GetAttributesQuery,
} from '../types';

export const attributeService = {
  async getAttributes(params?: GetAttributesQuery): Promise<AttributesResponse> {
    const response = await axiosInstance.get<AttributesResponse>('/attributes', {
      params,
    });
    return response.data;
  },

  async getAttributeById(id: string): Promise<{ data: Attribute }> {
    const response = await axiosInstance.get(`/attributes/${id}`);
    return response.data;
  },

  async getAttributesBySubcategory(subcategoryId: string): Promise<{ data: Attribute[] }> {
    const response = await axiosInstance.get(`/attributes/subcategory/${subcategoryId}`);
    return response.data;
  },

  async createAttribute(data: CreateAttributeDto): Promise<{ data: Attribute }> {
    const response = await axiosInstance.post('/attributes', data);
    return response.data;
  },

  async updateAttribute(id: string, data: UpdateAttributeDto): Promise<{ data: Attribute }> {
    const response = await axiosInstance.put(`/attributes/${id}`, data);
    return response.data;
  },

  async toggleAttributeStatus(id: string): Promise<{ data: Attribute }> {
    const response = await axiosInstance.patch(`/attributes/${id}/toggle-status`, {});
    return response.data;
  },

  async deleteAttribute(id: string): Promise<void> {
    await axiosInstance.delete(`/attributes/${id}`);
  },
};
