import { AUTH_CONFIG } from '../config/auth.js';
import { httpClient, authClient } from './httpClient.jsx';

export const unifiedUserAPI = {
  // Authentication methods
  async initiateGoogleAuth() {
    window.location.href = `${AUTH_CONFIG.API_BASE_URL}/auth/google`;
  },

  async handleAuthCallback(token) {
    localStorage.setItem('jwt', token);
    return this.getCurrentUser();
  },

  async signOut() {
    try {
      await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/auth/signout`);
    } catch (error) {
      console.error('Sign out API error:', error);
    } finally {
      localStorage.removeItem('jwt');
    }
  },

  // User profile methods - combines data from both tables
  async getCurrentUser() {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      // Get basic auth info from JWT
      const jwtPayload = JSON.parse(atob(token.split('.')[1]));
      
      // Get extended profile from user_profiles table
      const profileData = await this.getUserProfile(jwtPayload.id);
      
      return {
        // JWT data (from users table)
        id: jwtPayload.id,
        email: jwtPayload.email,
        displayName: jwtPayload.displayName,
        isAdmin: jwtPayload.isAdmin || false,
        
        // Profile data (from user_profiles table)
        ...profileData,
        
        // Unified profile completion status
        profile_completed: jwtPayload.profile_completed || profileData?.profile_completed || false,
        profileCompleted: jwtPayload.profile_completed || profileData?.profile_completed || false,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getUserProfile(userId) {
    try {
      return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/users/${userId}`);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const result = await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/users/${userId}`, profileData);
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async completeUserProfile(profileData) {
    try {
      console.log('Completing profile with data:', profileData);
      
      const response = await authClient.post(
        `${AUTH_CONFIG.API_BASE_URL}/auth/complete-profile`,
        profileData
      );

      console.log('Profile completion response:', response);
      
      // If a new token is returned, update localStorage
      if (response.token) {
        localStorage.setItem('jwt', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Profile completion API error:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/users`, userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Subscription management
  async updateSubscription(userId, subscriptionData) {
    return this.updateUserProfile(userId, {
      subscription: subscriptionData,
      updatedAt: new Date().toISOString(),
    });
  },

  // Address management
  async updateAddress(userId, addressData) {
    return this.updateUserProfile(userId, {
      addresses: addressData,
      updatedAt: new Date().toISOString(),
    });
  },

  // Health profile management
  async updateHealthProfile(userId, healthData) {
    return this.updateUserProfile(userId, {
      healthProfile: healthData,
      updatedAt: new Date().toISOString(),
    });
  },

  // Admin operations
  async checkAdminStatus() {
    try {
      return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/auth/admin-status`);
    } catch (error) {
      console.error('Check admin status error:', error);
      return { is_admin: false };
    }
  },

  async setAdminStatus(userId, isAdmin) {
    try {
      return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/users/${userId}`, {
        isAdmin,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error setting admin status:', error);
      throw error;
    }
  },

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  getAccessToken() {
    return localStorage.getItem('jwt');
  },

  isSessionExpired() {
    const token = localStorage.getItem('jwt');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  clearSession() {
    localStorage.removeItem('jwt');
  },
};