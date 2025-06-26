import { AUTH_CONFIG } from "../config/auth.js";
import { httpClient, authClient } from './httpClient.jsx';

export const mealsAPI = {
  // Public endpoints - no authentication required
  async getMeals(queryParams = {}) {
    const searchParams = new URLSearchParams(queryParams);
    try {
      const data = await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/meals?${searchParams}`);
      console.log(`Meals fetched from meals API: ${searchParams}, ${data.length || 0} meals`);
      return data;
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      throw error;
    }
  },

  async getMealById(mealId) {
    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}`);
  },

  // Authenticated endpoints - require user authentication
  async getPlanMeals(planId) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/meals/plan/${planId}`);
  },

  async getFavMealsOfClient(userId) {
    const searchParams = new URLSearchParams({
      uid: userId,
      sortBy: 'createdAt',
      sortOrder: 'descending',
    });
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/users/${userId}/meals?${searchParams}`);
  },

  async addToFavorites(mealId) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}/favorite`);
  },

  async removeFromFavorites(mealId) {
    return await authClient.delete(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}/favorite`);
  },

  async rateMeal(mealId, rating) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}/rating`, {
      rating
    });
  },

  // Admin endpoints - require admin authentication
  async createMeal(mealData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/meals`, mealData);
  },

  async updateMeal(mealId, mealData) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}`, mealData);
  },

  async deleteMeal(mealId) {
    return await authClient.delete(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}`);
  },

  async getMealAnalytics(timeframe = '30d') {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/admin/analytics/meals?timeframe=${timeframe}`);
  },

  async bulkUpdateMeals(updates) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/admin/meals/bulk`, updates);
  },

  async toggleMealAvailability(mealId, isAvailable) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/meals/${mealId}/availability`, {
      isAvailable
    });
  },

  async getMealsBySection(section) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/meals/section/${section}`);
  },
};