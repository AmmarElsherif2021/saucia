// api/userAPI.js
import { AUTH_CONFIG } from "../config/auth";
import { httpClient, authClient } from "./httpClient.jsx";

export const userAPI = {
  // Public endpoints
  async login(credentials) {
    return await httpClient.post(`${AUTH_CONFIG.API_BASE_URL}/user/login`, credentials);
  },

  // Authenticated endpoints
  async getUserInfo(uid) {
    return await authClient.get(`${AUTH_CONFIG.API_BASE_URL}/users/${uid}`);
  },

  async createUser(userData) {
    return await authClient.post(`${AUTH_CONFIG.API_BASE_URL}/users`, userData);
  },

  async updateUserProfile(uid, userData) {
    return await authClient.put(`${AUTH_CONFIG.API_BASE_URL}/users/${uid}`, userData);
  },
};
