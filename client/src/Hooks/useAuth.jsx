import { useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../API/authenticate';
import { AUTH_CONFIG } from '../config/auth';
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const refreshLock = useRef(false);

  const initializeAuth = useCallback(async () => {
    // SINGLE POINT: Development mode bypass
    if (AUTH_CONFIG.isDevelopment) {
      setUser(AUTH_CONFIG.DEV_USER);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);
      
      const sessionData = await authAPI.getSession();
      
      if (sessionData?.user) {
        const profileData = await authAPI.getUserProfile();
        
        setUser({
          id: sessionData.user.id,
          email: sessionData.user.email,
          displayName: profileData.displayName || 
                      sessionData.user.user_metadata?.full_name || 
                      sessionData.user.email,
          photoURL: profileData.avatarUrl || 
                    sessionData.user.user_metadata?.avatar_url,
          isAdmin: profileData.isAdmin || false,
          provider: sessionData.user.app_metadata?.provider,
          ...profileData
        });
      } else {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
          authAPI.setSession(JSON.parse(storedSession));
          await refreshSession();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError(error.message || 'Failed to initialize authentication');
      authAPI.clearSession();
      localStorage.removeItem('supabase_session');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const loginWithOAuth = async (provider) => {
    // SINGLE POINT: Development mode bypass  
    if (AUTH_CONFIG.isDevelopment) {
      setUser(AUTH_CONFIG.DEV_USER);
      return { success: true };
    }
    
    try {
      setLoading(true);
      setAuthError(null);
      localStorage.removeItem('supabase_session');
      
      const result = await authAPI.initiateOAuthLogin(provider);
      return { success: true, ...result };
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setAuthError(error.message || `Failed to sign in with ${provider}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code, state) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const result = await authAPI.handleOAuthCallback(code, state);
      
      if (result?.user) {
        if (!result.user.displayName) {
          await authAPI.updateUserProfile({
            displayName: result.user.email.split('@')[0]
          });
        }
        
        if (result.session && !AUTH_CONFIG.isDevelopment) {
          localStorage.setItem('supabase_session', JSON.stringify(result.session));
        }

        if (result.isNewUser) {
          setIsNewUser(true);
        }

        const profileData = await authAPI.getUserProfile();
        
        const userData = {
          id: result.user.id,
          email: result.user.email,
          displayName: profileData.displayName || 
                      result.user.user_metadata?.full_name || 
                      result.user.email,
          photoURL: profileData.avatarUrl || 
                    result.user.user_metadata?.avatar_url,
          isAdmin: profileData.isAdmin || false,
          provider: result.user.app_metadata?.provider,
          ...profileData
        };
        
        setUser(userData);
        return { 
          success: true, 
          user: userData, 
          isNewUser: result.isNewUser 
        };
      }
      
      return { success: false, error: 'No user data received' };
    } catch (error) {
      console.error('OAuth callback error:', error);
      setAuthError(error.message || 'Authentication failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      await authAPI.signOut();
      setUser(null);
      setIsNewUser(false);
      
      if (!AUTH_CONFIG.isDevelopment) {
        localStorage.removeItem('supabase_session');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message || 'Failed to log out');
      authAPI.clearSession();
      
      if (!AUTH_CONFIG.isDevelopment) {
        localStorage.removeItem('supabase_session');
      }
      
      setUser(null);
      setIsNewUser(false);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    if (refreshLock.current) return;
    refreshLock.current = true;

    try {
      const result = await authAPI.refreshSession();
      
      if (result.session && result.user) {
        if (!AUTH_CONFIG.isDevelopment) {
          localStorage.setItem('supabase_session', JSON.stringify(result.session));
        }
        
        const profileData = await authAPI.getUserProfile();
        
        const userData = {
          id: result.user.id,
          email: result.user.email,
          displayName: profileData.displayName || 
                      result.user.user_metadata?.full_name || 
                      result.user.email,
          photoURL: profileData.avatarUrl || 
                    result.user.user_metadata?.avatar_url,
          isAdmin: profileData.isAdmin || false,
          provider: result.user.app_metadata?.provider,
          ...profileData
        };
        
        setUser(userData);
        return { success: true, user: userData };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Refresh session error:', error);
      
      if (error.message.includes('invalid') || 
          error.message.includes('expired')) {
        await logout();
      }
      
      return { success: false, error: error.message };
    } finally {
      refreshLock.current = false;
    }
  }, [logout]);

  const checkAdminStatus = useCallback(async () => {
    if (AUTH_CONFIG.isDevelopment) return true;
    
    try {
      if (!user) return false;
      const result = await authAPI.checkAdminStatus();
      return result.is_admin || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [user]);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const updatedProfile = await authAPI.updateUserProfile(profileData);
      
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Update profile error:', error);
      setAuthError(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (profileData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const result = await authAPI.completeUserProfile(profileData);
      
      if (result.success) {
        setUser(prev => ({
          ...prev,
          ...result.user
        }));
        setIsNewUser(false);
      }
      
      return result;
    } catch (error) {
      console.error('Complete profile error:', error);
      setAuthError(error.message || 'Failed to complete profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh session (skip in development)
  useEffect(() => {
    if (!user || AUTH_CONFIG.isDevelopment) return;

    const interval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  useEffect(() => {
    if (!isInitialized) initializeAuth();

    const handleOnline = () => {
      if (authAPI.isAuthenticated() && !user) {
        initializeAuth();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [initializeAuth, isInitialized, user]);

  useEffect(() => {
    if (user && authError) {
      setAuthError(null);
    }
  }, [user, authError]);

  // Session expiration watchdog (skip in development)
  useEffect(() => {
    if (!user || !authAPI.getCurrentSession() || AUTH_CONFIG.isDevelopment) return;

    const expiresAt = authAPI.getCurrentSession().expires_at;
    if (!expiresAt) return;

    const expiresIn = new Date(expiresAt * 1000) - Date.now();
    if (expiresIn <= 0) return;

    const timeout = setTimeout(() => {
      refreshSession();
    }, expiresIn - 60000);

    return () => clearTimeout(timeout);
  }, [user, refreshSession]);

  return {
    user,
    loading,
    authError,
    isInitialized,
    isNewUser,
    loginWithOAuth,
    handleOAuthCallback,
    logout,
    refreshSession,
    updateProfile,
    completeProfile,
    checkAdminStatus,
    clearError: () => setAuthError(null),
    clearNewUserFlag: () => setIsNewUser(false)
  };
}