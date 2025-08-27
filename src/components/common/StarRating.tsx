import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: string;
  showValue?: boolean;
  totalReviews?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'h-5 w-5',
  showValue = false,
  totalReviews,
  className = '',
  onRatingChange,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Handle click on a star
  const handleClick = (newRating: number) => {
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= fullStars;
          const isHalf = hasHalfStar && starValue === fullStars + 1;

          return (
            <div
              key={i}
              className={`${onRatingChange ? 'cursor-pointer' : ''}`}
              onClick={() => handleClick(starValue)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(starValue)}
            >
              {isFilled ? (
                <Star className={`${size} fill-yellow-400 text-yellow-400`} />
              ) : isHalf ? (
                <div className="relative">
                  <Star className={`${size} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${size} fill-yellow-400 text-yellow-400`} />
                  </div>
                </div>
              ) : (
                <Star className={`${size} text-gray-300`} />
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="text-gray-700 text-sm">
          {rating.toFixed(1)} / 5
          {totalReviews && (
            <span className="ml-1 font-semibold text-gray-500">({totalReviews} reviews)</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
