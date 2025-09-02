import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

const ManageBankAccountsSkeleton = () => {
  return (
    <Card className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] flex flex-col">
      <CardContent className="px-4 sm:px-6 flex flex-col flex-1">
        {/* Header with title and button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="w-full sm:w-[180px] h-10 sm:h-11 rounded-lg" />
        </div>

        {/* Bank Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border border-gray-200 rounded-lg p-4">
              {/* Default badge skeleton */}
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>

              {/* Account details */}
              <div className="space-y-3">
                {/* Account holder name */}
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>

                {/* Account number */}
                <div>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>

                {/* Bank name */}
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageBankAccountsSkeleton;
