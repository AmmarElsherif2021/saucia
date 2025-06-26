import { AUTH_CONFIG } from "../config/auth.js";
import { authClient } from './httpClient.jsx';

export const ordersAPI = {
  // User endpoints - require user authentication
  async getUserOrders(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/orders/user?${searchParams}`);
  },

  async getOrderById(orderId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}`);
  },

  async createOrder(orderData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/orders`, orderData);
  },

  async updateOrder(orderId, updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}`, updates);
  },

  async cancelOrder(orderId, reason = '') {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}/cancel`, {
      reason
    });
  },

  async trackOrder(orderId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}/tracking`);
  },

  async reorderItems(orderId) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}/reorder`);
  },

  // Payment related
  async processPayment(orderId, paymentData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}/payment`, paymentData);
  },

  async refundOrder(orderId, refundData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}/refund`, refundData);
  },

  // Admin endpoints - require admin authentication
  async getAllOrders(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/orders?${searchParams}`);
  },

  async updateOrderStatus(orderId, status, notes = '') {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/orders/${orderId}/status`, {
      status,
      notes
    });
  },

  async deleteOrder(orderId) {
    return await authClient.delete(`${AUTH_CONFIG.API_BASE_URL}/orders/${orderId}`);
  },

  async getOrderAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/orders?timeframe=${timeframe}`);
  },

  async exportOrders(filters = {}) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/orders/export`, filters);
  },

  async bulkUpdateOrders(updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/orders/bulk`, updates);
  },

  async getOrdersByUser(userId, queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/users/${userId}/orders?${searchParams}`);
  },

  // Delivery management
  async assignDelivery(orderId, deliveryData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/orders/${orderId}/delivery/assign`, deliveryData);
  },

  async updateDeliveryStatus(orderId, status, location = null) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/orders/${orderId}/delivery/status`, {
      status,
      location
    });
  },
};