import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Order } from '@/features/dashboard/types';
import { formatCurrency } from '@/lib/helpers';
import { ReviewModal } from './ReviewModal';
import { Badge } from '@/components/ui';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { formatDate } from '@/lib/date-utils';
import { useAuth } from '@/hooks/useAuth';
import { getColorName } from '@/utils/colorUtils';

interface OrderProductCardProps {
  order: Order;
  onViewItem?: ({ slug }: { slug: string }) => void;
  onWriteReview?: () => void;
}

export const OrderProductCard: React.FC<OrderProductCardProps> = ({
  order,
  onViewItem,
  onWriteReview,
}) => {
  const { user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Format the order ID to match the image format (408-2671656-7090703)
  const formattedOrderId = order.id.includes('-')
    ? order.id
    : `408-2671656-${order.id.padStart(7, '0')}`;

  // Calculate total quantity
  const totalQuantity =
    order.products?.reduce((sum, product) => sum + (product.quantity || 1), 0) || 1;

  // Calculate total amount
  const totalAmount =
    order.products?.reduce((sum, product) => {
      return sum + (product.price || 0);
    }, 0) ||
    order.amount ||
    0;

  // If there are multiple products, render a single card with common header
  if (order.products && order.products.length > 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Common Header Section */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3  border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 flex-1">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(order.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quantity</p>
                <p className="text-sm font-medium text-gray-900">{totalQuantity}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <Badge
                  className={`px-2 lg:px-3 py-1 rounded-full font-medium text-xs ${getStatusBadgeColor(order.status)}`}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="hidden lg:block">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                <p className="text-sm font-medium text-gray-900">Paid</p>
              </div>
            </div>
            <div className="sm:ml-4 lg:ml-6 text-left sm:text-right space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Order # {formattedOrderId}
              </p>
              {/* Common Write Review Button - Only show on last item */}

              {order.status === 'Delivered' && (
                <div className="flex-shrink-0 self-start">
                  <Button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-primary  hover:bg-primary/80 text-white rounded-lg px-6 py-3 h-auto font-medium text-base whitespace-nowrap"
                  >
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="divide-y divide-gray-200">
          {order.products.map((product, index) => (
            <div key={product.id || index} className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      product.image ||
                      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=128&h=96&fit=crop'
                    }
                    alt={product.title}
                    className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span>{' '}
                      {formatCurrency(product.price || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Qty:</span> {product.quantity || 1}
                    </p>
                    {product.color && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Color:</span>{' '}
                        <span className="capitalize">{getColorName(product.color).name}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 sm:mb-4">
                    Delivery on {formatDate(product.deliveryDate || '12 October 2024')}
                  </p>
                </div>
                {/* View Item Button */}
                {user?.role === 'seller' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onViewItem?.({ slug: product.productRef?.slug || '' });
                      console.log('Viewing item:', product.title);
                    }}
                    className="border-primary text-primary hover:bg-blue-50 rounded-lg px-6 py-2 h-auto font-medium"
                  >
                    View your item
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Review Modal */}
        {isReviewModalOpen && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            orderId={order?._id}
            order={order}
            onSuccess={() => {
              onWriteReview?.();
            }}
          />
        )}
      </div>
    );
  }

  // Fallback to single product card for backward compatibility
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <p>No products found for this order</p>
    </div>
  );
};
