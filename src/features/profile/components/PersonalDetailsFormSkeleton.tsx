import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/Card';

export const PersonalDetailsFormSkeleton = () => {
  return (
    <Card className="bg-white border-gray-200 shadow-none">
      <CardContent className="p-4 sm:p-6">
        <Skeleton className="h-6 sm:h-7 w-32 mb-4 sm:mb-6" />

        {/* Avatar section skeleton */}
        <div className="mb-6 sm:mb-8 flex justify-center sm:justify-start">
          <div className="relative inline-block">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
            <Skeleton className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4 sm:space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>

          {/* Email and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>

          {/* Region and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-28 w-full rounded" />
          </div>

          {/* Footer with password change and save button */}
          <div className="pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            {/* Password change link */}
            <Skeleton className="h-4 w-48" />

            {/* Save button */}
            <div className="w-full sm:w-auto">
              <Skeleton className="h-10 sm:h-12 w-full sm:w-[200px] md:w-[300px] lg:w-[469px] rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
