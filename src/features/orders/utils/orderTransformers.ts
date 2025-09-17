/**
 * Order transformation utilities
 * These functions transform API order data to the format expected by the UI components
 */

export interface TransformedOrder {
  id: string;
  customer: {
    id: string;
    displayName: string;
    email: string;
    avatar: string;
  };
  seller: {
    id: string;
    displayName: string;
    email: string;
    avatar: string;
  };
  driver?: {
    id: string;
    displayName: string;
    email: string;
    avatar: string;
  };
  products: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    deliveryDate?: string;
    image?: string;
  }>;
  date: string;
  amount: number;
  status: string;
  orderSummary?: {
    formattedPickupAddress?: string;
    formattedShippingAddress?: string;
    pickupAddress?: any;
    shippingAddress: any;
    proofOfDelivery?: string;
    deliveryMessage?: string;
    paymentMethod: {
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
}

/**
 * Transform a single order from API format to UI format
 * @param order - Raw order data from API
 * @returns Transformed order data for UI components
 */
export function transformOrder(order: any): TransformedOrder {
  return {
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
    seller: {
      id: order.seller?.userRef?._id || '',
      displayName: order.seller?.userRef?.displayName || 'Seller',
      email: order.seller?.userRef?.email || '',
      avatar: order.seller?.userRef?.avatar || '',
    },
    products: order.products.map((p: any) => ({
      id: p.id,
      title: p.title,
      quantity: p.quantity,
      price: p.price,
      deliveryDate: p.deliveryDate,
      image: p.image,
    })),
    date: order.createdAt,
    amount: order.amount,
    status: order.status,
    orderSummary: order.orderSummary
      ? {
          formattedPickupAddress: order.orderSummary.formattedPickupAddress,
          formattedShippingAddress: order.orderSummary.formattedShippingAddress,
          pickupAddress: order.orderSummary.pickupAddress,
          shippingAddress: order.orderSummary.shippingAddress,
          proofOfDelivery: order.orderSummary.proofOfDelivery || '',
          deliveryMessage: order.orderSummary.deliveryMessage,
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
  };
}

/**
 * Transform multiple orders from API format to UI format
 * @param orders - Array of raw order data from API
 * @returns Array of transformed order data for UI components
 */
export function transformOrders(orders: any[]): TransformedOrder[] {
  return orders.length>0 ? orders?.map(transformOrder) : [];
}
