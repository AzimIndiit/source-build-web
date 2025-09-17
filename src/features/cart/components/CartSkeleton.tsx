import React from 'react';
import { Card } from '@/components/ui/Card';
import { BreadcrumbWrapper } from '@/components/ui';

const CartSkeleton: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cart', isCurrentPage: true },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center gap-2 border-b pb-2 border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>

          {/* Cart Items Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Card className="p-4 sm:p-6 border-gray-200" key={item}>
                <div className="flex gap-4">
                  {/* Product Image Skeleton */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg" />
                  </div>

                  {/* Product Details Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded" />
                    </div>

                    {/* Price and Quantity Skeleton */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                      </div>

                      {/* Quantity Selector Skeleton */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 rounded-l-lg" />
                        <div className="px-4 py-2 w-12 bg-gray-200" />
                        <div className="w-8 h-8 bg-gray-200 rounded-r-lg" />
                      </div>
                    </div>

                    {/* Subtotal Skeleton */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-5 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <div className="h-7 w-32 bg-gray-200 rounded mb-6" />

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
              <div className="border-t pt-3 border-gray-200">
                <div className="flex justify-between">
                  <div className="h-6 w-12 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Promo Code Skeleton */}
            <div className="mb-6">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                <div className="w-16 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>

            {/* Checkout Button Skeleton */}
            <div className="w-full h-12 bg-gray-200 rounded-lg" />

            {/* Security Note Skeleton */}
            <div className="mt-4 text-center">
              <div className="h-3 w-48 bg-gray-200 rounded mx-auto" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;