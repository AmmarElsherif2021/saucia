// Enhanced AuthContext.jsx - Fixed profileCompleted logic
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
  
  // Current subscription state
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  // Function to fetch user profile from database
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      const profile = await userAPI.getUserProfile(userId);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Function to fetch user's active subscription
  const fetchCurrentSubscription = useCallback(async (userId) => {
    if (!userId) {
      setCurrentSubscription(null);
      return;
    }
    
    setIsSubscriptionLoading(true);
    try {
      const subscription = await userAPI.getUserActiveSubscription(userId);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      setCurrentSubscription(null);
    } finally {
      setIsSubscriptionLoading(false);
    }
  }, []);

  // Enhanced auth handler that fetches profile from database
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
        
        // Fetch the actual user profile from the database
        const userProfile = await fetchUserProfile(session.user.id);
        
        if (userProfile) {
          // Set user state with data from user_profiles table
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: userProfile.display_name || session.user.user_metadata?.full_name || '',
            avatarUrl: userProfile.avatar_url || session.user.user_metadata?.avatar_url || '',
            isAdmin: userProfile.is_admin || false,
            profileCompleted: userProfile.profile_completed || false,
            language: userProfile.language || 'en',
            timezone: userProfile.timezone || 'Asia/Riyadh',
            // Include other relevant fields from user_profiles
            phoneNumber: userProfile.phone_number,
            age: userProfile.age,
            gender: userProfile.gender,
            loyaltyPoints: userProfile.loyalty_points || 0,
            accountStatus: userProfile.account_status || 'active'
          });
        } else {
          // Fallback to auth data if profile doesn't exist yet
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || '',
            avatarUrl: session.user.user_metadata?.avatar_url || '',
            isAdmin: false,
            profileCompleted: false, // Default to false if no profile exists
            language: 'en',
            timezone: 'Asia/Riyadh'
          });
        }
        
        setError(null);
        
        // Fetch user's subscription when authenticated
        await fetchCurrentSubscription(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        resetAuthState();
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setError(error.message);
    }
  }, [supabaseSession, pendingRedirect, fetchUserProfile, fetchCurrentSubscription]);

  // Reset all auth state
  const resetAuthState = useCallback(() => {
    setSupabaseSession(null);
    setUser(null);
    setError(null);
    setPendingRedirect(null);
    setCurrentSubscription(null);
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
        
        const maxAge = 60 * 1000;
        if (Date.now() - redirect.timestamp < maxAge) {
          console.log('Restoring pending redirect from localStorage:', redirect);
          setPendingRedirect(redirect);
        } else {
          console.log('Clearing expired redirect from localStorage');
          localStorage.removeItem('auth_pending_redirect');
        }
      }
    } catch (e) {
      console.warn('Could not load redirect from localStorage:', e);
      localStorage.removeItem('auth_pending_redirect');
    }
  }, []);

  // Profile completion - updates core user state by fetching fresh profile
  const completeProfile = useCallback(async (profileData) => {
    try {
      if (!user?.id) throw new Error('No user found');
      
      // Use the userAPI completeUserProfile method
      const updatedProfile = await userAPI.completeUserProfile(user.id, profileData);
      
      // Fetch the updated profile to ensure we have all current data
      const freshProfile = await fetchUserProfile(user.id);
      
      if (freshProfile) {
        // Update the user state with fresh data from database
        setUser(prev => ({
          ...prev,
          displayName: freshProfile.display_name,
          phoneNumber: freshProfile.phone_number,
          age: freshProfile.age,
          gender: freshProfile.gender,
          language: freshProfile.language,
          timezone: freshProfile.timezone,
          profileCompleted: freshProfile.profile_completed
        }));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Profile completion error:', error);
      setError(error.message);
      throw error;
    }
  }, [user, fetchUserProfile]);

  // Refresh user profile data
  const refreshUserProfile = useCallback(async () => {
    if (user?.id) {
      const freshProfile = await fetchUserProfile(user.id);
      if (freshProfile) {
        setUser(prev => ({
          ...prev,
          displayName: freshProfile.display_name,
          avatarUrl: freshProfile.avatar_url,
          isAdmin: freshProfile.is_admin,
          profileCompleted: freshProfile.profile_completed,
          language: freshProfile.language,
          timezone: freshProfile.timezone,
          phoneNumber: freshProfile.phone_number,
          age: freshProfile.age,
          gender: freshProfile.gender,
          loyaltyPoints: freshProfile.loyalty_points
        }));
      }
    }
  }, [user, fetchUserProfile]);

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

  // Refresh both subscription and profile data
  const refreshUserData = useCallback(() => {
    if (user?.id) {
      refreshUserProfile();
      fetchCurrentSubscription(user.id);
    }
  }, [user, refreshUserProfile, fetchCurrentSubscription]);

  // Context value - enhanced with proper profile handling
  const contextValue = {
    // Core auth state
    user,
    isLoading,
    error,
    supabaseSession,

    // Subscription state
    currentSubscription,
    isSubscriptionLoading,

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
    
    // Data refresh methods
    refreshSubscription: () => user?.id && fetchCurrentSubscription(user.id),
    refreshUserProfile,
    refreshUserData,
    
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