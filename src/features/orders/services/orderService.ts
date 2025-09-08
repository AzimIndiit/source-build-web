import axiosInstance from '@/lib/axios';

export interface OrderProduct {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  deliveryDate?: string;
  productRef?: string;
  seller?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  isDefault?: boolean;
}

export interface PaymentDetails {
  type: string;
  cardType?: string;
  cardNumber?: string;
  method?: string;
  status?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface OrderSummary {
  shippingAddress: ShippingAddress;
  proofOfDelivery?: string;
  paymentMethod: PaymentDetails;
  subTotal: number;
  shippingFee: number;
  marketplaceFee: number;
  taxes: number;
  total: number;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber?: string;
  customer: {
    userRef: {
      _id: string;
      displayName: string;
      email: string;
      avatar: string;
    };
    reviewRef?: {
      rating: number;
      review: string;
      reviewedAt: string;
    };
  };
  driver?: {
    userRef: {
      _id: string;
      displayName: string;
      email: string;
      avatar: string;
    };
    reviewRef?: {
      rating: number;
      review: string;
      reviewedAt: string;
    };
  };
  products: OrderProduct[];
  date: string;
  amount: number;
  orderSummary: OrderSummary;
  status: string;
  trackingHistory?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    description?: string;
    updatedBy?: string;
  }>;
  deliveryInstructions?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  cancelReason?: string;
  refundReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  success: boolean;
  message?: string;
  data: Order[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data: Order;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderPayload {
  customer: string;
  products: {
    product: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  deliveryInstructions?: string;
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
}

export interface CancelOrderPayload {
  reason: string;
}

export interface AssignDriverPayload {
  driverId: string;
}

export interface DeliverOrderPayload {
  proofOfDelivery?: string;
}

class OrderService {
  // Get all orders with filters
  async getOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<OrdersListResponse>('/orders', { params });
    return response.data;
  }

  // Get orders for driver
  async getDriverOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<OrdersListResponse>('/orders/driver/deliveries', {
      params,
    });
    return response.data;
  }

    // Get orders for seller
    async getSellerOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
      const params = new URLSearchParams();
  
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
  
      const response = await axiosInstance.get<OrdersListResponse>('/orders/seller/orders', {
        params,
      });
      return response.data;
    }
  
  // Get single order by ID
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await axiosInstance.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    const response = await axiosInstance.get<OrderResponse>(`/orders/number/${orderNumber}`);
    return response.data;
  }

  // Create new order
  async createOrder(data: CreateOrderPayload): Promise<OrderResponse> {
    const response = await axiosInstance.post<OrderResponse>('/orders', data);
    return response.data;
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<OrderResponse> {
    const response = await axiosInstance.patch<OrderResponse>(`/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<OrderResponse> {
    const response = await axiosInstance.patch<OrderResponse>(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  }

  // Get order statistics
  async getOrderStats(period?: 'day' | 'week' | 'month' | 'year') {
    const params = period ? { period } : {};
    const response = await axiosInstance.get('/orders/stats', { params });
    return response.data;
  }

  // Get order tracking
  async getOrderTracking(orderId: string) {
    const response = await axiosInstance.get(`/orders/${orderId}/tracking`);
    return response.data;
  }

  // Assign driver to order
  async assignDriver(orderId: string, driverId: string): Promise<OrderResponse> {
    const response = await axiosInstance.patch<OrderResponse>(`/orders/${orderId}/assign-driver`, {
      driverId,
    });
    return response.data;
  }

  // Mark order as delivered
  async markAsDelivered(orderId: string, proofOfDelivery?: string): Promise<OrderResponse> {
    const response = await axiosInstance.patch<OrderResponse>(`/orders/${orderId}/deliver`, {
      proofOfDelivery,
    });
    return response.data;
  }

  // Get my orders (buyer)
  async getMyOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<OrdersListResponse>('/orders/my-orders', { params });
    return response.data;
  }

  // Get driver deliveries
  async getDriverDeliveries(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await axiosInstance.get<OrdersListResponse>('/orders/driver/deliveries', {
      params,
    });
    return response.data;
  }
}

export const orderService = new OrderService();
