import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/date-utils';

export interface ReviewData {
  id: number | string;
  userName: string;
  date: string | Date;
  rating: number;
  comment: string;
  avatar?: string;
}

interface ReviewCardProps {
  review: ReviewData;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
        {/* Header with Avatar and User Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* User Avatar */}
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={review.avatar} alt={review.userName} />
            <AvatarFallback className="bg-orange-500 text-white text-sm sm:text-base">
              {review.userName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          {/* User Info and Rating for Mobile */}
          <div className="flex-1">
            <div className="flex items-start justify-between sm:block">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {review.userName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">{formatDate(review.date)}</p>
              </div>

              {/* Rating Badge - Mobile Position */}
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 sm:hidden rounded-full ml-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900 text-xs">{review.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Badge - Desktop Position */}
        <div className="hidden sm:flex items-center gap-1 bg-orange-100 px-3 py-2 rounded-full">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">{review.rating}</span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mt-3 sm:mt-4 sm:ml-16">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
