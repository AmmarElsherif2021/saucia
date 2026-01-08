// src/Hooks/useOrders.jsx
import { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

// Edge function base URL - FIXED: Use import.meta.env instead of process.env
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to call edge functions
  const callEdgeFunction = async (functionName, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${FUNCTIONS_URL}/${functionName}${options.query || ''}`, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // FIXED: Use import.meta.env
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Request failed');
    }

    return result;
  };

  // ===== CORE ORDER FETCH OPERATIONS =====
  
// Fixed fetchUserOrders function

const fetchUserOrders = useCallback(async (userId = null, queryParams = {}) => {
  setLoading(true);
  setError(null);
  try {
    const params = new URLSearchParams();
    
    // KEY FIX: Set filter_type based on whether userId is provided
    if (userId) {
      params.append('user_id', userId);
      params.append('filter_type', 'filtered'); // Use 'filtered' when specifying a user
    } else {
      params.append('filter_type', 'user'); // Use 'user' for current authenticated user
    }
    
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.from_date) params.append('from_date', queryParams.from_date);
    if (queryParams.to_date) params.append('to_date', queryParams.to_date);

    const result = await callEdgeFunction('list-orders', {
      query: `?${params.toString()}`
    });

    setOrders(result.orders || []);
    return result.orders;
  } catch (err) {
    console.error('Error fetching user orders:', err);
    setError(err);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  const fetchUserOrdersFiltered = useCallback(async (userId = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ filter_type: 'filtered' });
      if (userId) params.append('user_id', userId);

      const result = await callEdgeFunction('list-orders', {
        query: `?${params.toString()}`
      });

      setOrders(result.orders || []);
      return result.orders;
    } catch (err) {
      console.error('Error fetching filtered user orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLastUserOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ filter_type: 'user' });
      //if (userId) params.append('user_id', userId);
      //if (subscriptionId) params.append('subscription_id', subscriptionId);
      const result = await callEdgeFunction('track-last-order', {
        query: `?${params.toString()}`
      });

      setOrders(result.orders || []);
      return result.orders;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllOrders = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ filter_type: 'admin' });
      if (queryParams.status) params.append('status', queryParams.status);
      if (queryParams.user_id) params.append('user_id', queryParams.user_id);
      if (queryParams.from_date) params.append('from_date', queryParams.from_date);
      if (queryParams.to_date) params.append('to_date', queryParams.to_date);
      
      const result = await callEdgeFunction('list-orders', {
        query: `?${params.toString()}`
      });

      setOrders(result.orders || []);
      return result.orders;
    } catch (err) {
      console.error('Error fetching all orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ORDER CREATION OPERATIONS =====

  const createInstantOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      if (!orderData.contact_phone || !orderData.user_id) {
        throw new Error('Contact phone is required for instant orders');
      }

      const result = await callEdgeFunction('process-order', {
        method: 'POST',
        body: {
          ...orderData,
          subscription_id: null
        }
      });

      if (result.order) {
        setOrders(prev => [result.order, ...prev]);
      }
      return result.order;
    } catch (err) {
      console.error('Error creating instant order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('process-order', {
        method: 'POST',
        body: orderData
      });

      if (result.order) {
        setOrders(prev => [result.order, ...prev]);
      }
      return result.order;
    } catch (err) {
      console.error('Error creating user order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== SUBSCRIPTION ORDER OPERATIONS =====

  const fetchSubscriptionOrders = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('subscription-orders', {
        query: `?subscription_id=${subscriptionId}&action=list`
      });

      return result.orders;
    } catch (err) {
      console.error('Error fetching subscription orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextScheduledMeal = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('subscription-orders', {
        query: `?subscription_id=${subscriptionId}&action=next_meal`
      });

      return result.next_meal;
    } catch (err) {
      console.error('Error fetching next scheduled meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateOrder = useCallback(async (orderId, orderData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('subscription-orders', {
        method: 'PATCH',
        query: `?subscription_id=${orderData.subscription_id}`,
        body: {
          order_id: orderId,
          scheduled_delivery_date: orderData.scheduled_delivery_date
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error activating order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateNextSubscriptionOrder = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('subscription-orders', {
        method: 'PATCH',
        query: `?subscription_id=${subscriptionId}`,
        body: {
          activate_next: true
        }
      });

      if (result.order) {
        setOrders(prev => {
          const existingIndex = prev.findIndex(o => o.id === result.order.id);
          if (existingIndex >= 0) {
            return prev.map(o => o.id === result.order.id ? result.order : o);
          }
          return [result.order, ...prev];
        });
      }
      return result.order;
    } catch (err) {
      console.error('Error activating next subscription order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ORDER UPDATE & MANAGEMENT =====

  const updateOrder = useCallback(async (orderId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('manage-order', {
        method: 'PATCH',
        query: `?order_id=${orderId}`,
        body: updates
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('manage-order', {
        method: 'PATCH',
        query: `?order_id=${orderId}`,
        body: {
          status: 'cancelled',
          special_instructions: reason
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await callEdgeFunction('manage-order', {
        method: 'DELETE',
        query: `?order_id=${orderId}`
      });

      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('manage-order', {
        method: 'PATCH',
        query: `?order_id=${orderId}`,
        body: {
          status,
          special_instructions: notes
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== PAYMENT OPERATIONS =====
  // NOTE: These functions reference 'order-payment' which doesn't exist yet
  // You need to either create this function or handle payments differently

  const processPayment = useCallback(async (orderId, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      // Option 1: Use manage-order to update payment status
      const result = await callEdgeFunction('manage-order', {
        method: 'PATCH',
        query: `?order_id=${orderId}`,
        body: {
          payment_status: 'completed',
          payment_method: paymentData.method || 'card',
          skipAuth: true // Admin operation
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundOrder = useCallback(async (orderId, refundData) => {
    setLoading(true);
    setError(null);
    try {
      // Use manage-order to update payment status to refunded
      const result = await callEdgeFunction('manage-order', {
        method: 'PATCH',
        query: `?order_id=${orderId}`,
        body: {
          payment_status: 'refunded',
          special_instructions: refundData.reason,
          skipAuth: true // Admin operation
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error processing refund:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== DELIVERY OPERATIONS =====

  const assignDelivery = useCallback(async (orderId, deliveryData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('order-delivery', {
        method: 'PATCH',
        body: {
          order_id: orderId,
          action: 'assign',
          driver_id: deliveryData.driver_id
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error assigning delivery:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliveryStatus = useCallback(async (orderId, status, location = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callEdgeFunction('order-delivery', {
        method: 'PATCH',
        body: {
          order_id: orderId,
          action: 'update_status',
          status,
          location
        }
      });

      if (result.order) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? result.order : order)
        );
      }
      return result.order;
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== REAL-TIME SUBSCRIPTIONS (Keep using Supabase directly) =====

  const subscribeToUserOrders = useCallback((userId, callback) => {
    return supabase
      .channel(`user-${userId}-orders-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }, []);

  const subscribeToOrder = useCallback((orderId, callback) => {
    return supabase
      .channel(`order-${orderId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  }, []);

  const subscribeToSubscriptionOrders = useCallback((subscriptionId, callback) => {
    return supabase
      .channel(`subscription-${subscriptionId}-orders-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `subscription_id=eq.${subscriptionId}`
        },
        callback
      )
      .subscribe();
  }, []);

  const subscribeToOrderItems = useCallback((orderId, callback) => {
    return supabase
      .channel(`order-${orderId}-items-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  }, []);

  const subscribeToOrderMeals = useCallback((orderId, callback) => {
    return supabase
      .channel(`order-${orderId}-meals-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_meals',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  }, []);

  // ===== UTILITY & HELPER FUNCTIONS =====

  const getOrderType = useCallback((order) => {
    if (order.subscription_id) {
      return {
        type: 'subscription',
        isValid: order.subscription_meal_index !== null && order.user_id !== null
      };
    } else if (order.user_id) {
      return {
        type: 'user',
        isValid: true
      };
    } else {
      return {
        type: 'instant',
        isValid: order.contact_phone !== null
      };
    }
  }, []);

  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getInstantOrders = useCallback(() => {
    return orders.filter(order => !order.user_id && !order.subscription_id && order.contact_phone);
  }, [orders]);

  const getUserOnlyOrders = useCallback(() => {
    return orders.filter(order => order.user_id && !order.subscription_id);
  }, [orders]);

  const getSubscriptionOrders = useCallback(() => {
    return orders.filter(order => order.subscription_id);
  }, [orders]);

  const getOrdersInDateRange = useCallback((startDate, endDate) => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }, [orders]);

  const getOrdersWithPaymentStatus = useCallback((paymentStatus) => {
    return orders.filter(order => order.payment_status === paymentStatus);
  }, [orders]);

  return {
    // State
    orders,
    loading,
    error,
    
    // Fetch operations
    fetchUserOrders,
    fetchUserOrdersFiltered,
    fetchLastUserOrder,
    fetchAllOrders,
    fetchSubscriptionOrders,
    fetchNextScheduledMeal,
    
    // Create operations
    createInstantOrder,
    createUserOrder,
    
    // Update operations
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    activateOrder,
    activateNextSubscriptionOrder,
    
    // Payment operations
    processPayment,
    refundOrder,
    
    // Delivery operations
    assignDelivery,
    updateDeliveryStatus,
    
    // Real-time subscriptions
    subscribeToUserOrders,
    subscribeToOrder,
    subscribeToSubscriptionOrders,
    subscribeToOrderItems,
    subscribeToOrderMeals,
    
    // Utility functions
    getOrderType,
    getOrdersByStatus,
    getInstantOrders,
    getUserOnlyOrders,
    getSubscriptionOrders,
    getOrdersInDateRange,
    getOrdersWithPaymentStatus
  };
}