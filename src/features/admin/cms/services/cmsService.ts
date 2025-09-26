import axiosInstance from '@/lib/axios';
import { CmsPageResponse, CreateCmsPagePayload, UpdateCmsPagePayload } from '../types';

class CmsService {
  // Get all CMS pages
  async getPages(): Promise<CmsPageResponse> {
    // Don't populate for admin editing - we need raw categoryIds and productIds
    const response = await axiosInstance.get<CmsPageResponse>('/cms/pages', {
      params: { populate: 'false' },
    });
    return response.data;
  }

  // Get single page by slug
  async getPageBySlug(slug: string): Promise<CmsPageResponse> {
    // Don't populate for admin editing - we need raw categoryIds and productIds
    const response = await axiosInstance.get<CmsPageResponse>(`/cms/pages/${slug}`, {
      params: { populate: 'false' },
    });
    return response.data;
  }

  // Create new CMS page
  async createPage(data: CreateCmsPagePayload): Promise<CmsPageResponse> {
    const response = await axiosInstance.post<CmsPageResponse>('/cms/pages', data);
    return response.data;
  }

  // Update CMS page
  async updatePage(pageId: string, data: UpdateCmsPagePayload): Promise<CmsPageResponse> {
    const response = await axiosInstance.put<CmsPageResponse>(`/cms/pages/${pageId}`, data);
    return response.data;
  }

  // Update banner section
  async updateBannerSection(
    pageId: string,
    sectionId: string,
    data: any
  ): Promise<CmsPageResponse> {
    const response = await axiosInstance.patch<CmsPageResponse>(
      `/cms/pages/${pageId}/sections/hero/${sectionId}`,
      data
    );
    return response.data;
  }

  // Update collection section
  async updateCollectionSection(
    pageId: string,
    sectionId: string,
    data: any
  ): Promise<CmsPageResponse> {
    const response = await axiosInstance.patch<CmsPageResponse>(
      `/cms/pages/${pageId}/sections/categories/${sectionId}`,
      data
    );
    return response.data;
  }

  // Update product section
  async updateProductSection(
    pageId: string,
    sectionId: string,
    data: any
  ): Promise<CmsPageResponse> {
    const response = await axiosInstance.patch<CmsPageResponse>(
      `/cms/pages/${pageId}/sections/products/${sectionId}`,
      data
    );
    return response.data;
  }
}

export const cmsService = new CmsService();
