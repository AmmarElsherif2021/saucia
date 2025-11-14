// src/Hooks/useOrders.js
import { useState, useCallback } from 'react';
import { ordersAPI } from '../API/orderAPI';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== CORE ORDER FETCH OPERATIONS =====
  
  const fetchUserOrders = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getUserOrders(queryParams);
      setOrders(data || []);
      return data;
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
      const data = await ordersAPI.getUserOrdersFiltered(userId);
      setOrders(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching filtered user orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getOrderById(orderId);
      return data;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderItems = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getOrderItems(orderId);
      return data;
    } catch (err) {
      console.error('Error fetching order items:', err);
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
      const data = await ordersAPI.getAllOrders(queryParams);
      setOrders(data || []);
      return data;
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
      if (!orderData.contact_phone) {
        throw new Error('Contact phone is required for instant orders');
      }
      console.log('Creating instant order with data in hook:', Object.keys(orderData));
      const newOrder = await ordersAPI.createInstantOrder(orderData);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
      }
      return newOrder;
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
      const newOrder = await ordersAPI.createUserOrder(orderData);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
      }
      return newOrder;
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
      const data = await ordersAPI.getSubscriptionOrders(subscriptionId);
      return data;
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
      const data = await ordersAPI.getNextScheduledMeal(subscriptionId);
      return data;
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
      const activatedOrder = await ordersAPI.activateOrder(orderId, orderData);
      if (activatedOrder) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? activatedOrder : order)
        );
      }
      return activatedOrder;
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
      const activatedOrder = await ordersAPI.activateNextSubscriptionOrder(subscriptionId);
      if (activatedOrder) {
        setOrders(prev => {
          const existingIndex = prev.findIndex(o => o.id === activatedOrder.id);
          if (existingIndex >= 0) {
            return prev.map(o => o.id === activatedOrder.id ? activatedOrder : o);
          }
          return [activatedOrder, ...prev];
        });
      }
      return activatedOrder;
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
      const updatedOrder = await ordersAPI.updateOrder(orderId, updates);
      if (updatedOrder) {
        setOrders(prev => 
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );
      }
      return updatedOrder;
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
      const result = await ordersAPI.cancelOrder(orderId, reason);
      if (result) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled', special_instructions: reason }
              : order
          )
        );
      }
      return result;
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
      await ordersAPI.deleteOrder(orderId);
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
      const result = await ordersAPI.updateOrderStatus(orderId, status, notes);
      if (result) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status, special_instructions: notes }
              : order
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== PAYMENT OPERATIONS =====

  const processPayment = useCallback(async (orderId, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersAPI.processPayment(orderId, paymentData);
      if (result) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  payment_status: 'paid',
                  payment_reference: paymentData.reference,
                  paid_at: new Date().toISOString()
                }
              : order
          )
        );
      }
      return result;
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
      const result = await ordersAPI.refundOrder(orderId, refundData);
      if (result) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  payment_status: 'refunded',
                  status: 'refunded',
                  special_instructions: refundData.reason
                }
              : order
          )
        );
      }
      return result;
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
      const result = await ordersAPI.assignDelivery(orderId, deliveryData);
      if (result) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  delivery_driver_id: deliveryData.driver_id,
                  status: 'out_for_delivery'
                }
              : order
          )
        );
      }
      return result;
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
      const result = await ordersAPI.updateDeliveryStatus(orderId, status, location);
      if (result) {
        const updates = { status };
        if (status === 'delivered') {
          updates.actual_delivery_date = new Date().toISOString();
        }
        
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, ...updates }
              : order
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== REAL-TIME SUBSCRIPTIONS =====

  const subscribeToUserOrders = useCallback((userId, callback) => {
    return ordersAPI.subscribeToUserOrders(userId, callback);
  }, []);

  const subscribeToOrder = useCallback((orderId, callback) => {
    return ordersAPI.subscribeToOrder(orderId, callback);
  }, []);

  const subscribeToSubscriptionOrders = useCallback((subscriptionId, callback) => {
    return ordersAPI.subscribeToSubscriptionOrders(subscriptionId, callback);
  }, []);

  const subscribeToOrderItems = useCallback((orderId, callback) => {
    return ordersAPI.subscribeToOrderItems(orderId, callback);
  }, []);

  const subscribeToOrderMeals = useCallback((orderId, callback) => {
    return ordersAPI.subscribeToOrderMeals(orderId, callback);
  }, []);

  // ===== UTILITY & HELPER FUNCTIONS =====

  // Order type validation
  const getOrderType = useCallback((order) => {
    return ordersAPI.getOrderType(order);
  }, []);

  // Filter helpers (no API calls, pure functions on local state)
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
    fetchOrderById,
    fetchOrderItems,
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