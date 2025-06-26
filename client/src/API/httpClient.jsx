// api/httpClient.js
import { AUTH_CONFIG } from "../config/auth";
import { sessionManager } from "./SessionManager";

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle empty responses
  if (response.status === 204 || !contentType) {
    return { success: true };
  }

  // Parse response based on content type
  let responseBody;
  if (contentType?.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  } else {
    responseBody = { message: await response.text() };
  }

  // Handle errors
  if (!response.ok) {
    const errorMessage = responseBody.error || 
                        responseBody.message || 
                        `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseBody;
};

// Base HTTP client
export const httpClient = {
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return handleResponse(response);
  },

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};

// Authenticated HTTP client
export const authClient = {
  async request(url, options = {}) {
    // Development mode mock
    if (import.meta.env.DEV && this.shouldMock(url)) {
      return this.generateMockResponse(url, options);
    }

    let session = sessionManager.getSession();
    
    // Try to refresh session if expired or missing
    if (!session?.access_token || sessionManager.isSessionExpired()) {
      try {
        session = await this.refreshSession();
      } catch (error) {
        throw new Error('Authentication required');
      }
    }

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    };

    try {
      return await httpClient.request(url, config);
    } catch (error) {
      // Retry once on 401 after refreshing token
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        try {
          session = await this.refreshSession();
          config.headers.Authorization = `Bearer ${session.access_token}`;
          return await httpClient.request(url, config);
        } catch (refreshError) {
          sessionManager.clearSession();
          throw new Error('Authentication failed');
        }
      }
      throw error;
    }
  },

  async refreshSession() {
    const currentSession = sessionManager.getSession();
    
    if (!currentSession?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await httpClient.post(`${AUTH_CONFIG.API_BASE_URL}/auth/refresh`, null, {
      headers: {
        'Authorization': `Bearer ${currentSession.refresh_token}`
      }
    });

    if (response.session) {
      sessionManager.saveSession(response.session);
      return response.session;
    }
    
    throw new Error('Session refresh failed');
  },

  // Development mode helpers
  shouldMock(url) {
    return url.includes('/admin/') || url.includes('/users/');
  },

  generateMockResponse(url, options) {
    if (url.includes('/admin/dashboard')) {
      return {
        success: true,
        data: {
          totalUsers: 42,
          totalAdmins: 3,
          totalOrders: 100,
          activeSubscriptions: 30,
          recentUsers: [
            { id: 'user1', displayName: 'User One', createdAt: new Date().toISOString() },
            { id: 'user2', displayName: 'User Two', createdAt: new Date().toISOString() }
          ],
          metrics: {
            adminPercentage: 7.1,
            avgOrdersPerUser: 2.4,
            userGrowthRate: 12.5
          }
        }
      };
    }
    
    if (url.includes('/admin/users')) {
      return {
        users: [
          { id: 'dev-user-1', email: 'user1@example.com', isAdmin: true, displayName: 'Dev User 1' },
          { id: 'dev-user-2', email: 'user2@example.com', isAdmin: false, displayName: 'Dev User 2' }
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
      };
    }
    
    return { success: true, message: 'Development mode response' };
  },

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};