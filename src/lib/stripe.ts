import { loadStripe, Stripe } from '@stripe/stripe-js';
import { configService } from '@/services/configService';

// Lazy load Stripe with the publishable key from backend
let stripeInstance: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance with publishable key from backend
 * This ensures we always use the correct key for the environment
 */
export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripeInstance) {
    stripeInstance = configService.getStripePublishableKey().then((key) => {
      if (!key) {
        console.error('No Stripe publishable key available');
        return null;
      }
      return loadStripe(key);
    });
  }
  return stripeInstance;
};

// Export as stripePromise for backwards compatibility with existing components
export const stripePromise = getStripe();

/**
 * Create a payment method token using Stripe
 */
export const createCardToken = async (stripe: any, cardElement: any) => {
  const { error, token } = await stripe.createToken(cardElement);

  if (error) {
    throw new Error(error.message || 'Failed to create card token');
  }

  return token;
};

/**
 * Create a payment method using Stripe
 */
export const createPaymentMethod = async (
  stripe: any,
  cardElement: any,
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: any;
  }
) => {
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  });

  if (error) {
    throw new Error(error.message || 'Failed to create payment method');
  }

  return paymentMethod;
};
