import { Skeleton } from '@/components/ui/skeleton';

export const UserTableSkeleton = () => {
  return (
    <div className="py-4 md:p-6 space-y-6">
    

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
            {/* Order ID */}
            <Skeleton className="h-4 w-16" />

            {/* Customer info */}
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Date */}
            <Skeleton className="h-4 w-20" />

            {/* Amount */}
            <Skeleton className="h-4 w-16" />

            {/* Status */}
            <Skeleton className="h-6 w-20 rounded-full" />

            {/* Actions */}
            <Skeleton className="h-8 w-16 rounded" />
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
