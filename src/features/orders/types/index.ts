export interface Customer {
  name: string;
  email: string;
  avatar?: string;
}

export interface OrderProduct {
  id?: string;
  name: string;
  image?: string;
  quantity?: number;
  price?: string;
  deliveryDate?: string;
}

export interface Order {
  id: string;
  product: string; // Keep for backward compatibility
  products?: OrderProduct[]; // New field for multiple products
  customer: Customer;
  date: string;
  amount: string;
  status: 'Delivered' | 'Processing' | 'Pending' | 'Cancelled' | 'Confirm';
  quantity?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Failed';
  productImage?: string;
  deliveryDate?: string;
}

export type OrderStatus = Order['status'];
