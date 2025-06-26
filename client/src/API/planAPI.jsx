import { AUTH_CONFIG } from "../config/auth.js";
import { httpClient, authClient } from './httpClient.jsx';

export const plansAPI = {
  // Public endpoints - no authentication required
  async listPlans(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/plans?${searchParams}`);
  },

  async getPlanById(planId) {
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}`);
  },

  async getFeaturedPlans() {
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/plans/featured`);
  },

  // User endpoints - require user authentication
  async getUserSubscriptions() {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions`);
  },

  async subscribeToPlan(planId, subscriptionData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}/subscribe`, subscriptionData);
  },

  async updateSubscription(subscriptionId, updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions/${subscriptionId}`, updates);
  },

  async cancelSubscription(subscriptionId, reason = '') {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions/${subscriptionId}/cancel`, {
      reason
    });
  },

  async pauseSubscription(subscriptionId, pauseData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions/${subscriptionId}/pause`, pauseData);
  },

  async resumeSubscription(subscriptionId) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions/${subscriptionId}/resume`);
  },

  async getSubscriptionHistory(subscriptionId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/plans/subscriptions/${subscriptionId}/history`);
  },

  async calculatePlanCost(planId, options = {}) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}/calculate`, options);
  },

  // Admin endpoints - require admin authentication
  async createPlan(planData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/plans`, planData);
  },

  async updatePlan(planId, updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}`, updates);
  },

  async deletePlan(planId) {
    return await authClient.delete(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}`);
  },

  async togglePlanStatus(planId, isActive) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/plans/${planId}/status`, {
      isActive
    });
  },

  async getPlanAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/plans?timeframe=${timeframe}`);
  },

  async getAllSubscriptions(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/subscriptions?${searchParams}`);
  },

  async getSubscriptionById(subscriptionId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/subscriptions/${subscriptionId}`);
  },

  async updateSubscriptionStatus(subscriptionId, status, notes = '') {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/subscriptions/${subscriptionId}/status`, {
      status,
      notes
    });
  },

  async bulkUpdateSubscriptions(updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/subscriptions/bulk`, updates);
  },

  async exportSubscriptions(filters = {}) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/subscriptions/export`, filters);
  },

  async getUserSubscriptions(userId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/users/${userId}/subscriptions`);
  },

  async setPlanFeatured(planId, isFeatured) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/plans/${planId}/featured`, {
      isFeatured
    });
  },

  async duplicatePlan(planId, newPlanData = {}) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/admin/plans/${planId}/duplicate`, newPlanData);
  },
};