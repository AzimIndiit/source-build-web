export interface MetricData {
  title: string;
  value: string;
  color: string;
  icon: any;
  bgColor: string;
}

export interface SalesData {
  day: string;
  sales: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface Customer {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  rating?: number;
  review?: string;
}

export interface OrderProduct {
  id: string;
  title: string;
  quantity?: number;
  price?: number;
  deliveryDate?: string;
  image?: string;
  color?: string;
  productRef?: {
    slug: string;
  };
}

export interface OrderSummary {
  formattedPickupAddress?: string;
  formattedShippingAddress?: string;
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
  proofOfDelivery: string;
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
}

export interface Order {
  id: string;
  customer: Customer;
  driver?: Customer;
  seller?: Customer;
  date: string;
  amount: number;
  status: 'Delivered' | 'Processing' | 'Pending' | 'Cancelled' | 'Out for Delivery' | 'In Transit';
  products?: OrderProduct[];
  orderSummary?: OrderSummary;
}

export type OrderStatus = Order['status'];
