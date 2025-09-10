import { Skeleton } from '@/components/ui/skeleton';

export const VehiclePageSkeleton = () => {
  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          {/* Location dropdown skeleton */}
          <Skeleton className="h-10 w-32 rounded-lg" />
          {/* Filter dropdown skeleton */}
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Product Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Product image skeleton */}
            <Skeleton className="w-full h-48" />

            {/* Product details */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />

              {/* Price and rating */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>

              {/* Category */}
              <Skeleton className="h-3 w-24" />

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center space-x-2">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-16 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
    </div>
  );
};
