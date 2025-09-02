import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { BreadcrumbWrapper } from '@/components/ui';

const ChatInterfaceSkeleton = () => {
  const breadcrumbItems = [
    { label: 'Messages', href: '/seller/messages' },
    { label: 'Chat Details', isCurrentPage: true },
  ];

  return (
    <div className="py-4 md:p-6 space-y-6">
      <BreadcrumbWrapper items={breadcrumbItems} />

      <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden border-gray-200">
        {/* Chat Header Skeleton */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>

        {/* Chat Messages Skeleton */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Message from other user */}
          <div className="flex items-start gap-2 justify-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col max-w-[70%] items-start space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-20 w-64 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Message from current user */}
          <div className="flex items-start gap-2 justify-end">
            <div className="flex flex-col max-w-[70%] items-end space-y-2">
              <Skeleton className="h-16 w-48 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Another message from other user */}
          <div className="flex items-start gap-2 justify-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col max-w-[70%] items-start space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-56 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Message with image skeleton */}
          <div className="flex items-start gap-2 justify-end">
            <div className="flex flex-col max-w-[70%] items-end space-y-2">
              <Skeleton className="h-48 w-48 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* More messages */}
          <div className="flex items-start gap-2 justify-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col max-w-[70%] items-start space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-40 rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>

        {/* Message Input Skeleton */}
        <div className="border-t bg-white p-4 border-gray-200 flex-shrink-0">
          <div className="relative">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Skeleton className="h-12 w-16 rounded" />
              <Skeleton className="h-12 w-16 rounded" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterfaceSkeleton;
