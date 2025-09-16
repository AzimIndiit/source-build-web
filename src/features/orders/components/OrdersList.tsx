import React from 'react';
import { OrderProductCard } from './OrderProductCard';

interface OrderProduct {
  id: string;
  title: string;
  quantity?: number;
  price?: number;
  deliveryDate?: string;
  image?: string;
  color?: string;
  productRef?: {
    slug: string;
    _id?: string;
  };
}

interface OrdersListProps {
  orders: any[];
  onViewDetails: (orderId: string) => void;
  onWriteReview?: () => void;
  onBuyAgain?: (productId: string) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  onViewDetails,
  onWriteReview,
  onBuyAgain,
}) => {
  const handleViewItem = (orderId: string) => () => {
    // Navigate to order details page
    onViewDetails(orderId);
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const orderId = (order as any)._id || order.id;
        return (
          <div key={orderId} className="relative">
      
            {/* Order Card */}
            <OrderProductCard
              order={order}
              viewOrderDetailes={true}
              onViewItem={handleViewItem(orderId)}
              onWriteReview={onWriteReview}
              onBuyAgain={onBuyAgain}
            />
            
          </div>
        );
      })}
    </div>
  );
};