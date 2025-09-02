import { Skeleton } from '@/components/ui/skeleton';

export const NotificationsPageSkeleton = () => {
  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-28" />
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-gray-100 space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg">
            {/* Notification icon/avatar */}
            <div className="flex-shrink-0">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>

            {/* Notification content */}
            <div className="flex-1 space-y-2">
              {/* Title and time */}
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Description */}
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>

            {/* Unread indicator */}
            <div className="flex-shrink-0">
              <Skeleton className="w-3 h-3 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
        <Skeleton className="h-10 w-28 rounded" />
      </div>
    </div>
  );
};
