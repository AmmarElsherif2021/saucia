import { AUTH_CONFIG } from "../config/auth.js";
import { httpClient, authClient } from './httpClient.jsx';

export const itemsAPI = {
  // Public endpoints - no authentication required
  async listItems(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/items?${searchParams}`);
  },

  async getItemById(itemId) {
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/items/${itemId}`);
  },

  async getItemsBySection(section) {
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/items/section/${section}`);
  },

  // Authenticated endpoints - require admin/user authentication
  async createItem(itemData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/items`, itemData);
  },

  async updateItem(itemId, updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/items/${itemId}`, updates);
  },

  async deleteItem(itemId) {
    return await authClient.delete(`${AUTH_CONFIG.API_BASE_URL}/items/${itemId}`);
  },

  // Admin-specific endpoints
  async getItemAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/items?timeframe=${timeframe}`);
  },

  async bulkUpdateItems(updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/items/bulk`, updates);
  },

  async toggleItemAvailability(itemId, isAvailable) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/items/${itemId}/availability`, {
      isAvailable
    });
  },
};