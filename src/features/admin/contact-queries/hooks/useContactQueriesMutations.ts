import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

interface ContactQuery {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'resolved' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt?: string;
  resolvedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ContactQueriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface ContactQueriesResponse {
  success: boolean;
  data: {
    contacts: ContactQuery[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  message: string;
}

// Fetch all contact queries
export const useContactQueriesQuery = (params: ContactQueriesParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);

  return useQuery<ContactQueriesResponse>({
    queryKey: ['contact-queries', params],
    queryFn: async () => {
      const { data } = await axios.get(`/contact?${queryParams.toString()}`);
      return data;
    },
  });
};

// Update contact query status
export const useUpdateContactQueryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await axios.put(`/contact/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-queries'] });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};