import { Skeleton } from '@/components/ui/skeleton';

export const ProductDetailsPageSkeleton = () => {
  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Left column - Image gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main image */}
          <Skeleton className="w-full h-[250px] sm:h-[350px] md:h-[400px] rounded-sm" />

          {/* Thumbnail carousel */}
          <div className="relative">
            <div className="flex items-center">
              {/* Previous button */}
              <Skeleton className="absolute left-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />

              {/* Thumbnails */}
              <div className="flex gap-2 sm:gap-3 mx-10 sm:mx-12 md:mx-14">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex-shrink-0 w-[80px] h-[60px] sm:w-[120px] sm:h-[80px] md:w-[150px] md:h-[100px] lg:w-[180px] lg:h-[120px] rounded-lg"
                  />
                ))}
              </div>

              {/* Next button */}
              <Skeleton className="absolute right-0 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right column - Product information */}
        <div className="space-y-4">
          {/* Product title */}
          <div>
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-full mb-3 sm:mb-4" />
            <Skeleton className="h-6 sm:h-8 w-3/4 mb-2" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              {/* Price section */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Skeleton className="h-8 sm:h-10 w-20" />
                <Skeleton className="h-6 sm:h-8 w-16" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Categories */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Brand */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Tags */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-12 h-12 rounded-full" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
            <Skeleton className="w-full sm:flex-1 h-[48px] sm:h-[56px] rounded" />
            <Skeleton className="w-full sm:flex-1 h-[48px] sm:h-[56px] rounded" />
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-6 sm:h-8 w-40 mb-3 sm:mb-4" />
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-5 h-5" />
              ))}
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Reviews list skeleton */}
        <div className="space-y-4 sm:space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="ml-auto">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Skeleton key={starIndex} className="w-4 h-4" />
                    ))}
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
