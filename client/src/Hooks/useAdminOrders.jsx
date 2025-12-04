import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import * as adminInstantOrdersAPI from '../API/adminInstantOrdersAPIs';
/**
 * Custom hook for managing instant orders with TanStack Query
 * Provides real-time updates via Supabase subscriptions
 */

// Query keys factory
export const orderKeys = {
  all: ['instant-orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
  stats: () => [...orderKeys.all, 'stats'],
};

/**
 * Hook to fetch and manage instant orders list with real-time updates
 * @param {Object} options - Query options (status, paymentStatus, dateRange, searchQuery, etc.)
 * @param {Object} config - React Query config options
 */
export const useInstantOrders = (options = {}, config = {}) => {
  const queryClient = useQueryClient();

  // Fetch orders query
  const query = useQuery({
    queryKey: orderKeys.list(options),
    queryFn: () => adminInstantOrdersAPI.getAllInstantOrders(options),
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...config,
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔴 [useInstantOrders] Setting up real-time subscription');

    const subscription = adminInstantOrdersAPI.subscribeToInstantOrders((payload) => {
      console.log('📡 [useInstantOrders] Real-time update received:', payload.eventType);

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });

      // Optimistically update detail queries if we have the data
      if (payload.eventType === 'UPDATE' && payload.new) {
        queryClient.setQueryData(
          orderKeys.detail(payload.new.id),
          payload.new
        );
      }

      // Remove from cache if deleted
      if (payload.eventType === 'DELETE' && payload.old) {
        queryClient.removeQueries({
          queryKey: orderKeys.detail(payload.old.id),
        });
      }
    });

    return () => {
      console.log('🔴 [useInstantOrders] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
};

/**
 * Hook to fetch single order details
 * @param {string} orderId - Order ID
 * @param {Object} config - React Query config options
 */
export const useInstantOrderDetails = (orderId, config = {}) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => adminInstantOrdersAPI.getInstantOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 60000,
    ...config,
  });
};

/**
 * Hook to fetch order statistics
 * @param {Object} config - React Query config options
 */
export const useInstantOrderStats = (config = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => adminInstantOrdersAPI.getInstantOrderStats(),
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refetch every minute
    ...config,
  });

  // Set up real-time subscription for stats updates
  useEffect(() => {
    console.log('📊 [useInstantOrderStats] Setting up stats subscription');

    const subscription = adminInstantOrdersAPI.subscribeToInstantOrders(() => {
      // Invalidate stats when any order changes
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
};

/**
 * Mutation hook to update order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, newStatus, notes }) =>
      adminInstantOrdersAPI.updateInstantOrderStatus(orderId, newStatus, notes),
    onMutate: async ({ orderId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });

      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(orderKeys.detail(orderId));

      
      // Optimistically update
      queryClient.setQueryData(orderKeys.detail(orderId), (old) => ({
        ...old,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }));

      return { previousOrder };
    },
    onError: (err, { orderId }, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), context.previousOrder);
      }
    },
    onSuccess: (data, { orderId }) => {
      // Update the specific order detail
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

/**
 * Mutation hook to update delivery date
 */
export const useUpdateDeliveryDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, newDate }) =>
      adminInstantOrdersAPI.updateInstantOrderDeliveryDate(orderId, newDate),
    onSuccess: (data, { orderId }) => {
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

/**
 * Mutation hook to update payment status
 */
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }) =>
      adminInstantOrdersAPI.updateInstantOrderPaymentStatus(orderId, paymentStatus),
    onSuccess: (data, { orderId }) => {
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

/**
 * Mutation hook for bulk status updates
 */
export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderIds, newStatus }) =>
      adminInstantOrdersAPI.bulkUpdateInstantOrderStatus(orderIds, newStatus),
    onSuccess: () => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

/**
 * Mutation hook to delete/cancel order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => adminInstantOrdersAPI.deleteInstantOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
};

/**
 * Hook to manually refetch all order data
 */
export const useRefreshOrders = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    console.log('🔄 [useRefreshOrders] Manually refreshing all order data');
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() }),
    ]);
  }, [queryClient]);
};

/**
 * Utility hook to get cached order by ID without fetching
 */
export const useCachedOrder = (orderId) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(orderKeys.detail(orderId));
};

/**
 * Hook to prefetch order details
 */
export const usePrefetchOrderDetails = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (orderId) => {
      queryClient.prefetchQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: () => adminInstantOrdersAPI.getInstantOrderDetails(orderId),
      });
    },
    [queryClient]
  );
};