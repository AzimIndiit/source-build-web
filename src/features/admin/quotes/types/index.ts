export interface Quote {
  id: string;
  _id?: string;
  user?: {
    _id?: string;
    id?: string;
    displayName: string;
    email: string;
    phone?: string;
  };
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
  quotedPrice?: number;
  estimatedTime?: string;
  responseNotes?: string;
  respondedBy?: {
    _id?: string;
    id?: string;
    displayName: string;
    email: string;
  };
  respondedAt?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteResponse {
  success: boolean;
  data: {
    quotes: Quote[];
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}