// src/hooks/useOrders.js
import { useState, useCallback } from 'react';
import { 
  getAllOrders, 
  createOrder, 
  getUserOrders, 
  updateOrder, 
  deleteOrder 
} from '../API/orders';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllOrders = useCallback(async (token) => {
    setLoading(true);
    try {
      const data = await getAllOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserOrders = useCallback(async (token) => {
    setLoading(true);
    try {
      const data = await getUserOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addOrder = useCallback(async (token, orderData) => {
    setLoading(true);
    try {
      const newOrder = await createOrder(token, orderData);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyOrder = useCallback(async (token, orderId, updates) => {
    setLoading(true);
    try {
      const updatedOrder = await updateOrder(token, orderId, updates);
      setOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeOrder = useCallback(async (token, orderId) => {
    setLoading(true);
    try {
      await deleteOrder(token, orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchAllOrders,
    fetchUserOrders,
    addOrder,
    modifyOrder,
    removeOrder
  };
}