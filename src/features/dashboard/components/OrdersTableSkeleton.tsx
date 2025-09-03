import { Skeleton } from '@/components/ui/skeleton';

export const OrdersTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  
      {/* Table content */}
      <div className="overflow-x-auto">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16 hidden md:block" />
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
            <Skeleton className="h-4 w-20 hidden sm:block" />

            {/* Amount */}
            <Skeleton className="h-4 w-16" />

            {/* Status */}
            <Skeleton className="h-6 w-20 rounded-full hidden md:block" />

            {/* Actions */}
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};