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

  // Unified auth change handler
  const handleAuthChange = useCallback(async (event, session) => {
    console.groupCollapsed(`Auth Event: ${event}`);
    console.log('Current session:', supabaseSession);
    console.log('New session:', session);
    console.groupEnd();
    
    try {
      if (session?.user) {
        if (supabaseSession?.access_token === session.access_token) {
          console.log('Session already processed, skipping');
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

  // Helper functions
  const requiresProfileCompletion = useCallback(() => {
    return user && !user.profileCompleted;
  }, [user]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!supabaseSession;
  }, [user, supabaseSession]);

  // Context value - only core auth state and methods
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
    isAuthenticated
    
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

export const useUser = () => useAuthContext();
export const useAuth = () => useAuthContext();

