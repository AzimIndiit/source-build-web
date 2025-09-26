import React from 'react';
import { Card } from '@/components/ui/Card';

export const CmsPageSkeleton: React.FC = () => {
  return (
    <div className="py-4 md:p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-80 bg-gray-200 rounded" />
      </div>

      {/* Table Skeleton */}
      <Card className="bg-white shadow-sm border-gray-50 rounded-3xl p-0 overflow-hidden">
        <div className="p-6">
          {/* Table Header */}
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-4 w-12 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b py-4 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded ml-4" />
                  <div className="h-4 w-40 bg-gray-200 rounded ml-4" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
