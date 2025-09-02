import { Skeleton } from '@/components/ui/skeleton';

export const ChatListSkeleton = () => {
  return (
    <div className="py-4 md:p-6 space-y-6">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 rounded-lg">
            {/* Avatar skeleton */}
            <Skeleton className="w-12 h-12 rounded-full" />

            <div className="flex-1 space-y-2">
              {/* Name and timestamp row */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Message preview */}
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Unread count placeholder */}
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
