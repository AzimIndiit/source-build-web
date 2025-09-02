import React, { useState } from 'react';
import { OrdersTable } from '@/features/dashboard/components/OrdersTable';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui';
import { useSellerOrdersQuery } from '../hooks/useOrderMutations';
import { SellerOrdersPageSkeleton } from '../components/SellerOrdersPageSkeleton';

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch orders from API
  const { data, isLoading, isError, error } = useSellerOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
  });

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/seller/orders/${orderId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return <SellerOrdersPageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 font-semibold mb-2">Error loading orders</p>
        <p className="text-gray-600 text-sm">
          {(error as any)?.response?.data?.message || 'Failed to fetch orders. Please try again.'}
        </p>
      </div>
    );
  }

  // Transform data to match the expected format for OrdersTable
  const orders = data?.data || [];
  const transformedOrders = orders.map((order) => ({
    id: order.orderNumber || order._id,
    customer: {
      displayName: order.customer?.userRef?.displayName || 'Customer',
      email: order.customer?.userRef?.email || '',
      avatar: order.customer?.userRef?.avatar || '',
    },
    driver: order.driver
      ? {
          displayName: order.driver?.userRef?.displayName || 'Driver',
          email: order.driver?.userRef?.email || '',
          avatar: order.driver?.userRef?.avatar || '',
        }
      : undefined,
    products: order.products.map((p) => ({
      id: p.id,
      title: p.title,
      quantity: p.quantity,
      price: p.price,
      deliveryDate: p.deliveryDate,
      image: p.image,
    })),
    date: order.createdAt,
    amount: order.amount,
    status: order.status as any,
    orderSummary: order.orderSummary
      ? {
          shippingAddress: order.orderSummary.shippingAddress,
          proofOfDelivery: order.orderSummary.proofOfDelivery || '',
          paymentMethod: {
            type: order.orderSummary.paymentMethod.type,
            cardType: order.orderSummary.paymentMethod.cardType || '',
            cardNumber: order.orderSummary.paymentMethod.cardNumber || '',
          },
          subTotal: order.orderSummary.subTotal,
          shippingFee: order.orderSummary.shippingFee,
          marketplaceFee: order.orderSummary.marketplaceFee,
          taxes: order.orderSummary.taxes,
          total: order.orderSummary.total,
        }
      : undefined,
  }));

  const totalPages = data?.pagination?.totalPages || 1;

  // No orders state
  if (!transformedOrders.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-gray-600 font-semibold mb-2">No orders found</p>
        <p className="text-gray-500 text-sm">You don't have any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Orders Table */}
      <OrdersTable
        title="Orders"
        orders={transformedOrders}
        onViewDetails={handleViewOrderDetails}
      />
      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SellerOrdersPage;
