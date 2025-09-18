import axiosInstance from '@/lib/axios';

export interface CreateQuoteRequest {
  projectType: string;
  installationLocation: string;
  spaceWidth: string;
  spaceHeight: string;
  existingDesign: string;
  cabinetStyle: string;
  material: string;
  finishColor: string;
  additionalComments?: string;
  images?: string[];
}

export interface QuoteResponse {
  id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  projectType: string;
  installationLocation: string;
  dimensions: {
    width: number;
    height: number;
  };
  existingDesign: string;
  cabinetStyle: string;
  material: string;
  finishColor: string;
  additionalComments?: string;
  images?: string[];
  quotedPrice?: number;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
}

class QuoteService {
  private baseUrl = '/quotes';

  async createQuoteRequest(data: CreateQuoteRequest): Promise<QuoteResponse> {
    const response = await axiosInstance.post<{ data: QuoteResponse }>(
      `${this.baseUrl}/request`,
      data
    );
    return response.data.data;
  }

  async getQuotes(): Promise<QuoteResponse[]> {
    const response = await axiosInstance.get<{ data: QuoteResponse[] }>(this.baseUrl);
    return response.data.data;
  }

  async getQuoteById(id: string): Promise<QuoteResponse> {
    const response = await axiosInstance.get<{ data: QuoteResponse }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async updateQuoteStatus(id: string, status: QuoteResponse['status']): Promise<QuoteResponse> {
    const response = await axiosInstance.patch<{ data: QuoteResponse }>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
    return response.data.data;
  }

  async deleteQuote(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const quoteService = new QuoteService();
