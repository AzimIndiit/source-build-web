import api from '@/lib/axios';

export interface CheckoutData {
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
    seller?: {
      id: string;
      businessName: string;
    };
  }>;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping';
  deliveryAddress?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentCardId?: string;
  totals: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  notes?: string;
}

export interface PaymentIntentResponse {
  orderIds: string[]; // Array of order IDs for multi-seller orders
  orderNumbers: string[]; // Array of order numbers
  orders: Array<{
    id: string;
    orderNumber: string;
    amount: number;
    seller: string | null;
  }>;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  requiresAction: boolean;
  // Legacy single order support
  orderId?: string;
  orderNumber?: string;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  orderId: string;
}

export interface PaymentStatusResponse {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  transaction?: {
    id: string;
    status: string;
    processedAt?: string;
  };
}

class CheckoutService {
  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent(data: CheckoutData): Promise<PaymentIntentResponse> {
    const response = await api.post('/checkout/create-payment-intent', data);
    return response.data.data;
  }

  /**
   * Confirm payment after successful payment
   */
  async confirmPayment(data: ConfirmPaymentData) {
    const response = await api.post('/checkout/confirm-payment', data);
    return response.data.data;
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentIntentId: string, orderId: string) {
    const response = await api.post('/checkout/cancel-payment', {
      paymentIntentId,
      orderId,
    });
    return response.data;
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponse> {
    const response = await api.get(`/checkout/payment-status/${paymentIntentId}`);
    return response.data.data;
  }

  /**
   * Retry payment with a different payment method
   */
  async retryPayment(paymentIntentId: string, paymentMethodId: string) {
    const response = await api.post('/checkout/retry-payment', {
      paymentIntentId,
      paymentMethodId,
    });
    return response.data.data;
  }
}

export default new CheckoutService();
