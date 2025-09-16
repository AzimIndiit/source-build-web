import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent p-0">
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-44 bg-gray-200 rounded-xl animate-pulse" />

        {/* Wishlist button skeleton */}
        <div className="absolute top-2 right-2 w-10 h-10 bg-gray-300 rounded-full animate-pulse" />

        {/* Badge skeleton */}
        <div className="absolute bottom-2 left-2 w-24 h-6 bg-gray-300 rounded animate-pulse" />
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />

        {/* Category skeleton */}
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />

        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />

        {/* Location and seller skeleton */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
