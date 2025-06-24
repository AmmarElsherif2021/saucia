// src/API/admin.js
import { fetchWithAuth } from "./fetchWithAuth";
import { AUTH_CONFIG } from "../config/auth";
const API_BASE_URL = AUTH_CONFIG.API_BASE_URL;
// Verify if the current user has admin privileges
export const verifyAdmin = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/verify`);
    return { isAdmin: response?.isAdmin === true };
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return { isAdmin: false, error: error.message };
  }
};

// Update all endpoints to match backend routes
export const getAllUsers = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/users`)
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const setAdminStatus = async (uid, isAdmin) => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/users/admin-status`, {
      method: 'POST',
      body: JSON.stringify({ uid, isAdmin }),
    })
  } catch (error) {
    console.error('Error setting admin status:', error)
    throw error
  }
}

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/dashboard`)
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    throw error
  }
}


// Get user analytics
export const getUserAnalytics = async (timeframe = '30d') => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/analytics/users?timeframe=${timeframe}`)
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    throw error
  }
}

// Get order analytics
export const getOrderAnalytics = async (timeframe = '30d') => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/analytics/orders?timeframe=${timeframe}`)
  } catch (error) {
    console.error('Error fetching order analytics:', error)
    throw error
  }
}

// Get revenue analytics
export const getRevenueAnalytics = async (timeframe = '30d') => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/analytics/revenue?timeframe=${timeframe}`)
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    throw error
  }
}

// Manage user account (suspend, activate, delete)
export const manageUserAccount = async (userId, action, reason = '') => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}/manage`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    })
  } catch (error) {
    console.error('Error managing user account:', error)
    throw error
  }
}

// Get system health status
export const getSystemHealth = async () => {
  try {
    return await fetchWithAuth(`${API_BASE_URL}/admin/system/health`)
  }
  catch (error) {
    console.error('Error fetching system health:', error)
    throw error
  }
}