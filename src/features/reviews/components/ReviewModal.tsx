import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '../hooks/useReviewMutations';
import toast from 'react-hot-toast';
import { StarRating } from '@/components/ui';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  orderId?: string;
  order?: any;
  onSuccess?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
    title?: string;
  } | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  orderId,
  onSuccess,
  existingReview,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const createReviewMutation = useCreateReview();

  // Update form when modal opens or existingReview changes
  React.useEffect(() => {
    if (isOpen) {
      if (existingReview && existingReview.id) {
        setRating(existingReview.rating || 0);
        setComment(existingReview.comment || '');
      } else {
        setRating(0);
        setComment('');
      }
    }
  }, [isOpen, existingReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        type: 'product',
        product: productId,
        order: orderId,
        rating,
        comment,
      });

      toast.success(
        existingReview ? 'Review updated successfully!' : 'Review submitted successfully!'
      );

      // Reset form after successful submission
      setRating(0);
      setComment('');

      // Call onSuccess callback to trigger refetch
      onSuccess?.();

      // Close the modal
      handleClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {existingReview ? 'Edit Review & Rating' : 'Add Review & Rating'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm sm:text-base font-medium text-gray-600">Rating</label>
            <StarRating
              size="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
              rating={rating}
              onRatingChange={(value) => setRating(value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm sm:text-base font-medium text-gray-600">Comment</label>
            <textarea
              placeholder="Share your experience with the seller..."
              className="w-full min-h-[100px] sm:min-h-[120px] md:min-h-[150px] p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base  leading-relaxed"
              value={comment}
              maxLength={500}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6 w-[220px] border-gray-200 text-gray-600 "
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending || rating === 0 || comment.length < 10}
            className="bg-primary hover:bg-primary/90 text-white px-6 w-[220px]"
          >
            {createReviewMutation.isPending
              ? 'Submitting...'
              : existingReview
                ? 'Update Review'
                : 'Add Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
