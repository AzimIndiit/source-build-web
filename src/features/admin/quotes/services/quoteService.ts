import axiosInstance from '@/lib/axios';
import { Quote } from '../types';

export interface QuotesListResponse {
  success: boolean;
  message?: string;
  data: {
    quotes: Quote[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface QuoteFilters {
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
  projectType?: string;
  installationLocation?: string;
}

export interface CreateQuotePayload {
  projectType: string;
  installationLocation: string;
  spaceWidth?: number;
  spaceHeight?: number;
  existingDesign?: string;
  cabinetStyle?: string;
  material?: string;
  finishColor?: string;
  additionalComments?: string;
  images?: string[];
}

export interface UpdateQuotePayload {
  projectType?: string;
  installationLocation?: string;
  spaceWidth?: number;
  spaceHeight?: number;
  existingDesign?: string;
  cabinetStyle?: string;
  material?: string;
  finishColor?: string;
  additionalComments?: string;
  images?: string[];
  quotedPrice?: number;
  estimatedTime?: string;
  responseNotes?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'cancelled';
}

class QuoteService {
  // Get all quotes with filters
  async getQuotes(filters?: QuoteFilters): Promise<QuotesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<QuotesListResponse>('/quotes', { params });
    return response.data;
  }

  // Get single quote by ID
  async getQuoteById(quoteId: string): Promise<{ success: boolean; message?: string; data: { quote: Quote } }> {
    const response = await axiosInstance.get(`/quotes/${quoteId}`);
    return response.data;
  }

  // Create new quote
  async createQuote(data: CreateQuotePayload): Promise<{ success: boolean; message?: string; data: Quote }> {
    const response = await axiosInstance.post('/quotes', data);
    return response.data;
  }

  // Update quote
  async updateQuote(quoteId: string, data: UpdateQuotePayload): Promise<{ success: boolean; message?: string; data: Quote }> {
    const response = await axiosInstance.patch(`/quotes/${quoteId}`, data);
    return response.data;
  }

  // Delete quote
  async deleteQuote(quoteId: string): Promise<{ success: boolean; message?: string }> {
    const response = await axiosInstance.delete(`/quotes/${quoteId}`);
    return response.data;
  }

  // Update quote status
  async updateQuoteStatus(quoteId: string, status: string): Promise<{ success: boolean; message?: string; data: Quote }> {
    const response = await axiosInstance.patch(`/quotes/${quoteId}/status`, {
      status,
    });
    return response.data;
  }

  // Respond to quote (admin response)
  async respondToQuote(
    quoteId: string,
    data: {
      quotedPrice?: number;
      estimatedTime?: string;
      responseNotes?: string;
      status?: 'completed' | 'rejected';
    }
  ): Promise<{ success: boolean; message?: string; data: Quote }> {
    const response = await axiosInstance.patch(`/quotes/${quoteId}/respond`, data);
    return response.data;
  }

  // Get quote statistics
  async getQuoteStats(period?: 'day' | 'week' | 'month' | 'year') {
    const params = period ? { period } : {};
    const response = await axiosInstance.get('/quotes/stats', { params });
    return response.data;
  }
}

export const quoteService = new QuoteService();