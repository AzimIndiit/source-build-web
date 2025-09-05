import axiosInstance from '@/lib/axios';
import { BaseApiResponse } from '@/types/api.types';

export enum ContentType {
  TERMS_CONDITIONS = 'terms_conditions',
  PRIVACY_POLICY = 'privacy_policy',
  ABOUT_US = 'about_us',
}

export interface CmsContent {
  id?: string;
  _id?: string;
  userId: string;
  type: ContentType;
  title?: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCmsContentPayload {
  type: ContentType;
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateCmsContentPayload {
  title?: string;
  content?: string;
  isActive?: boolean;
}

export interface CmsContentResponse extends BaseApiResponse {
  data?: CmsContent;
}

export interface CmsContentListResponse extends BaseApiResponse {
  data?: CmsContent[];
}

class CmsService {
  // Seller management endpoints
  async createOrUpdateContent(data: CreateCmsContentPayload): Promise<CmsContentResponse> {
    const response = await axiosInstance.post<CmsContentResponse>('/cms/manage', data);
    return response.data;
  }

  async getAllContent(): Promise<CmsContentListResponse> {
    const response = await axiosInstance.get<CmsContentListResponse>('/cms/manage');
    return response.data;
  }

  async getContent(type: ContentType): Promise<CmsContentResponse> {
    const response = await axiosInstance.get<CmsContentResponse>(`/cms/manage/${type}`);
    return response.data;
  }

  async updateContent(
    type: ContentType,
    data: UpdateCmsContentPayload
  ): Promise<CmsContentResponse> {
    const response = await axiosInstance.put<CmsContentResponse>(`/cms/manage/${type}`, data);
    return response.data;
  }

  async deleteContent(type: ContentType): Promise<BaseApiResponse> {
    const response = await axiosInstance.delete<BaseApiResponse>(`/cms/manage/${type}`);
    return response.data;
  }

  // Public endpoints for buyers
  async getPublicContent(sellerId: string, type: ContentType): Promise<CmsContentResponse> {
    const response = await axiosInstance.get<CmsContentResponse>(`/cms/public/${sellerId}/${type}`);
    return response.data;
  }

  async getAllPublicContent(sellerId: string): Promise<CmsContentListResponse> {
    const response = await axiosInstance.get<CmsContentListResponse>(`/cms/public/${sellerId}`);
    return response.data;
  }
}

export const cmsService = new CmsService();
