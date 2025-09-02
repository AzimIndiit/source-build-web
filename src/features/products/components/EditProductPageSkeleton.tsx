import { Skeleton } from '@/components/ui/skeleton';

export const EditProductPageSkeleton = () => {
  return (
    <div className="h-screen bg-gray-50 fixed top-0 w-full z-50 left-0 flex flex-col">
      {/* Header skeleton */}
      <div className="bg-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-6 w-6 rounded bg-white/20" />
            <div>
              <Skeleton className="h-3 w-20 mb-1 bg-white/20" />
              <Skeleton className="h-4 w-24 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Form content skeleton */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 mx-auto overflow-hidden min-h-0 w-full">
        {/* Left side - Form */}
        <div className="w-full lg:max-w-[450px] h-full">
          <div className="bg-white rounded-lg p-6 h-full overflow-y-auto space-y-6">
            {/* Photo upload section */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="w-full h-48 rounded-lg border-2 border-dashed" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-16 h-16 rounded" />
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded" />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full rounded" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full rounded" />
              </div>

              {/* Category and subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>

              {/* Quantity and Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-20 rounded" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded" />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Marketplace options */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Date and time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>

              {/* Discount section */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>

              {/* Save button */}
              <div className="pt-4">
                <Skeleton className="h-12 w-full rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Preview (hidden on mobile) */}
        <div className="w-full lg:flex-1 hidden lg:block h-full">
          <div className="bg-white rounded-lg p-6 h-full overflow-y-auto">
            <Skeleton className="h-6 w-32 mb-6" />

            {/* Preview image */}
            <Skeleton className="w-full h-64 rounded-lg mb-6" />

            {/* Preview content */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
