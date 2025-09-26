import axiosInstance from '@/lib/axios';
import { BaseApiResponse } from '@/types/api.types';

export enum ContentType {
  TERMS_CONDITIONS = 'terms_conditions',
  PRIVACY_POLICY = 'privacy_policy',
  LANDING_PAGE = 'landing_page',
  ABOUT_US = 'about_us',
  SELLER_TERMS_CONDITIONS = 'seller_terms_conditions',
  SELLER_PRIVACY_POLICY = 'seller_privacy_policy',
  SELLER_ABOUT_US = 'seller_about_us',
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

  // Get public landing page with populated data
  async getPublicLandingPage(): Promise<CmsContentResponse> {
    const response = await axiosInstance.get<CmsContentResponse>('/cms/public/landing-page');
    return response.data;
  }

  // Get pages with optional population
  async getPages(populate = false): Promise<CmsContentResponse> {
    const response = await axiosInstance.get<CmsContentListResponse>('/cms/pages', {
      params: { populate: populate ? 'true' : 'false' },
    });
    // If array is returned, find landing page
    if (Array.isArray(response.data.data)) {
      const landingPage = response.data.data.find((page) => page.type === ContentType.LANDING_PAGE);
      if (landingPage) {
        return { ...response.data, data: landingPage };
      }
    }
    // Return first item if exists
    if (response.data.data && response.data.data.length > 0) {
      return { ...response.data, data: response.data.data[0] };
    }
    return { ...response.data, data: undefined };
  }
}

export const cmsService = new CmsService();
