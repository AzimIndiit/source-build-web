import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BreadcrumbWrapper } from '@/components/ui';
import { ordersData } from '@/features/dashboard/data/mockData';
import { OrderProductCard } from '../components/OrderProductCard';
import { OrderSummarySection } from '../components/OrderSummarySection';
import { CustomerDetailsSection } from '../components/CustomerDetailsSection';
import { BookingStatus } from '../components/BookingStatus';
import { OrderSummary } from '@/features/dashboard/types';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the order by ID (in real app, this would be an API call)
  const order = ordersData.find((o) => o.id === id) || ordersData[0];

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/seller/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Orders', href: '/seller/orders' },
    { label: `Order Details`, isCurrentPage: true },
  ];

  const handleWriteReview = () => {
    console.log('Writing review...');
  };

  const handleViewItem = () => {
    console.log('Viewing item...');
  };

  // Check if either customer or driver has added a review
  const hasCustomerReview = order.customer?.rating && order.customer.rating > 0;
  const hasDriverReview = order.driver?.rating && order.driver.rating > 0;
  const shouldShowBookingStatus = !hasCustomerReview && !hasDriverReview;
  const showHelpBtn = order.status === 'Delivered' && shouldShowBookingStatus ? true : false;
  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbWrapper items={breadcrumbItems} />

      {/* Header */}

      <OrderProductCard
        order={order}
        onViewItem={handleViewItem}
        onWriteReview={handleWriteReview}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className=" space-y-4">
          {/* Customer Details Section */}
          <CustomerDetailsSection
            customerDetails={order.customer}
            title="Customer Details"
            reviewTitle="Reviews & Rating From Customer"
          />
          {order?.driver && (
            <CustomerDetailsSection
              customerDetails={order.driver}
              title="Assign To"
              reviewTitle="Reviews & Rating From Driver"
            />
          )}

          {/* Order Timeline - Only show if no reviews exist */}
          {shouldShowBookingStatus && <BookingStatus order={order} />}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-2">
          <OrderSummarySection
            showHelpBtn={showHelpBtn}
            orderSummary={order.orderSummary as OrderSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
