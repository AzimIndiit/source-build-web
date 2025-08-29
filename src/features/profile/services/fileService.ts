import axiosInstance from '@/lib/axios';

interface FileUploadResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    humanReadableSize: string;
    url: string;
    thumbnailUrl?: string;
    bestImageUrl?: string;
    uploadedAt: string;
    isImage: boolean;
    isVideo: boolean;
    isProcessed: boolean;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  message: string;
}

class FileService {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<FileUploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export const fileService = new FileService();