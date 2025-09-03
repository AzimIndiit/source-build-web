import React, { useState } from 'react';

// Import modular components
import { MetricsGrid } from '../components/MetricsGrid';
import { WeeklySalesChart } from '../components/charts/WeeklySalesChart';
import { RevenueChart } from '../components/charts/RevenueChart';
import { OrdersTable } from '../components/OrdersTable';
import { OrdersTableSkeleton } from '../components/OrdersTableSkeleton';

// Import data and types
import { metricsData, weekSalesData, revenueData } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useSellerOrdersQuery } from '@/features/orders/hooks/useOrderMutations';

export const SellerDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Fetch orders from API
  const { data, isLoading, isError, error } = useSellerOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
  });
  const orders = data?.data || [];
  // Transform API orders to match dashboard Order type
  const transformedOrders = orders.map((order: any) => ({
    id: order.orderNumber || order._id,
    customer: {
      id: order.customer?.userRef?._id || '',
      displayName: order.customer?.userRef?.displayName || 'Customer',
      email: order.customer?.userRef?.email || '',
      avatar: order.customer?.userRef?.avatar || '',
    },
    driver: order.driver
      ? {
          id: order.driver?.userRef?._id || '',
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

  const handleViewAllOrders = () => {
    navigate('/seller/orders');
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/seller/orders/${orderId}`);
  };

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={metricsData} />

      {/* Charts Row - Stack on mobile, side-by-side on tablet and up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="min-h-[350px] lg:min-h-[400px]">
          <WeeklySalesChart data={weekSalesData} />
        </div>
        <div className="min-h-[350px] lg:min-h-[400px]">
          <RevenueChart
            data={revenueData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : isError ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="text-red-600 font-semibold mb-2">Error loading orders</p>
            <p className="text-gray-600 text-sm">
              {(error as any)?.response?.data?.message || 'Failed to fetch orders. Please try again.'}
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable
          title="Latest Orders"
          orders={transformedOrders}
          showSort={false}
          onViewAll={handleViewAllOrders}
          onViewDetails={handleViewOrderDetails}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
