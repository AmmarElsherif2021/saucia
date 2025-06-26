import { AUTH_CONFIG } from '../config/auth.js';
import { sessionManager } from './SessionManager.jsx';
import { authAPI } from './authAPI.jsx';
// Development mode mock data generator
const generateMockResponse = (url, options) => {
  const method = options.method || 'GET';
  
  // Admin dashboard mock
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
  
  // Users list mock
  if (url.includes('/admin/users')) {
    return {
      users: [
        { id: 'dev-user-1', email: 'user1@example.com', isAdmin: true, displayName: 'Dev User 1' },
        { id: 'dev-user-2', email: 'user2@example.com', isAdmin: false, displayName: 'Dev User 2' }
      ],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
    };
  }
  
  // Orders mock
  if (url.includes('/orders')) {
    return {
      orders: [
        { id: 'order1', total: 42.99, status: 'completed' },
        { id: 'order2', total: 19.99, status: 'pending' }
      ]
    };
  }
  
  // Default success response
  return {
    success: true,
    message: 'Development mode bypass',
    url,
    method
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  if (import.meta.env.DEV) {
    return generateMockResponse(url, options);
  }
  try {
    // 1. Get current session
    let session = sessionManager.getSession();
    if (!session) {
      // Attempt to load session from local storage directly
      const storedSession = localStorage.getItem('supabase_session');
      if (storedSession) {
        session = JSON.parse(storedSession);
        sessionManager.saveSession(session);
      }
    }
    // 2. Refresh if no session exists
    if (!session?.access_token) {
      const sessionData = await authAPI.getSession();
      if (sessionData.session) {
        sessionManager.saveSession(sessionData.session);
        session = sessionData.session; // Update local reference
      } else {
        throw new Error('No authenticated session');
      }
    }

    // 3. Make initial request
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    // 4. Handle 401 Unauthorized (token refresh)
    if (response.status === 401) {
      const refreshResult = await authAPI.refreshSession();
      
      if (refreshResult.session) {
        // Save refreshed session and update reference
        sessionManager.saveSession(refreshResult.session);
        session = refreshResult.session;
        
        // Retry request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshResult.session.access_token}`,
          },
        });
      } else {
        throw new Error('Session refresh failed');
      }
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('Error in authenticated fetch:', error);
    throw error;
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (response.status === 204 || !contentType) {
    return { success: true };
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    return { success: true, message: text };
  }

  let responseBody;
  try {
    responseBody = await response.json();
  } catch (error) {
    throw new Error('Failed to parse JSON response');
  }

  if (!response.ok) {
    const errorMessage = responseBody.error || responseBody.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseBody;
};