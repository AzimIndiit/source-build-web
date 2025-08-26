import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    buyerRating: number,
    buyerComment: string,
    driverRating: number,
    driverComment: string
  ) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const initialReviewState = {
    buyerRating: 0,
    buyerComment: '',
    driverRating: 0,
    driverComment: '',
  };

  const [reviewData, setReviewData] = useState(initialReviewState);

  const updateReviewData = (field: keyof typeof reviewData, value: string | number) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const { buyerRating, buyerComment, driverRating, driverComment } = reviewData;
    onSubmit(buyerRating, buyerComment, driverRating, driverComment);
    handleClose();
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
          {/* Buyer Review Section */}
          <div className="space-y-3">
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
          </div>

          {/* Driver Review Section */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold">For Driver</h3>

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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-[224px]  px-6 sm:px-8 py-2 sm:py-2.5 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-600 text-sm sm:text-base h-[53px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={reviewData.buyerRating === 0 && reviewData.driverRating === 0}
              onClick={handleSubmit}
              className="  bg-primary hover:bg-primary/80 text-white px-6 sm:px-8 py-2 sm:py-2.5 w-[220px] text-sm sm:text-base h-[53px]"
            >
              Add Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
