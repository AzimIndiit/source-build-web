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
  name: string;
  email: string;
  avatar?: string;
}

export interface Order {
  id: string;
  product: string;
  customer: Customer;
  date: string;
  amount: string;
  status: 'Delivered' | 'Processing' | 'Pending' | 'Cancelled';
}

export type OrderStatus = Order['status'];