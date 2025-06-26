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
      setOrders(data);
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
      setOrders(prev => [...prev, newOrder]);
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
      setOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      );
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
      // Update the order status in local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled', cancellation_reason: reason }
            : order
        )
      );
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
      setOrders(prev => [...prev, newOrder]);
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
      // Update order payment status in local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: 'paid' }
            : order
        )
      );
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
      // Update order refund status in local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: 'refunded' }
            : order
        )
      );
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
      setOrders(data);
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
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status, notes }
            : order
        )
      );
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
        // If we have user orders loaded, refresh them
        const currentUserOrders = orders.some(order => !order.isAdmin);
        if (currentUserOrders) {
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
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, delivery_assigned: true, delivery_data: deliveryData }
            : order
        )
      );
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
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, delivery_status: status, delivery_location: location }
            : order
        )
      );
      return result;
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
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
    getCancelledOrders
  };
}