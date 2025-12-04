import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../supabaseClient.jsx';
import { userAPI } from '../API/userAPI.jsx';

const AuthContext = createContext(null);

// Constants
const REDIRECT_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const REDIRECT_STORAGE_KEY = 'auth_pending_redirect';

// Helper: Safe localStorage operations
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Storage set failed for ${key}:`, e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Storage remove failed for ${key}:`, e);
    }
  }
};

// Helper: Map database profile to user state
const mapProfileToUser = (session, profile) => {
  const base = {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.user_metadata?.full_name || '',
    avatarUrl: session.user.user_metadata?.avatar_url || '',
    isAdmin: false,
    profileCompleted: false,
    language: 'en',
    timezone: 'Asia/Riyadh',
  };

  if (!profile) return base;

  return {
    ...base,
    displayName: profile.display_name || base.displayName,
    avatarUrl: profile.avatar_url || base.avatarUrl,
    isAdmin: profile.is_admin || false,
    profileCompleted: profile.profile_completed || false,
    language: profile.language || 'en',
    timezone: profile.timezone || 'Asia/Riyadh',
    phoneNumber: profile.phone_number,
    phoneVerified: profile.phone_verified || false,
    age: profile.age,
    gender: profile.gender,
    loyaltyPoints: profile.loyalty_points || 0,
    accountStatus: profile.account_status || 'active',
  };
};

