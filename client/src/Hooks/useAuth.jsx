import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { unifiedUserAPI } from '../API/userAPI';
import { supabase } from '../../supabaseClient.jsx';

export function useAuth() {
  // Core auth state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extended user data state
  const [userPlan, setUserPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [orders, setOrders] = useState([]);

  // Helper function to fetch unified user data
  const fetchUnifiedUserData = useCallback(async (userId) => {
    try {
      // Fetch from user_profiles table (contains extended profile data)
      const profileData = await unifiedUserAPI.getUserProfile(userId);      
      // Combine JWT user data with profile data
      const token = localStorage.getItem('jwt');
      const jwtUser = token ? jwtDecode(token) : null;
      
      return {
        // JWT data (auth-related)
        id: jwtUser?.id || userId,
        email: jwtUser?.email,
        displayName: jwtUser?.displayName,
        isAdmin: jwtUser?.isAdmin || false,
        profile_completed: jwtUser?.profile_completed || profileData?.profile_completed || false,        
        // Profile data (from user_profiles table)
        ...profileData,        
        // Ensure consistent naming
        profileCompleted: jwtUser?.profile_completed || profileData?.profile_completed || false,
      };
    } catch (error) {
      console.error('Error fetching unified user data:', error);
      // Return minimal user data from JWT if profile fetch fails
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const jwtUser = jwtDecode(token);
          return {
            id: jwtUser.id,
            email: jwtUser.email,
            displayName: jwtUser.displayName,
            isAdmin: jwtUser.isAdmin || false,
            profile_completed: jwtUser.profile_completed || false,
            profileCompleted: jwtUser.profile_completed || false,
          };
        } catch (jwtError) {
          console.error('Invalid JWT token:', jwtError);
          localStorage.removeItem('jwt');
          return null;
        }
      }
      return null;
    }
  }, []);

  // Fetch user plan details
  const fetchUserPlanDetails = useCallback(async (planId) => {
    if (!planId) return null;
    
    try {
      setPlanLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Plan fetch error:', error);
      return null;
    } finally {
      setPlanLoading(false);
    }
  }, []);

  // Initialize user from JWT and fetch complete profile
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('jwt');
      
      if (token) {
        try {
          const jwtUser = jwtDecode(token);
          
          // Check if token is expired
          if (jwtUser.exp * 1000 < Date.now()) {
            localStorage.removeItem('jwt');
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          // Fetch unified user data
          const unifiedUser = await fetchUnifiedUserData(jwtUser.id);
          setUser(unifiedUser);
          
        } catch (error) {
          console.error('Error initializing user:', error);
          localStorage.removeItem('jwt');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    initializeUser();
  }, [fetchUnifiedUserData]);

  // Load user plan when user subscription changes
  useEffect(() => {
    if (user?.subscription?.planId) {
      fetchUserPlanDetails(user.subscription.planId).then(setUserPlan);
    } else {
      setUserPlan(null);
    }
  }, [user?.subscription?.planId, fetchUserPlanDetails]);

  // Set default address
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setUserAddress(defaultAddress);
    } else {
      setUserAddress(null);
    }
  }, [user?.addresses]);

  // Authentication methods
  const loginWithGoogle = useCallback(() => {
    unifiedUserAPI.initiateGoogleAuth();
  }, []);

  const handleToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    
    try {
      const jwtUser = jwtDecode(token);
      const unifiedUser = await fetchUnifiedUserData(jwtUser.id);
      setUser(unifiedUser);
      return unifiedUser;
    } catch (error) {
      console.error('Error handling token:', error);
      localStorage.removeItem('jwt');
      throw error;
    }
  }, [fetchUnifiedUserData]);

  const logout = useCallback(async () => {
    try {
      // Call API logout using unifiedUserAPI
      await unifiedUserAPI.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('jwt');
      setUser(null);
      setUserPlan(null);
      setUserAddress(null);
      setOrders([]);
    }
  }, []);

  // Profile management
  const completeProfile = useCallback(async (profileData) => {
    try {
      const token = localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Completing profile with data:', profileData);
      
      const response = await unifiedUserAPI.completeUserProfile(profileData);
      
      if (response.token) {
        localStorage.setItem('jwt', response.token);
        const updatedUser = await fetchUnifiedUserData(response.user?.id || user?.id);
        setUser(updatedUser);
        console.log('Profile completed successfully:', updatedUser);
        return updatedUser;
      }

      throw new Error('Profile completion failed - no token in response');
    } catch (error) {
      console.error('Profile completion error:', error);
      setError(error.message);
      throw error;
    }
  }, [fetchUnifiedUserData, user?.id]);

  const updateUserProfile = useCallback(async (userId, updateData) => {
    if (!userId) throw new Error('User ID is required');

    try {
      setError(null);
      const result = await unifiedUserAPI.updateUserProfile(userId, updateData);

      // Refresh unified user data
      const updatedUser = await fetchUnifiedUserData(userId);
      setUser(updatedUser);

      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError(error.message);
      throw error;
    }
  }, [fetchUnifiedUserData]);

  const updateUserSubscription = useCallback(async (subscriptionData) => {
    if (!user?.id) return null;

    try {
      setError(null);
      const updateData = {
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
      };

      await unifiedUserAPI.updateUserProfile(user.id, updateData);

      // Update local state immediately
      const updatedUser = {
        ...user,
        subscription: subscriptionData,
      };
      setUser(updatedUser);

      // Fetch new plan details
      const newPlan = await fetchUserPlanDetails(subscriptionData.planId);
      setUserPlan(newPlan);

      return { user: updatedUser, plan: newPlan };
    } catch (error) {
      console.error('Error updating user subscription:', error);
      setError(error.message);
      throw error;
    }
  }, [user, fetchUserPlanDetails]);

  // Orders management
  const refreshOrders = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      setError(null);
      // You'll need to implement fetchUserOrders in your API
      // const fetchedOrders = await orderAPI.fetchUserOrders(user.id);
      
      // For now, return empty array - implement based on your orders API
      const fetchedOrders = [];
      
      const formattedOrders = fetchedOrders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
        items: (o.items || []).map(i => ({
          itemId: i.item_id,
          quantity: i.quantity,
          price: i.price
        }))
      }));

      setOrders(formattedOrders);
      return formattedOrders;
    } catch (error) {
      console.error('Error refreshing orders:', error);
      setError(error.message);
      return [];
    }
  }, [user?.id]);

  // Helper functions
  const requiresProfileCompletion = useCallback(() => {
    return user && !user.profile_completed && !user.profileCompleted;
  }, [user]);

  const isAuthenticated = useCallback(() => {
    return unifiedUserAPI.isAuthenticated();
  }, []);

  const isSessionExpired = useCallback(() => {
    return unifiedUserAPI.isSessionExpired();
  }, []);

  return {
    // User data
    user,
    userPlan,
    userAddress,
    orders,
    
    // Loading states
    isLoading,
    planLoading,
    
    // Error state
    error,
    
    // Authentication methods
    loginWithGoogle,
    handleToken,
    logout,
    
    // Profile methods
    completeProfile,
    updateUserProfile,
    updateUserSubscription,
    refreshOrders,
    
    // Helper methods
    requiresProfileCompletion,
    isAuthenticated,
    isSessionExpired,
  };
}