import { useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../API/authAPI';
import { AUTH_CONFIG } from '../config/auth.js';

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

const DEV_USER = {
  id: 'dev-user',
  email: 'dev@example.com',
  displayName: 'Development User',
  photoURL: 'https://via.placeholder.com/150',
  isAdmin: true,
  provider: 'development',
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const refreshLock = useRef(false);

  const clearError = useCallback(() => setAuthError(null), []);
  const clearNewUserFlag = useCallback(() => setIsNewUser(false), []);

  const initializeAuth = useCallback(async () => {
    if (isDevelopment) {
      setUser(DEV_USER);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      const sessionData = await authAPI.getSession();
      
      if (sessionData?.user) {
        const profileData = await authAPI.getUserProfile();
        
        const userData = {
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
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError(error.message || 'Failed to initialize authentication');
      authAPI.clearSession();
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [clearError]);

  const loginWithOAuth = async (provider) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await authAPI.initiateOAuth(provider);
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
      clearError();
      
      const result = await authAPI.handleOAuthCallback(code, state);
      
      if (result?.user) {
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
      clearError();
      
      await authAPI.signOut();
      setUser(null);
      setIsNewUser(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message || 'Failed to log out');
      setUser(null);
      setIsNewUser(false);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    if (refreshLock.current || isDevelopment) return;
    refreshLock.current = true;

    try {
      const result = await authAPI.refreshSession();
      
      if (result?.user) {
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
    if (isDevelopment) return true;
    
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
      clearError();
      
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
      clearError();
      
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

  // Auto-refresh session
  useEffect(() => {
    if (!user || isDevelopment) return;

    const interval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, AUTH_CONFIG.SESSION_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Clear errors when user changes
  useEffect(() => {
    if (user && authError) {
      setAuthError(null);
    }
  }, [user, authError]);

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
    clearError,
    clearNewUserFlag
  };
}
