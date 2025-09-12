import axiosInstance from '@/lib/axios';

export interface CreateReviewData {
  type: 'product' | 'customer' | 'driver' | 'seller';
  product?: string;
  order?: string;
  reviewee?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewParams {
  page?: number;
  limit?: number;
  sort?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
}

class ReviewService {
  // Create a new review
  async createReview(data: CreateReviewData) {
    const response = await axiosInstance.post('/reviews', data);
    return response.data;
  }

  // Get product reviews
  async getProductReviews(productId: string, params?: ReviewParams) {
    const response = await axiosInstance.get(`/reviews/products/${productId}`, {
      params,
    });
    return response.data;
  }

  // Get user's reviews
  async getUserReviews(params?: ReviewParams) {
    const response = await axiosInstance.get('/reviews/my-reviews', {
      params,
    });
    return response.data;
  }

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewData) {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
    return response.data;
  }

  // Delete a review
  async deleteReview(reviewId: string) {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Mark review as helpful or not helpful
  async markReviewHelpful(reviewId: string, helpful: boolean) {
    const response = await axiosInstance.post(`/reviews/${reviewId}/helpful`, {
      helpful,
    });
    return response.data;
  }

  // Add response to a review (for sellers)
  async addReviewResponse(reviewId: string, comment: string) {
    const response = await axiosInstance.post(`/reviews/${reviewId}/response`, {
      comment,
    });
    return response.data;
  }

  // Admin: Update review status
  async updateReviewStatus(reviewId: string, status: string, reason?: string) {
    const response = await axiosInstance.put(`/reviews/${reviewId}/status`, {
      status,
      reason,
    });
    return response.data;
  }
}

export const reviewService = new ReviewService();