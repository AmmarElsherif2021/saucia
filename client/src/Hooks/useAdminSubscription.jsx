import { useState, useEffect, useCallback } from 'react';
import { adminSubscriptionAPI } from '../API/adminSubscriptionAPI';

// ===== BASE HOOK FOR COMMON FUNCTIONALITY =====
const useBaseSubscription = (defaultOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      setData(result);
      setLastFetch(new Date());
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('API call failed:', errorMessage, err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (data && lastFetch) {
      return executeApiCall(() => Promise.resolve(data));
    }
  }, [data, lastFetch, executeApiCall]);

  const clearError = useCallback(() => setError(null), []);
  const resetData = useCallback(() => setData(null), []);

  return {
    loading,
    error,
    data,
    lastFetch,
    executeApiCall,
    refresh,
    clearError,
    resetData
  };
};

// ===== MAIN SUBSCRIPTION MANAGEMENT HOOK =====
export const useAdminSubscription = () => {
  const base = useBaseSubscription();

  // Helper function to wrap API calls
  const createApiCall = (apiCall) => 
    useCallback((...args) => base.executeApiCall(apiCall, ...args), [base]);

  const getAllSubscriptions = createApiCall(adminSubscriptionAPI.getAllSubscriptions);
  const getSubscriptionDetails = createApiCall(adminSubscriptionAPI.getSubscriptionDetails);
  const createSubscription = createApiCall(adminSubscriptionAPI.createSubscription);
  const activateSubscription = createApiCall(adminSubscriptionAPI.activateSubscription);
  const updateSubscription = createApiCall(adminSubscriptionAPI.updateSubscription);
  const updateSubscriptionStatus = createApiCall(adminSubscriptionAPI.updateSubscriptionStatus);
  
  const updateDeliveryStatus = useCallback(
    async (orderId, status) => {
      try {
        const result = await adminSubscriptionAPI.updateOrderStatus(orderId, status);
        return result;
      } catch (err) {
        console.error('Update delivery status failed:', err);
        throw err;
      }
    },
    []
  );
  
  const updateOrderStatus = createApiCall(adminSubscriptionAPI.updateOrderStatus);

  return {
    // State
    loading: base.loading,
    error: base.error,
    data: base.data,
    lastFetch: base.lastFetch,
    
    // Subscription management functions
    getAllSubscriptions,
    getSubscriptionDetails,
    createSubscription,
    activateSubscription,
    updateSubscription,
    updateSubscriptionStatus,
    updateDeliveryStatus,
    updateOrderStatus,
    // Utility functions
    clearError: base.clearError,
    resetData: base.resetData,
    refresh: base.refresh
  };
};

// ===== BASE HOOK FOR LIST DATA =====
const useBaseList = (apiCall, initialOptions = {}) => {
  const [data, setData] = useState([]);
  const [options, setOptions] = useState(initialOptions);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (newOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedOptions = { ...options, ...newOptions };
      const result = await apiCall(mergedOptions);
      setData(result || []);
      setTotalCount((result || []).length);
      return result;
    } catch (err) {
      console.error('Fetch data failed:', err);
      setError(err.message);
      setData([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, options]);

  const updateOptions = useCallback((newOptions) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return {
    data,
    totalCount,
    options,
    isLoading: loading,
    error,
    refetch,
    fetchData,
    updateOptions
  };
};

// ===== SPECIALIZED HOOKS =====

// Hook for subscription list with proper data handling
export const useSubscriptionList = (initialOptions = {}) => {
  const defaultOptions = {
    orderBy: 'created_at',
    ascending: false,
    limit: 50,
    ...initialOptions
  };

  const base = useBaseList(adminSubscriptionAPI.getAllSubscriptions, defaultOptions);

  // Initial fetch
  useEffect(() => {
    base.fetchData();
  }, []);

  // Refetch when key options change
  useEffect(() => {
    base.fetchData();
  }, [base.options.status, base.options.orderBy, base.options.ascending, base.options.user_id]);

  const filterByStatus = useCallback((status) => {
    base.updateOptions({ status: status === 'all' ? undefined : status });
  }, [base.updateOptions]);

  return { 
    ...base,
    subscriptions: base.data,
    filterByStatus,
  };
};

// Hook for upcoming deliveries with corrected API call
export const useUpcomingDeliveries = (daysAhead = 7, options = {}) => {
  const fetchDeliveries = useCallback(async () => {
    const days = Math.max(0, parseInt(daysAhead, 10) || 7);
    return await adminSubscriptionAPI.getUpcomingDeliveries(days);
  }, [daysAhead]);

  const base = useBaseList(fetchDeliveries, options);

  // Initial fetch
  useEffect(() => {
    base.fetchData();
  }, [base.fetchData]);

  return { 
    ...base,
    deliveries: base.data,
  };
};

// Hook for subscription analytics with mock data fallback
export const useSubscriptionAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      try {
        data = await adminSubscriptionAPI.getSubscriptionAnalytics();
      } catch (apiError) {
        console.warn('Analytics API failed, using mock data:', apiError);
        // Fallback mock data
        data = {
          total_subscriptions: 0,
          active_subscriptions: 0,
          month_growth: 0,
          active_growth: 0,
          today_deliveries: 0,
          delivery_completion_rate: 0,
          monthly_revenue: 0,
          revenue_growth: 0
        };
      }
      
      setAnalytics(data);
      return data;
    } catch (err) {
      console.error('Fetch analytics failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { 
    data: analytics,
    analytics,
    isLoading: loading,
    error,
    refetch: fetchAnalytics
  };
};

export default useAdminSubscription;

export const useSubscriptionOrders = (options = {}) => {
  const base = useBaseList(adminSubscriptionAPI.getSubscriptionOrders, options);

  // Initial fetch
  useEffect(() => {
    base.fetchData();
  }, []);

  return { 
    ...base,
    orders: base.data,
  };
};