import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { orderService, OrderFilters, Order } from '../services/orderService';
import { queryClient } from '@/lib/queryClient';

export const useOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.getOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSellerOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['seller-orders', filters],
    queryFn: () => orderService.getSellerOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDriverOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['driver-orders', filters],
    queryFn: () => orderService.getDriverDeliveries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useOrderByIdQuery = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['my-orders', filters],
    queryFn: () => orderService.getMyOrders(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverDeliveriesQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['driver-deliveries', filters],
    queryFn: () => orderService.getDriverDeliveries(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrderStatsQuery = (period?: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: ['order-stats', period],
    queryFn: () => orderService.getOrderStats(period),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (data) => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    },
  });
};

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      orderService.cancelOrder(orderId, reason),
    onSuccess: (data) => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    },
  });
};

export const useAssignDriver = () => {
  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      orderService.assignDriver(orderId, driverId),
    onSuccess: (data) => {
      toast.success('Driver assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign driver');
    },
  });
};

export const useMarkAsDelivered = () => {
  return useMutation({
    mutationFn: ({ orderId, proofOfDelivery }: { orderId: string; proofOfDelivery?: string }) =>
      orderService.markAsDelivered(orderId, proofOfDelivery),
    onSuccess: (data) => {
      toast.success('Order marked as delivered');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark order as delivered');
    },
  });
};
