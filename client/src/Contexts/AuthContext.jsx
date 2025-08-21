// Enhanced AuthContext.jsx - Better redirect handling
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient.jsx';
import { userAPI } from '../API/userAPI.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Core auth state only (identity + session)
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [initialSessionProcessed, setInitialSessionProcessed] = useState(false);
  
  // Enhanced redirect handling with better persistence
  const [pendingRedirect, setPendingRedirect] = useState(null);

  // Unified auth change handler
  const handleAuthChange = useCallback(async (event, session) => {
    console.groupCollapsed(`Auth Event: ${event}`);
    console.log('Session:', session);
    console.log('Pending redirect:', pendingRedirect);
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
          isAdmin: false,
          profileCompleted: session.user.user_metadata?.profile_completed ?? false,
        });
        
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        resetAuthState();
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setError(error.message);
    }
  }, [supabaseSession, pendingRedirect]);
 
  // Reset all auth state
  const resetAuthState = useCallback(() => {
    setSupabaseSession(null);
    setUser(null);
    setError(null);
    setPendingRedirect(null);
    // Clear localStorage as well
    try {
      localStorage.removeItem('auth_pending_redirect');
    } catch (e) {
      console.warn('Could not clear redirect from localStorage:', e);
    }
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

  // Enhanced redirect management with validation
  const setPendingRedirectAfterAuth = useCallback((redirectData) => {
    if (!redirectData || typeof redirectData !== 'object') {
      console.warn('Invalid redirect data provided:', redirectData);
      return;
    }

    const redirect = {
      path: redirectData.path || '/premium/join',
      reason: redirectData.reason || 'subscription_flow',
      timestamp: Date.now(),
      ...redirectData
    };
    
    console.log('Setting pending redirect:', redirect);
    
    // Store in both state and localStorage for persistence
    setPendingRedirect(redirect);
    try {
      localStorage.setItem('auth_pending_redirect', JSON.stringify(redirect));
    } catch (e) {
      console.warn('Could not store redirect in localStorage:', e);
    }
  }, []);

  const clearPendingRedirect = useCallback(() => {
    console.log('Clearing pending redirect');
    setPendingRedirect(null);
    try {
      localStorage.removeItem('auth_pending_redirect');
    } catch (e) {
      console.warn('Could not clear redirect from localStorage:', e);
    }
  }, []);

  const consumePendingRedirect = useCallback(() => {
    let redirect = pendingRedirect;
    
    // If no redirect in state, try localStorage
    if (!redirect) {
      try {
        const storedRedirect = localStorage.getItem('auth_pending_redirect');
        if (storedRedirect) {
          redirect = JSON.parse(storedRedirect);
        }
      } catch (e) {
        console.warn('Could not parse stored redirect:', e);
        localStorage.removeItem('auth_pending_redirect');
        return null;
      }
    }
    
    if (redirect) {
      // Validate redirect is not too old (30 minutes)
      const maxAge = 30 * 60 * 1000;
      if (Date.now() - redirect.timestamp > maxAge) {
        console.log('Redirect expired, clearing');
        clearPendingRedirect();
        return null;
      }
      
      console.log('Consuming pending redirect:', redirect);
      clearPendingRedirect();
      return redirect;
    }
    
    return null;
  }, [pendingRedirect, clearPendingRedirect]);

  // Initialize pending redirect from localStorage on mount
  useEffect(() => {
    try {
      const storedRedirect = localStorage.getItem('auth_pending_redirect');
      if (storedRedirect && !pendingRedirect) {
        const redirect = JSON.parse(storedRedirect);
        
        // Check if redirect is not too old (1 minute)
        const maxAge = 60 * 1000;
        if (Date.now() - redirect.timestamp < maxAge) {
          console.log('Restoring pending redirect from localStorage:', redirect);
          //{path: '/premium/join', reason: 'subscription_flow', timestamp: 1755689404384, planId: 1, planTitle: 'Protein Salad Plan'}
          setPendingRedirect(redirect);
        } else {
          // Clear expired redirect
          console.log('Clearing expired redirect from localStorage');
          localStorage.removeItem('auth_pending_redirect');
        }
      }
    } catch (e) {
      console.warn('Could not load redirect from localStorage:', e);
      localStorage.removeItem('auth_pending_redirect');
    }
  }, []); // Empty dependency array - only run on mount

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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
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
