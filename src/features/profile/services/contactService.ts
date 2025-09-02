import axiosInstance from '@/lib/axios';
import { BaseApiResponse } from '@/types/api.types';

export interface ContactFormPayload {
  firstName: string;
  lastName: string;
  email?: string;
  message?: string;
}

export interface ContactFormResponse extends BaseApiResponse {
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    message?: string;
    createdAt: string;
  };
}

class ContactService {
  async submitContactForm(data: ContactFormPayload): Promise<ContactFormResponse> {
    const response = await axiosInstance.post<ContactFormResponse>('/contact', data);
    return response.data;
  }
}

export const contactService = new ContactService();
