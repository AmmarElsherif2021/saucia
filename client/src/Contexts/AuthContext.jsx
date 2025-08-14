import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient.jsx';
import { userAPI } from '../API/userAPI.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Core auth state only (identity + session)
  const [user, setUser] = useState(null);
  /* expected user example:
  {id: 'e0...', 
       email: 'a...@gmail.com', 
       displayName: 'am...', 
      avatarUrl: "https://l...",
      profileCompleted: false
      }
  */
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [initialSessionProcessed, setInitialSessionProcessed] = useState(false);
  
  // Enhanced redirect handling instead of simple isJoiningPremium
  const [pendingRedirect, setPendingRedirect] = useState(null);
  /* pendingRedirect structure:
  {
    path: '/premium/join',
    planId: 'plan_123',
    selectedTerm: 'medium',
    timestamp: Date.now(),
    reason: 'subscription_flow' // or 'profile_completion', etc.
  }
  */

  // Unified auth change handler
  const handleAuthChange = useCallback(async (event, session) => {
    console.groupCollapsed(`Auth Event: ${event}`);
    console.groupEnd();
    
    try {
      if (session?.user) {
        if (supabaseSession?.access_token === session.access_token) {
          return;
        }
        
        setSupabaseSession(session);
        
        // Set minimal user identity - extended data via TanStack hooks
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || '',
          avatarUrl: session.user.user_metadata?.avatar_url || '',
          isAdmin: false, // Will be updated via profile query
          profileCompleted: false, // Will be updated via profile query
        });
        
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        resetAuthState();
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setError(error.message);
    }
  }, [supabaseSession]);
 
  // Reset all auth state
  const resetAuthState = useCallback(() => {
    setSupabaseSession(null);
    setUser(null);
    setError(null);
    setPendingRedirect(null); // Clear any pending redirects on logout
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await handleAuthChange('INITIAL', session);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error.message);
        setUser(null);
      } finally {
        setIsLoading(false);
        setInitialSessionProcessed(true);
      }
    };

    initializeAuth();
  }, [handleAuthChange]);

  // Listen for Supabase auth changes
  useEffect(() => {
    if (!initialSessionProcessed) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;
        await handleAuthChange(event, session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleAuthChange, initialSessionProcessed]);

  // Profile completion - updates core user state
  const completeProfile = useCallback(async (profileData) => {
    try {
      if (!user?.id) throw new Error('No user found');
      
      const updatedProfile = await userAPI.completeUserProfile(user.id, profileData);
      
      setUser(prev => ({
        ...prev,
        ...updatedProfile,
        profileCompleted: true
      }));
      
      return updatedProfile;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [user]);

  // Auth methods
  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Enhanced redirect management
  const setPendingRedirectAfterAuth = useCallback((redirectData) => {
    const redirect = {
      ...redirectData,
      timestamp: Date.now()
    };
    
    // Store in both state and localStorage for persistence across page reloads
    setPendingRedirect(redirect);
    try {
      localStorage.setItem('auth_pending_redirect', JSON.stringify(redirect));
    } catch (e) {
      console.warn('Could not store redirect in localStorage:', e);
    }
  }, []);

  const clearPendingRedirect = useCallback(() => {
    setPendingRedirect(null);
    try {
      localStorage.removeItem('auth_pending_redirect');
    } catch (e) {
      console.warn('Could not clear redirect from localStorage:', e);
    }
  }, []);

  const consumePendingRedirect = useCallback(() => {
    const redirect = pendingRedirect;
    if (redirect) {
      clearPendingRedirect();
      return redirect;
    }
    return null;
  }, [pendingRedirect, clearPendingRedirect]);

  // Initialize pending redirect from localStorage on mount
  useEffect(() => {
    try {
      const storedRedirect = localStorage.getItem('auth_pending_redirect');
      if (storedRedirect) {
        const redirect = JSON.parse(storedRedirect);
        
        // Check if redirect is not too old (e.g., 30 minutes)
        const maxAge = 30 * 60 * 1000; // 30 minutes
        if (Date.now() - redirect.timestamp < maxAge) {
          setPendingRedirect(redirect);
        } else {
          // Clear expired redirect
          localStorage.removeItem('auth_pending_redirect');
        }
      }
    } catch (e) {
      console.warn('Could not load redirect from localStorage:', e);
      localStorage.removeItem('auth_pending_redirect');
    }
  }, []);

  // Helper functions
  const requiresProfileCompletion = useCallback(() => {
    return user && !user.profileCompleted;
  }, [user]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!supabaseSession;
  }, [user, supabaseSession]);

  // Context value - enhanced with redirect management
  const contextValue = {
    // Core auth state
    user,
    isLoading,
    error,
    supabaseSession,

    // Auth methods
    loginWithGoogle,
    logout,
    completeProfile,

    // Helper functions
    requiresProfileCompletion,
    isAuthenticated,

    // Enhanced redirect handling
    pendingRedirect,
    setPendingRedirectAfterAuth,
    clearPendingRedirect,
    consumePendingRedirect,
    
    // Backward compatibility
    get isJoiningPremium() {
      return pendingRedirect?.reason === 'subscription_flow';
    },
    setIsJoiningPremium: (value) => {
      if (value) {
        setPendingRedirectAfterAuth({
          path: '/premium/join',
          reason: 'subscription_flow'
        });
      } else {
        clearPendingRedirect();
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = () => useAuthContext();