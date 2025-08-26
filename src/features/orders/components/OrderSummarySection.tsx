import { Button, Card } from '@/components/ui';
import { formatCurrency } from '@/lib/helpers';
import React from 'react';

interface OrderSummaryProps {
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
    proofOfDelivery: string;
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
}

export const OrderSummarySection: React.FC<OrderSummaryProps> = ({ orderSummary, showHelpBtn }) => {
  
  return (
    <Card className="w-full p-4 gap-3 border-gray-200 shadow-none">
      {/* Shipping Address Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
        <div className="space-y-2">
            <p className="text-base  text-gray-600">{orderSummary.shippingAddress.name}, {orderSummary.shippingAddress.phone}</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city}, {orderSummary.shippingAddress.state}, {orderSummary.shippingAddress.country}, {orderSummary.shippingAddress.zip}
          </p>
        </div>
      </div>

      {/* Proof of Delivery Section */}
    {orderSummary.proofOfDelivery &&  <div className="space-y-2">
        <div className='flex justify-between items-center'>
        <h2 className="text-xl font-semibold text-gray-900">Proof of Delivery</h2>
        {showHelpBtn && <div className="flex justify-end">
        <Button className='h-[40px] text-white'>Help</Button>
      </div>}
        </div>
        <div className="rounded-lg w-48 h-48 overflow-hidden border border-gray-200">
          <img 
            src={orderSummary.proofOfDelivery} 
            alt="Proof of delivery" 
            className=" w-full h-full object-cover"
          />
        </div>
      </div>}

      {/* Order Summary Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Sub total</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(Number(orderSummary.subTotal))    }</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Shipping fee</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(Number(orderSummary.shippingFee))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Marketplace Fee</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(Number(orderSummary.marketplaceFee))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#98a2b3]">Taxes</span>
            <span className="text-base font-medium text-gray-900">{formatCurrency(Number(orderSummary.taxes))}</span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total you'll receive</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(Number(orderSummary.total))}</span>
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
              <p className="text-xs text-[#98a2b3] uppercase tracking-wide">{orderSummary.paymentMethod?.type}</p>
              <p className="text-base font-medium text-gray-900">{orderSummary.paymentMethod?.cardNumber}</p>
            </div>
            <div className="text-lg font-bold text-primary italic">
           {orderSummary.paymentMethod?.cardType}
            </div>
          </div>
        </div>
      </div>

  
    </Card>
  );
};