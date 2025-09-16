import { useMutation, useQuery } from '@tanstack/react-query';
import checkoutService, { CheckoutData, ConfirmPaymentData } from '../services/checkoutService';
import toast from 'react-hot-toast';

/**
 * Hook to create a payment intent
 */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (data: CheckoutData) => checkoutService.createPaymentIntent(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment intent');
    },
  });
};

/**
 * Hook to confirm payment
 */
export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (data: ConfirmPaymentData) => checkoutService.confirmPayment(data),
    onSuccess: () => {
      toast.success('Payment confirmed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    },
  });
};

/**
 * Hook to cancel payment
 */
export const useCancelPayment = () => {
  return useMutation({
    mutationFn: ({ paymentIntentId, orderId }: { paymentIntentId: string; orderId: string }) =>
      checkoutService.cancelPayment(paymentIntentId, orderId),
    onSuccess: () => {
      toast.success('Payment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel payment');
    },
  });
};

/**
 * Hook to get payment status
 */
export const usePaymentStatus = (paymentIntentId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['payment-status', paymentIntentId],
    queryFn: () => checkoutService.getPaymentStatus(paymentIntentId),
    enabled: enabled && !!paymentIntentId,
    refetchInterval: enabled ? 3000 : false, // Poll every 3 seconds when enabled
  });
};

/**
 * Hook to retry payment
 */
export const useRetryPayment = () => {
  return useMutation({
    mutationFn: ({
      paymentIntentId,
      paymentMethodId,
    }: {
      paymentIntentId: string;
      paymentMethodId: string;
    }) => checkoutService.retryPayment(paymentIntentId, paymentMethodId),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to retry payment');
    },
  });
};
