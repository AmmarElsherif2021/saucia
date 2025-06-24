import { AUTH_CONFIG } from "../config/auth";
import { sessionManager } from "./SessionManager";

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
    } else {
      const textError = await response.text();
      errorMessage = textError || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  if (response.status === 204 || !contentType) {
    return { success: true };
  }

  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return { success: true, data: await response.text() };
};

export const authAPI = {
  // SINGLE POINT: All OAuth methods check development mode
  async initiateOAuthLogin(provider, customRedirectUrl = null) {
    if (AUTH_CONFIG.isDevelopment) {
      return { 
        authUrl: `${window.location.origin}/auth/callback?code=dev-code`,
        message: 'Development mode bypass'
      };
    }
    
    try {
      const redirectUrl = customRedirectUrl || AUTH_CONFIG.OAUTH_REDIRECT_URL;
      
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/oauth/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          redirectUrl,
          ...(provider === 'facebook' && {
            scopes: ['email', 'public_profile'],
            options: { prompt: 'select_account' }
          }),
          ...(provider === 'google' && {
            scopes: ['email', 'profile'],
            options: { prompt: 'select_account' }
          })
        }),
      });

      const data = await handleResponse(response);
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL received from server');
      }
      
      return data;
    } catch (error) {
      console.error(`${provider} OAuth init error:`, error);
      throw error;
    }
  },

  async handleOAuthCallback(code, state) {
    if (AUTH_CONFIG.isDevelopment) {
      sessionManager.saveSession(AUTH_CONFIG.DEV_SESSION);
      return {
        session: AUTH_CONFIG.DEV_SESSION,
        user: AUTH_CONFIG.DEV_USER,
        isNewUser: false
      };
    }
    
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/oauth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          state,
          currentUrl: window.location.href
        }),
      });

      const data = await handleResponse(response);
      
      if (data.session) {
        sessionManager.saveSession(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  },

  async getSession() {
    if (AUTH_CONFIG.isDevelopment) {
      return {
        session: AUTH_CONFIG.DEV_SESSION,
        user: AUTH_CONFIG.DEV_USER
      };
    }
    
    try {
      const currentSession = sessionManager.getSession();
      
      if (!currentSession?.access_token) {
        return { session: null, user: null };
      }

      if (sessionManager.isSessionExpired()) {
        try {
          return await this.refreshSession();
        } catch (refreshError) {
          sessionManager.clearSession();
          return { session: null, user: null };
        }
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
      });

      const data = await handleResponse(response);
      
      if (data.session) {
        sessionManager.saveSession(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('Get session error:', error);
      
      if (error.message.includes('Authorization') || error.message.includes('Unauthorized') || error.message.includes('Invalid')) {
        sessionManager.clearSession();
      }
      
      return { session: null, user: null };
    }
  },

  async refreshSession() {
    if (AUTH_CONFIG.isDevelopment) {
      return {
        session: AUTH_CONFIG.DEV_SESSION,
        user: AUTH_CONFIG.DEV_USER
      };
    }
    
    try {
      const currentSession = sessionManager.getSession();
      
      if (!currentSession?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession.refresh_token}`
        }
      });

      const data = await handleResponse(response);
      
      if (data.session) {
        sessionManager.saveSession(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('Refresh session error:', error);
      sessionManager.clearSession();
      throw error;
    }
  },

  async signOut() {
    try {
      const currentSession = sessionManager.getSession();
      
      if (!AUTH_CONFIG.isDevelopment && currentSession?.access_token) {
        const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession.access_token}`
          },
        });
        await handleResponse(response);
      }
      
      sessionManager.clearSession();      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      sessionManager.clearSession();
      return { success: true };
    }
  },

  async getUserProfile() {
    if (AUTH_CONFIG.isDevelopment) {
      return AUTH_CONFIG.DEV_USER;
    }
    
    try {
      const session = sessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  async updateUserProfile(profileData) {
    if (AUTH_CONFIG.isDevelopment) {
      return { ...AUTH_CONFIG.DEV_USER, ...profileData };
    }
    
    try {
      const session = sessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },

  async completeUserProfile(profileData) {
    if (AUTH_CONFIG.isDevelopment) {
      return { 
        success: true, 
        user: { ...AUTH_CONFIG.DEV_USER, ...profileData } 
      };
    }
    
    try {
      const session = sessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Complete user profile error:', error);
      throw error;
    }
  },

  async checkAdminStatus() {
    if (AUTH_CONFIG.isDevelopment) {
      return { is_admin: true };
    }
    
    try {
      const session = sessionManager.getSession();
      
      if (!session?.access_token) {
        return { is_admin: false };
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/admin-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Check admin status error:', error);
      return { is_admin: false };
    }
  },

  // Session management methods (no dev checks needed - handled by sessionManager)
  getCurrentSession: () => sessionManager.getSession(),
  setSession: (session) => sessionManager.saveSession(session),
  clearSession: () => sessionManager.clearSession(),
  isAuthenticated: () => sessionManager.isAuthenticated(),
  hasLocalSession: () => !!sessionManager.getSession()?.access_token,
  getAccessToken: () => sessionManager.getAccessToken(),
  isSessionExpired: () => sessionManager.isSessionExpired(),
};
