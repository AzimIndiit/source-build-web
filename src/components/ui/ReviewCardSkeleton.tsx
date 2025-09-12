import React from 'react';

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        
        <div className="flex-1 space-y-3">
          {/* Header with name and date */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            {/* Helpful count skeleton */}
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
          
          {/* Star rating skeleton */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          
          {/* Comment skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          
          {/* Response skeleton (optional) */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCardSkeleton;