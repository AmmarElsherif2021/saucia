import { useState, useCallback } from 'react';
import { plansAPI } from '../API/planAPI';
import { supabase } from '../../supabaseClient';
/**
 * Custom hook for managing subscription plans
 * Aligned with the plansAPI implementation
 */
export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [additiveItems, setAdditiveItems] = useState([]);

// Add this new function to fetch additives
const fetchAdditiveItems = useCallback(async (additiveIds) => {
  if (!additiveIds || additiveIds.length === 0) {
    setAdditiveItems([]);
    return [];
  }
  
  setLoading(true);
  setError(null);
  try {
    const { data: additiveData } = await supabase
      .from('items')
      .select('*')
      .in('id', additiveIds)
      .eq('is_available', true);
    
    const items = additiveData || [];
    setAdditiveItems(items);
    return items;
  } catch (err) {
    console.error('Error fetching additive items:', err);
    setError(err);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  // Public plan operations (no auth required)
  const fetchPlans = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.listPlans(queryParams);
      setPlans(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlanById = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getPlanById(planId);
      return data;
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getFeaturedPlans();
      setPlans(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching featured plans:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // User subscription operations (require auth)
  const fetchUserSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getUserSubscriptions();
      setSubscriptions(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching user subscriptions:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (subscriptionId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.updateSubscription(subscriptionId, updates);
      if (result) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { ...sub, ...updates }
              : sub
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.cancelSubscription(subscriptionId, reason);
      if (result) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { 
                  ...sub, 
                  status: 'cancelled',
                  end_date: new Date().toISOString(),
                  pause_reason: reason
                }
              : sub
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pauseSubscription = useCallback(async (subscriptionId, pauseData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.pauseSubscription(subscriptionId, pauseData);
      if (result) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { 
                  ...sub, 
                  is_paused: true,
                  paused_at: new Date().toISOString(),
                  ...pauseData
                }
              : sub
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error pausing subscription:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.resumeSubscription(subscriptionId);
      if (result) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { 
                  ...sub, 
                  is_paused: false,
                  resume_date: null,
                  paused_at: null,
                  pause_reason: null
                }
              : sub
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error resuming subscription:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubscriptionHistory = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const history = await plansAPI.getSubscriptionHistory(subscriptionId);
      return history;
    } catch (err) {
      console.error('Error fetching subscription history:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculatePlanCost = useCallback(async (planId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const cost = await plansAPI.calculatePlanCost(planId, options);
      return cost;
    } catch (err) {
      console.error('Error calculating plan cost:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin operations (require admin auth)
  const createPlan = useCallback(async (planData) => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await plansAPI.createPlan(planData);
      if (newPlan) {
        setPlans(prev => [...prev, newPlan]);
      }
      return newPlan;
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (planId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.updatePlan(planId, updates);
      if (result) {
        setPlans(prev => 
          prev.map(plan => 
            plan.id === planId 
              ? { ...plan, ...updates }
              : plan
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error updating plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      await plansAPI.deletePlan(planId);
      setPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePlanStatus = useCallback(async (planId, isActive) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.togglePlanStatus(planId, isActive);
      if (result) {
        setPlans(prev => 
          prev.map(plan => 
            plan.id === planId 
              ? { ...plan, is_active: isActive }
              : plan
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error toggling plan status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlanAnalytics = useCallback(async (timeframe = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await plansAPI.getPlanAnalytics(timeframe);
      return analytics;
    } catch (err) {
      console.error('Error fetching plan analytics:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllSubscriptions = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getAllSubscriptions(queryParams);
      return data;
    } catch (err) {
      console.error('Error fetching all subscriptions:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const updateSubscriptionStatus = useCallback(async (subscriptionId, status, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.updateSubscriptionStatus(subscriptionId, status, notes);
      return result;
    } catch (err) {
      console.error('Error updating subscription status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateSubscriptions = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const results = await plansAPI.bulkUpdateSubscriptions(updates);
      return results;
    } catch (err) {
      console.error('Error bulk updating subscriptions:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportSubscriptions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.exportSubscriptions(filters);
      return data;
    } catch (err) {
      console.error('Error exporting subscriptions:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSubscriptions = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getUserSubscriptions(userId);
      return data;
    } catch (err) {
      console.error('Error fetching user subscriptions:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPlanFeatured = useCallback(async (planId, isFeatured) => {
    setLoading(true);
    setError(null);
    try {
      const result = await plansAPI.setPlanFeatured(planId, isFeatured);
      if (result) {
        setPlans(prev => 
          prev.map(plan => 
            plan.id === planId 
              ? { ...plan, is_featured: isFeatured }
              : plan
          )
        );
      }
      return result;
    } catch (err) {
      console.error('Error setting plan featured status:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicatePlan = useCallback(async (planId, newPlanData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const duplicatedPlan = await plansAPI.duplicatePlan(planId, newPlanData);
      if (duplicatedPlan) {
        setPlans(prev => [...prev, duplicatedPlan]);
      }
      return duplicatedPlan;
    } catch (err) {
      console.error('Error duplicating plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions for filtering and managing plans
  const getActivePlans = useCallback(() => {
    return plans.filter(plan => plan.is_active);
  }, [plans]);

  const getFeaturedPlans = useCallback(() => {
    return plans.filter(plan => plan.is_featured && plan.is_active);
  }, [plans]);

  const getPlansByPriceRange = useCallback((minPrice, maxPrice) => {
    return plans.filter(plan => 
      plan.is_active && 
      plan.price_per_meal >= minPrice && 
      plan.price_per_meal <= maxPrice
    );
  }, [plans]);

  const getPlansByMealCount = useCallback((minMeals, maxMeals) => {
    return plans.filter(plan => 
      plan.is_active && 
      plan.meals_per_week >= minMeals && 
      plan.meals_per_week <= maxMeals
    );
  }, [plans]);
  
  // Add new function to fetch plan meals
    const fetchPlanMeals = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getPlanMeals(planId);
      return data;
    } catch (err) {
      console.error('Error fetching plan meals:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  // Update subscribeToPlan to handle meals
  const subscribeToPlan = useCallback(async (planId, subscriptionData) => {
    setLoading(true);
    setError(null);
    try {
      // Include meals and additives in subscription
      const newSubscription = await plansAPI.subscribeToPlan(
        planId, 
        {
          ...subscriptionData,
          meals: subscriptionData.meals || [],
          additives: subscriptionData.additives || []
        }
      );
      
      if (newSubscription) {
        setSubscriptions(prev => [...prev, newSubscription]);
      }
      return newSubscription;
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update getSubscriptionById to include meals
  const getSubscriptionById = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansAPI.getSubscriptionById(subscriptionId);
      return data;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  // Helper functions for managing subscriptions
  const getActiveSubscriptions = useCallback(() => {
    return subscriptions.filter(sub => sub.status === 'active');
  }, [subscriptions]);

  const getPausedSubscriptions = useCallback(() => {
    return subscriptions.filter(sub => sub.is_paused);
  }, [subscriptions]);

  const getCancelledSubscriptions = useCallback(() => {
    return subscriptions.filter(sub => sub.status === 'cancelled');
  }, [subscriptions]);

  const getSubscriptionsByStatus = useCallback((status) => {
    return subscriptions.filter(sub => sub.status === status);
  }, [subscriptions]);

  const getExpiringSubscriptions = useCallback((daysAhead = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      const endDate = new Date(sub.end_date);
      return endDate <= futureDate;
    });
  }, [subscriptions]);

  return {
    // State
    plans,
    subscriptions,
    additiveItems,
    loading,
    error,
    
    // Public plan operations
    fetchPlans,
    fetchPlanById,
    fetchFeaturedPlans,
    fetchPlanMeals,
    fetchAdditiveItems,
    // User subscription operations
    getSubscriptionById,
    fetchUserSubscriptions,
    subscribeToPlan,
    updateSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    getSubscriptionHistory,
    calculatePlanCost,
    
    // Admin plan operations
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    getPlanAnalytics,
    setPlanFeatured,
    duplicatePlan,
    
    // Admin subscription operations
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscriptionStatus,
    bulkUpdateSubscriptions,
    exportSubscriptions,
    getUserSubscriptions,
    
    // Helper functions for plans
    getActivePlans,
    getPlansByPriceRange,
    getPlansByMealCount,
    getPlanAnalytics,
  };
}