// src/hooks/useOrders.js
import { useState, useCallback } from 'react';
import { ordersAPI } from '../API/orderAPI';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User order operations
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

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await ordersAPI.createOrder(orderData);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
      }
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const trackOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const trackingData = await ordersAPI.trackOrder(orderId);
      return trackingData;
    } catch (err) {
      console.error('Error tracking order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderItems = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await ordersAPI.reorderItems(orderId);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
      }
      return newOrder;
    } catch (err) {
      console.error('Error reordering items:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Payment operations
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

  // Admin operations
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

  const getOrderAnalytics = useCallback(async (timeframe = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await ordersAPI.getOrderAnalytics(timeframe);
      return analytics;
    } catch (err) {
      console.error('Error fetching order analytics:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const exportData = await ordersAPI.exportOrders(filters);
      return exportData;
    } catch (err) {
      console.error('Error exporting orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateOrders = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersAPI.bulkUpdateOrders(updates);
      // Refresh orders after bulk update
      if (updates.length > 0) {
        // Check if we have user orders or admin orders loaded
        const hasUserOrders = orders.some(order => order.user_id);
        if (hasUserOrders) {
          await fetchUserOrders();
        } else {
          await fetchAllOrders();
        }
      }
      return result;
    } catch (err) {
      console.error('Error bulk updating orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orders, fetchUserOrders, fetchAllOrders]);

  const getOrdersByUser = useCallback(async (userId, queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getOrdersByUser(userId, queryParams);
      return data;
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delivery management
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

  // Helper functions for filtering orders
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const getCompletedOrders = useCallback(() => {
    return orders.filter(order => order.status === 'completed');
  }, [orders]);

  const getCancelledOrders = useCallback(() => {
    return orders.filter(order => order.status === 'cancelled');
  }, [orders]);

  const getOrdersWithStatus = useCallback((statuses) => {
    return orders.filter(order => statuses.includes(order.status));
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
    
    // User operations
    fetchUserOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    cancelOrder,
    trackOrder,
    reorderItems,
    
    // Payment operations
    processPayment,
    refundOrder,
    
    // Admin operations
    fetchAllOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderAnalytics,
    exportOrders,
    bulkUpdateOrders,
    getOrdersByUser,
    
    // Delivery operations
    assignDelivery,
    updateDeliveryStatus,
    
    // Helper functions
    getOrdersByStatus,
    getPendingOrders,
    getCompletedOrders,
    getCancelledOrders,
    getOrdersWithStatus,
    getOrdersInDateRange,
    getOrdersWithPaymentStatus
  };
}