export const AuthProvider = ({ children }) => {
  // Core state
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  
  // Redirect state
  const [pendingRedirect, setPendingRedirect] = useState(() => {
    const stored = storage.get(REDIRECT_STORAGE_KEY);
    if (stored && Date.now() - stored.timestamp < REDIRECT_MAX_AGE_MS) {
      return stored;
    }
    storage.remove(REDIRECT_STORAGE_KEY);
    return null;
  });

  // Ref to track processed session to avoid duplicate processing
  const processedTokenRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════════════

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      return await userAPI.getUserProfile(userId);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  }, []);

  const fetchSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscription(null);
      return;
    }
    setIsSubscriptionLoading(true);
    try {
      const sub = await userAPI.getUserActiveSubscription(userId);
      setSubscription(sub);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setSubscription(null);
    } finally {
      setIsSubscriptionLoading(false);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // Reset Auth State (MUST BE DEFINED BEFORE processSession)
  // ═══════════════════════════════════════════════════════════════════

  const resetAuthState = useCallback(() => {
    console.log('🔄 Resetting auth state');
    processedTokenRef.current = null;
    setSession(null);
    setUser(null);
    setError(null);
    setSubscription(null);
    setPendingRedirect(null);
    setIsLoading(false); // Ensure loading is stopped
    storage.remove(REDIRECT_STORAGE_KEY);
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // Session Handling - KEY FIX HERE
  // ═══════════════════════════════════════════════════════════════════

  const processSession = useCallback(async (newSession) => {
    console.log('🔄 processSession called', {
      hasSession: !!newSession,
      userId: newSession?.user?.id,
      currentToken: processedTokenRef.current?.slice(0, 20) + '...',
      newToken: newSession?.access_token?.slice(0, 20) + '...'
    });

    if (!newSession?.user) {
      console.log('❌ No session or user, clearing state');
      setUser(null);
      setSession(null);
      setSubscription(null);
      setIsLoading(false); // ✅ KEY FIX: Set loading to false
      return;
    }

    // Skip if already processed this token
    if (processedTokenRef.current === newSession.access_token) {
      console.log('⏭️ Already processed this token, skipping');
      setIsLoading(false); // ✅ KEY FIX: Ensure loading is false
      return;
    }
    
    console.log('✅ Processing new session');
    processedTokenRef.current = newSession.access_token;

    setSession(newSession);
    console.log('📝 Session set, fetching profile...');
    
    try {
      const profile = await fetchUserProfile(newSession.user.id);
      console.log('👤 Profile fetched', {
        hasProfile: !!profile,
        profileCompleted: profile?.profile_completed,
        displayName: profile?.display_name
      });
      
      const mappedUser = mapProfileToUser(newSession, profile);
      console.log('🗺️ User mapped', {
        id: mappedUser.id,
        email: mappedUser.email,
        profileCompleted: mappedUser.profileCompleted
      });
      
      setUser(mappedUser);
      setError(null);
      setIsLoading(false); // ✅ KEY FIX: Set loading to false after successful processing
      console.log('✅ User state updated successfully, isLoading set to false');
      
      // Fetch subscription in background
      fetchSubscription(newSession.user.id);
    } catch (error) {
      console.error('❌ Error in processSession:', error);
      // Still set basic user even if profile fetch fails
      setUser(mapProfileToUser(newSession, null));
      setError(error.message);
      setIsLoading(false); // ✅ KEY FIX: Set loading to false even on error
    }
  }, [fetchUserProfile, fetchSubscription]);

  // ═══════════════════════════════════════════════════════════════════
  // Auth Methods
  // ═══════════════════════════════════════════════════════════════════

  const authMethods = useMemo(() => ({
    // Google OAuth
    loginWithGoogle: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },

    // Anonymous (for guest checkout, etc.)
    loginAnonymously: async () => {
      try {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },

    // Send OTP to phone
    sendOTP: async (phone) => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: { channel: 'sms' }
        });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },

    // Verify OTP
    verifyOTP: async (phone, token) => {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms'
        });
        if (error) throw error;
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },

    // Resend OTP
    resendOTP: async (phone) => {
      try {
        const { error } = await supabase.auth.resend({
          type: 'sms',
          phone
        });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },

    // Logout
    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        resetAuthState();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
  }), [resetAuthState]);

  // ═══════════════════════════════════════════════════════════════════
  // Profile Management
  // ═══════════════════════════════════════════════════════════════════

  const completeProfile = useCallback(async (profileData) => {
    if (!user?.id) throw new Error('No authenticated user');
    
    try {
      await userAPI.completeUserProfile(user.id, profileData);
      const fresh = await fetchUserProfile(user.id);
      
      if (fresh) {
        setUser(prev => ({
          ...prev,
          displayName: fresh.display_name,
          phoneNumber: fresh.phone_number,
          phoneVerified: fresh.phone_verified || false,
          age: fresh.age,
          gender: fresh.gender,
          language: fresh.language,
          timezone: fresh.timezone,
          profileCompleted: fresh.profile_completed,
        }));
      }
      return fresh;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, fetchUserProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    const fresh = await fetchUserProfile(user.id);
    if (fresh) {
      setUser(prev => mapProfileToUser({ user: prev }, fresh));
    }
  }, [user, fetchUserProfile]);

  const refreshUserData = useCallback(() => {
    if (!user?.id) return;
    refreshUserProfile();
    fetchSubscription(user.id);
  }, [user, refreshUserProfile, fetchSubscription]);

  // ═══════════════════════════════════════════════════════════════════
  // Redirect Management
  // ═══════════════════════════════════════════════════════════════════

  const redirectHelpers = useMemo(() => ({
    setPendingRedirect: (data) => {
      if (!data || typeof data !== 'object') {
        console.warn('Invalid redirect data:', data);
        return;
      }
      const redirect = {
        path: data.path || '/premium/join',
        reason: data.reason || 'subscription_flow',
        timestamp: Date.now(),
        ...data
      };
      setPendingRedirect(redirect);
      storage.set(REDIRECT_STORAGE_KEY, redirect);
    },

    clearPendingRedirect: () => {
      setPendingRedirect(null);
      storage.remove(REDIRECT_STORAGE_KEY);
    },

    consumePendingRedirect: () => {
      const redirect = pendingRedirect || storage.get(REDIRECT_STORAGE_KEY);
      
      if (!redirect) return null;
      
      if (Date.now() - redirect.timestamp > REDIRECT_MAX_AGE_MS) {
        setPendingRedirect(null);
        storage.remove(REDIRECT_STORAGE_KEY);
        return null;
      }
      
      setPendingRedirect(null);
      storage.remove(REDIRECT_STORAGE_KEY);
      return redirect;
    }
  }), [pendingRedirect]);

  // ═══════════════════════════════════════════════════════════════════
  // Initialization & Listeners - ENHANCED
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthContext initializing');

    const init = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          throw error;
        }
        
        console.log('📊 Initial session result', {
          hasSession: !!initialSession,
          userId: initialSession?.user?.id,
          email: initialSession?.user?.email
        });
        
        if (mounted) {
          if (initialSession) {
            console.log('✅ Processing initial session');
            await processSession(initialSession);
          } else {
            console.log('ℹ️ No initial session found');
            setIsLoading(false); // ✅ KEY FIX: Set loading to false when no session
          }
          isInitializedRef.current = true;
        }
      } catch (err) {
        console.error('❌ Auth init error:', err);
        if (mounted) {
          setError(err.message);
          setIsLoading(false); // ✅ KEY FIX: Set loading to false on error
        }
      }
    };

    init();

    console.log('👂 Setting up auth state listener');
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        console.log('🔔 Auth state changed', { event, hasSession: !!newSession });
        
        if (event === 'SIGNED_OUT') {
          resetAuthState();
        } else if (newSession && event !== 'INITIAL_SESSION') {
          // Fire and forget - don't await the processSession
          processSession(newSession).catch(error => {
            console.error('Error in processSession:', error);
          });
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up AuthContext');
      mounted = false;
      authSub.unsubscribe();
    };
  }, [processSession, resetAuthState]);

  // ═══════════════════════════════════════════════════════════════════
  // Context Value
  // ═══════════════════════════════════════════════════════════════════

  const contextValue = useMemo(() => ({
    // State
    user,
    session,
    isLoading,
    error,
    subscription,
    isSubscriptionLoading,
    pendingRedirect,

    // Auth methods
    ...authMethods,

    // Profile
    completeProfile,
    refreshUserProfile,
    refreshUserData,
    refreshSubscription: () => user?.id && fetchSubscription(user.id),

    // Redirect helpers
    ...redirectHelpers,

    // Computed helpers
    isAuthenticated: () => !!user && !!session,
    requiresProfileCompletion: () => !!user && !user.profileCompleted,
    
    // Backward compatibility
    supabaseSession: session,
    currentSubscription: subscription,
    setPendingRedirectAfterAuth: redirectHelpers.setPendingRedirect,
    loginWithGoogle: authMethods.loginWithGoogle,
    get isJoiningPremium() {
      return pendingRedirect?.reason === 'subscription_flow';
    },
    setIsJoiningPremium: (value) => {
      if (value) {
        redirectHelpers.setPendingRedirect({ path: '/premium/join', reason: 'subscription_flow' });
      } else {
        redirectHelpers.clearPendingRedirect();
      }
    }
  }), [
    user, session, isLoading, error, subscription, 
    isSubscriptionLoading, pendingRedirect,
    authMethods, completeProfile, refreshUserProfile, 
    refreshUserData, fetchSubscription, redirectHelpers
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const useAuth = useAuthContext;