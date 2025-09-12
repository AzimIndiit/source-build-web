import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '../services/orderService';
import { toast } from 'react-hot-toast';
import { Order } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onSubmit?: (
    buyerRating: number,
    buyerComment: string,
    driverRating: number,
    driverComment: string,
    sellerRating: number,
    sellerComment: string
  ) => void;
  onSuccess?: () => void;
  order?: Order;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  orderId,
  onSubmit,
  onSuccess,
}) => {
  const { user } = useAuth();
  console.log('order', order);
  const initialReviewState = {
    buyerRating: order?.customer?.rating || 0,
    buyerComment: order?.customer?.review || '',
    driverRating: order?.driver?.rating || 0,
    driverComment: order?.driver?.review || '',
    sellerRating: order?.seller?.rating || 0,
    sellerComment: order?.seller?.review || '',
  };

  const [reviewData, setReviewData] = useState(initialReviewState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateReviewData = (field: keyof typeof reviewData, value: string | number) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!orderId) {
      // Fallback to old behavior if no orderId provided
      if (onSubmit) {
        const {
          buyerRating,
          buyerComment,
          driverRating,
          driverComment,
          sellerRating,
          sellerComment,
        } = reviewData;
        onSubmit(
          buyerRating,
          buyerComment,
          driverRating,
          driverComment,
          sellerRating,
          sellerComment
        );
      }
      handleClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const reviews: any = {};

      // Add customer/buyer review if provided
      if (reviewData.buyerRating > 0) {
        if (reviewData.buyerComment === '') {
          return toast.error('Please enter a comment ');
        }
        reviews.customer = {
          rating: reviewData.buyerRating,
          review: reviewData.buyerComment || '',
        };
      }

      // Add driver review if provided
      if (reviewData.driverRating > 0) {
        if (reviewData.driverComment === '') {
          return toast.error('Please enter a comment ');
        }
        reviews.driver = {
          rating: reviewData.driverRating,
          review: reviewData.driverComment || '',
        };
      }

      // Add seller review if provided
      if (reviewData.sellerRating > 0) {
        if (reviewData.sellerComment === '') {
          return toast.error('Please enter a comment ');
        }
        reviews.seller = {
          rating: reviewData.sellerRating,
          review: reviewData.sellerComment || '',
        };
      }

      await orderService.addOrderReview(orderId, reviews);
      // toast.success('Review submitted successfully!');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const errorMessage =
        error?.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReviewData(initialReviewState);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-sm">
        <DialogTitle className="text-lg sm:text-xl font-semibold">Add Review & Rating</DialogTitle>

        <div className="space-y-4 sm:space-y-6">
          {/* Seller Review Section */}
          {user?.role === 'seller' && (
            <div className="space-y-3">
              {/* <h3 className="text-base sm:text-lg font-semibold">For Seller</h3> */}

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-600">Rating</label>
                <StarRating
                  size="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  rating={reviewData.sellerRating}
                  onRatingChange={(value) => updateReviewData('sellerRating', value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-600">Comment</label>
                <textarea
                  placeholder="Share your experience with the seller..."
                  className="w-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
                  value={reviewData.sellerComment}
                  maxLength={500}
                  onChange={(e) => updateReviewData('sellerComment', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          {/* Buyer Review Section */}
          {/* { <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold">For Buyer</h3>

            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-600">Rating</label>
              <StarRating
                size="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                rating={reviewData.buyerRating}
                onRatingChange={(value) => updateReviewData('buyerRating', value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-600">Comment</label>
              <textarea
                placeholder="Share your experience with the buyer..."
                className="w-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
                value={reviewData.buyerComment}
                onChange={(e) => updateReviewData('buyerComment', e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>} */}

          {/* Driver Review Section */}
          {user?.role === 'driver' && (
            <div className="space-y-3">
              {/* <h3 className="text-base sm:text-lg font-semibold">For Driver</h3> */}

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-600">Rating</label>
                <StarRating
                  size="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  rating={reviewData.driverRating}
                  onRatingChange={(value) => updateReviewData('driverRating', value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-600">Comment</label>
                <textarea
                  placeholder="Share your experience with the driver..."
                  className="w-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
                  value={reviewData.driverComment}
                  maxLength={500}
                  onChange={(e) => updateReviewData('driverComment', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-row justify-center sm:justify-end gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-[224px]  px-6 sm:px-8 py-2 sm:py-2.5 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-600 text-sm sm:text-base h-[53px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                isSubmitting ||
                (reviewData.buyerRating === 0 &&
                  reviewData.driverRating === 0 &&
                  reviewData.sellerRating === 0)
              }
              onClick={handleSubmit}
              className="  bg-primary hover:bg-primary/80 text-white px-6 sm:px-8 py-2 sm:py-2.5 w-[220px] text-sm sm:text-base h-[53px]"
            >
              {isSubmitting ? 'Submitting...' : 'Add Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
