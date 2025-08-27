import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    _id: '1',
    userId: 'user_123',
    type: 'NEW_ORDER',
    title: 'New Order Received',
    message: "You've received a new order! Order #789465 is awaiting confirmation.",
    meta: {
      orderId: '789465',
      amount: 299.99,
      productName: 'iPhone 15 Pro',
    },
    actionUrl: '/orders/789465',
    isRead: false,
    status: 'sent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    userId: 'user_123',
    type: 'ORDER_CANCELLED',
    title: 'Order Canceled',
    message: 'Order #587465 has been canceled by the customer. Check your dashboard for details.',
    meta: {
      orderId: '587465',
      reason: 'Customer requested cancellation',
    },
    actionUrl: '/orders/587465',
    isRead: false,
    status: 'sent',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    userId: 'user_123',
    type: 'ORDER_CONFIRMED',
    title: 'Order Confirmed',
    message: 'You have successfully confirmed Order #587465. Please prepare for fulfillment.',
    meta: {
      orderId: '587465',
      confirmationTime: new Date().toISOString(),
    },
    actionUrl: '/orders/587465',
    isRead: true,
    status: 'sent',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    userId: 'user_123',
    type: 'ORDER_DELIVERED',
    title: 'Order Delivered',
    message: 'Order #587465 has been successfully delivered!',
    meta: {
      orderId: '587465',
      deliveryTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      driverName: 'John Smith',
    },
    actionUrl: '/orders/587465',
    isRead: true,
    status: 'sent',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    userId: 'user_123',
    type: 'PRODUCT_OUT_OF_STOCK',
    title: 'Out of Stock Alert',
    message: 'Your item "Lights" is out of stock. Consider restocking or removing the listing.',
    meta: {
      productName: 'Lights',
      productId: 'prod_123',
      currentStock: 0,
    },
    actionUrl: '/products/prod_123',
    isRead: true,
    status: 'sent',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    userId: 'user_123',
    type: 'PRODUCT_APPROVED',
    title: 'Product Approved',
    message: 'Your product "Lights" has been approved and is now live on the marketplace.',
    meta: {
      productName: 'Lights',
      productId: 'prod_123',
      approvalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    actionUrl: '/products/prod_123',
    isRead: true,
    status: 'sent',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '7',
    userId: 'user_123',
    type: 'PRODUCT_PRICE_UPDATE',
    title: 'Price Update Confirmed',
    message: 'Your price update for "Lights" has been successfully applied.',
    meta: {
      productName: 'Lights',
      productId: 'prod_123',
      oldPrice: 29.99,
      newPrice: 24.99,
    },
    actionUrl: '/products/prod_123',
    isRead: true,
    status: 'sent',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
