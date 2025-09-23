import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BreadcrumbWrapper } from '@/components/ui';
import { OrderProductCard } from '../components/OrderProductCard';
import { OrderSummarySection } from '../components/OrderSummarySection';
import { CustomerDetailsSection } from '../components/CustomerDetailsSection';
import { BookingStatus } from '../components/BookingStatus';
import { OrderStatusUpdater } from '../components/OrderStatusUpdater';
import { OrderDetailsPageSkeleton } from '../components/OrderDetailsPageSkeleton';
import { OrderSummary, Customer } from '@/features/dashboard/types';
import { useOrderByIdQuery } from '../hooks/useOrderMutations';
import { useAuth } from '@/hooks/useAuth';

const OrderDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch order from API
  const { data, isLoading, isError, refetch } = useOrderByIdQuery(id || '');

  // Loading state
  if (isLoading) {
    return <OrderDetailsPageSkeleton />;
  }

  // Error state
  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button
            className="text-white hover:text-white"
            onClick={() => navigate(`/${user?.role}/orders`)}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  // Transform API data to match expected format
  const apiOrder = data.data;
  const order = {
    _id: apiOrder._id,
    id: apiOrder.orderNumber || apiOrder._id,
    seller: {
      id: apiOrder.seller?.userRef?._id || '',
      displayName: apiOrder.seller?.userRef?.displayName || 'Seller',
      email: apiOrder.seller?.userRef?.email || '',
      avatar: apiOrder.seller?.userRef?.avatar || '',
      rating: apiOrder.seller?.reviewRef?.rating,
      review: apiOrder.seller?.reviewRef?.review,
    } as Customer,
    customer: {
      id: apiOrder.customer?.userRef?._id || '',
      displayName: apiOrder.customer?.userRef?.displayName || 'Customer',
      email: apiOrder.customer?.userRef?.email || '',
      avatar: apiOrder.customer?.userRef?.avatar || '',
      rating: apiOrder.customer?.reviewRef?.rating,
      review: apiOrder.customer?.reviewRef?.review,
    } as Customer,
    driver: apiOrder.driver
      ? ({
          id: apiOrder.driver?.userRef?._id || '',
          displayName: apiOrder.driver?.userRef?.displayName || 'Driver',
          email: apiOrder.driver?.userRef?.email || '',
          avatar: apiOrder.driver?.userRef?.avatar || '',
          rating: apiOrder.driver?.reviewRef?.rating,
          review: apiOrder.driver?.reviewRef?.review,
        } as Customer)
      : undefined,
    products: apiOrder.products,
    date: apiOrder.date,
    amount: apiOrder.amount,
    status: apiOrder.status as any,
    orderSummary: apiOrder.orderSummary
      ? ({
          shippingAddress: apiOrder.orderSummary.shippingAddress,
          pickupAddress: apiOrder.orderSummary.pickupAddress || null,
          proofOfDelivery: apiOrder.orderSummary.proofOfDelivery || '',
          paymentMethod: {
            type: apiOrder.orderSummary.paymentMethod.type,
            cardType: apiOrder.orderSummary.paymentMethod.cardType || '',
            cardNumber: apiOrder.orderSummary.paymentMethod.cardNumber || '',
          },
          subTotal: apiOrder.orderSummary.subTotal,
          shippingFee: apiOrder.orderSummary.shippingFee,
          marketplaceFee: apiOrder.orderSummary.marketplaceFee,
          taxes: apiOrder.orderSummary.taxes,
          total: apiOrder.orderSummary.total,
        } as OrderSummary)
      : undefined,
  };

  const breadcrumbItems = [
    { label: 'Orders', href: user?.role === 'buyer' ? '/buying' : `/${user?.role}/orders` },
    { label: `Order Details`, isCurrentPage: true },
  ];

  const handleWriteReview = () => {
    // Refetch order data after review submission
    refetch();
  };

  const handleViewItem = ({ slug }: { slug: string }) => {
    console.log('Viewing item...');
    navigate(`/${user?.role}/products/${slug}`);
  };

  // Check if either customer or driver has added a review
  const hasCustomerReview = order.customer?.rating && order.customer.rating > 0;
  const hasDriverReview = order.driver?.rating && order.driver.rating > 0;
  const shouldShowBookingStatus = !hasCustomerReview && !hasDriverReview;
  const showHelpBtn = order.status === 'Delivered' && shouldShowBookingStatus ? true : false;
  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      {user?.role != 'admin' && <BreadcrumbWrapper items={breadcrumbItems} />}

      {/* Header with Status Updater */}
      {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <OrderStatusUpdater 
          orderId={apiOrder._id}
          currentStatus={apiOrder.status}
          onStatusUpdate={() => window.location.reload()}
        />
      </div> */}

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
          {order?.seller && user?.role === 'driver' && (
            <CustomerDetailsSection
              customerDetails={order.seller}
              title="Vendor Details"
              reviewTitle="Reviews & Rating From Vendor"
            />
          )}

          <CustomerDetailsSection
            customerDetails={order.customer}
            title="Customer Details"
            reviewTitle="Reviews & Rating From Customer"
          />
          {order?.driver && user?.role === 'seller' && (
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
            refetch={refetch}
            order={order}
            showHelpBtn={showHelpBtn}
            orderSummary={order.orderSummary as OrderSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
