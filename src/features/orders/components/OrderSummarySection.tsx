import { Button, Card } from '@/components/ui';
import { formatCurrency } from '@/lib/helpers';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Order, orderService } from '../services/orderService';
import { toast } from 'react-hot-toast';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { fileService } from '@/features/profile/services/fileService';
import { queryClient } from '@/lib/queryClient';

interface OrderSummaryProps {
  order?: Order;
  orderSummary: {
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    pickupAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    proofOfDelivery?: string;
    deliveryMessage?: string;
    paymentMethod?: {
      type: string;
      cardType: string;
      cardNumber: string;
    };
    subTotal: number;
    shippingFee: number;
    marketplaceFee: number;
    taxes: number;
    total: number;
  };
  showHelpBtn?: boolean;
  refetch?: () => void;
}

export const OrderSummarySection: React.FC<OrderSummaryProps> = ({
  order,
  orderSummary,
  showHelpBtn,
  refetch,
}) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const handleStartDelivery = async () => {
    if (!order?._id) return;

    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, 'Out for Delivery');
      toast.success('Delivery started successfully!');
      // Invalidate the order query to refetch the updated data
      refetch?.();
    } catch (error: any) {
      console.error('Failed to start delivery:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to start delivery. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!order?._id) return;

    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    setIsUpdating(true);
    try {
      await orderService.cancelOrder(order._id, reason);
      toast.success('Order cancelled successfully!');
      // Invalidate the order query to refetch the updated data
      refetch?.();
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to cancel order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsDelivered = () => {
    setShowProofModal(true);
  };

  const handleProofSubmit = async (proofImage: File | null, message: string) => {
    console.log('order', order);
    if (!order?._id) return;

    setIsUpdating(true);
    try {
      let proofUrl = '';

      if (proofImage) {
        // Upload image to server and get URL
        const uploadResponse = await fileService.uploadFile(proofImage);
        proofUrl = uploadResponse.data.url;
      }

      await orderService.markAsDelivered(order._id, proofUrl, message);
      toast.success('Order marked as delivered successfully!');
      setShowProofModal(false);

      refetch?.();
    } catch (error: any) {
      console.error('Failed to mark order as delivered:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to mark order as delivered. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  console.log('order?.status', order?.status);
  return (
    <Card className="w-full p-4 gap-3 border-gray-200 shadow-none">
      {/* Show Pickup and Drop locations for drivers */}
      {user?.role === 'driver' ? (
        <>
          {/* Pickup Location Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Pick Up Location</h2>
            <div className="space-y-2">
              {orderSummary.pickupAddress ? (
                <>
                  <p className="text-base text-gray-600">
                    {orderSummary.pickupAddress.name}, {orderSummary.pickupAddress.phone}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {orderSummary.pickupAddress.address}, {orderSummary.pickupAddress.city},{' '}
                    {orderSummary.pickupAddress.state}, {orderSummary.pickupAddress.country},{' '}
                    {orderSummary.pickupAddress.zip}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base text-gray-600">Judy Nguyen, +1 972 234 5678</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    SCO 50-51, Sub. City Center, 2nd Floor Sector 34A, Sector 34, Chandigarh,
                    160022, punjab, India
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Drop Address Section */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Drop Address</h2>
            <div className="space-y-2">
              <p className="text-base text-gray-600">
                {orderSummary.shippingAddress.name || 'Yousef Alaoui'},{' '}
                {orderSummary.shippingAddress.phone || '+1 786 234 5678'}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city},{' '}
                {orderSummary.shippingAddress.state}, {orderSummary.shippingAddress.country},{' '}
                {orderSummary.shippingAddress.zip}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Original Shipping Address Section for other roles */
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
          <div className="space-y-2">
            <p className="text-base  text-gray-600">
              {orderSummary.shippingAddress.name}, {orderSummary.shippingAddress.phone}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city},{' '}
              {orderSummary.shippingAddress.state}, {orderSummary.shippingAddress.country},{' '}
              {orderSummary.shippingAddress.zip}
            </p>
          </div>
        </div>
      )}

      {/* Proof of Delivery Section */}
      {orderSummary.proofOfDelivery && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Proof of Delivery</h2>
            {showHelpBtn && (
              <div className="flex justify-end">
                <Button className="h-[40px] text-white">Help</Button>
              </div>
            )}
          </div>
          <div className="rounded-lg w-48 h-48 overflow-hidden border border-gray-200">
            <img
              src={orderSummary.proofOfDelivery}
              alt="Proof of delivery"
              className=" w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Order Summary Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Sub total</span>
            <span className="text-base font-medium text-gray-900">
              {formatCurrency(Number(orderSummary.subTotal))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Shipping fee</span>
            <span className="text-base font-medium text-gray-900">
              {formatCurrency(Number(orderSummary.shippingFee))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Marketplace Fee</span>
            <span className="text-base font-medium text-gray-900">
              {formatCurrency(Number(orderSummary.marketplaceFee))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Taxes</span>
            <span className="text-base font-medium text-gray-900">
              {formatCurrency(Number(orderSummary.taxes))}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total you'll receive</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(Number(orderSummary.total))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-[#98a2b3] uppercase tracking-wide">
                {orderSummary.paymentMethod?.type}
              </p>
              <p className="text-base font-medium text-gray-900">
                {orderSummary.paymentMethod?.cardNumber}
              </p>
            </div>
            <div className="text-lg font-bold text-primary italic">
              {orderSummary.paymentMethod?.cardType}
            </div>
          </div>
        </div>
      </div>

      {(order?.status === 'Processing' || order?.status === 'in-transit') &&
        user?.role === 'driver' && (
          <div className="space-y-2 flex justify-end gap-2">
            <Button
              variant={'outline'}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-[124px]"
              onClick={handleCancelDelivery}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-[124px] text-white hover:text-white"
              onClick={handleStartDelivery}
              disabled={isUpdating}
            >
              {isUpdating ? 'Starting...' : 'Start'}
            </Button>
          </div>
        )}

      {order?.status === 'Out for Delivery' && user?.role === 'driver' && (
        <div className="space-y-2 flex justify-end gap-2">
          <Button
            variant={'outline'}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 w-[124px]"
            onClick={handleCancelDelivery}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            className="w-[180px] text-white hover:text-white"
            onClick={handleMarkAsDelivered}
            disabled={isUpdating}
          >
            {isUpdating ? 'Marking...' : 'Mark as Delivered'}
          </Button>
        </div>
      )}

      <ProofOfDeliveryModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        onSubmit={handleProofSubmit}
        isSubmitting={isUpdating}
      />
    </Card>
  );
};
