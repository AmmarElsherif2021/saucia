import { AUTH_CONFIG } from '../config/auth.js';
import { authClient } from './httpClient.jsx';
export const adminAPI = {
  // Admin verification
  async verifyAdmin() {
    try {
      const response = await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/verify`);
      return { isAdmin: response?.isAdmin === true };
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return { isAdmin: false, error: error.message };
    }
  },

  // Dashboard
  async getDashboard() {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/dashboard`);
  },

  // User Management
  async getAllUsers() {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/users`);
  },

  async setAdminStatus(uid, isAdmin) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/users/admin-status`, {
      uid,
      isAdmin
    });
  },

  async manageUserAccount(userId, action, reason = '') {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/users/${userId}/manage`, {
      action,
      reason
    });
  },

  // Analytics
  async getUserAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/users?timeframe=${timeframe}`);
  },

  async getOrderAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/orders?timeframe=${timeframe}`);
  },

  async getRevenueAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/revenue?timeframe=${timeframe}`);
  },

  // System
  async getSystemHealth() {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/system/health`);
  },
};

