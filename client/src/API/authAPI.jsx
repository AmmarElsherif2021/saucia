import { AUTH_CONFIG } from '../config/auth.js';
import { httpClient } from './httpClient.jsx';
import { sessionManager } from './SessionManager.jsx';

export const authAPI = {
  // OAuth Authentication
  async initiateOAuth(provider, customRedirectUrl = null) {
    const redirectUrl = customRedirectUrl || AUTH_CONFIG.OAUTH_REDIRECT_URL;
    
    const response = await httpClient.post(`${AUTH_CONFIG.API_BASE_URL}/auth/oauth/init`, {
      provider,
      redirectUrl,
      ...(provider === 'google' && {
        scopes: ['email', 'profile'],
        options: { prompt: 'select_account' }
      }),
      ...(provider === 'facebook' && {
        scopes: ['email', 'public_profile'],
        options: { prompt: 'select_account' }
      })
    });

    if (response.authUrl) {
      window.location.href = response.authUrl;
    } else {
      throw new Error('No authorization URL received');
    }

    return response;
  },

  async handleOAuthCallback(code, state) {
    const response = await httpClient.post(`${AUTH_CONFIG.API_BASE_URL}/auth/oauth/callback`, {
      code,
      state,
      currentUrl: window.location.href
    });

    if (response.session) {
      sessionManager.saveSession(response.session);
    }

    return response;
  },

  // Session Management
  async getSession() {
    const currentSession = sessionManager.getSession();
    
    if (!currentSession?.access_token) {
      return { session: null, user: null };
    }

    if (sessionManager.isSessionExpired()) {
      try {
        const refreshedSession = await this.refreshSession();
        return { session: refreshedSession, user: refreshedSession.user };
      } catch (error) {
        sessionManager.clearSession();
        return { session: null, user: null };
      }
    }

    try {
      const response = await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });

      if (response.session) {
        sessionManager.saveSession(response.session);
      }

      return response;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        sessionManager.clearSession();
      }
      return { session: null, user: null };
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

  async signOut() {
    const currentSession = sessionManager.getSession();
    
    try {
      if (currentSession?.access_token) {
        await httpClient.post(`${AUTH_CONFIG.API_BASE_URL}/auth/signout`, null, {
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`
          }
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      sessionManager.clearSession();
    }

    return { success: true };
  },

  // User Profile Management
  async getUserProfile() {
    const session = sessionManager.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
  },

  async updateUserProfile(profileData) {
    const session = sessionManager.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return await httpClient.put(`${AUTH_CONFIG.API_BASE_URL}/auth/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
  },

  async completeUserProfile(profileData) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Debug logging
    console.log('completeUserProfile called with:', profileData);
    console.log('Token available:', !!token);
    console.log('Token preview:', token.substring(0, 20) + '...');
    console.log('API URL:', `${AUTH_CONFIG.API_BASE_URL}/auth/complete-profile`);

    try {
      const response = await httpClient.post(
        `${AUTH_CONFIG.API_BASE_URL}/auth/complete-profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Profile completion response:', response);
      return response;
    } catch (error) {
      console.error('Profile completion API error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        token: token ? 'Present' : 'Missing'
      });
      throw error;
    }
  },

  async checkAdminStatus() {
    const session = sessionManager.getSession();
    
    if (!session?.access_token) {
      return { is_admin: false };
    }

    try {
      return await httpClient.get(`${AUTH_CONFIG.API_BASE_URL}/auth/admin-status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
    } catch (error) {
      console.error('Check admin status error:', error);
      return { is_admin: false };
    }
  },

   // Utility methods
   getCurrentSession: () => ({ 
    access_token: localStorage.getItem('jwt') 
  }),
  getAccessToken: () => localStorage.getItem('jwt'),
  isAuthenticated: () => !!localStorage.getItem('jwt'),
  clearSession: () => localStorage.removeItem('jwt'),
  isSessionExpired: () => {
    const token = localStorage.getItem('jwt');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};