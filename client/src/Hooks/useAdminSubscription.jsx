import { useState, useEffect, useCallback } from 'react';
import { adminSubscriptionAPI } from '../API/adminSubscriptionAPI';

// ===== CONSTANTS AND CONFIGURATIONS =====
const DEFAULT_OPTIONS = {
  orderBy: 'created_at',
  ascending: false,
  limit: 50
};

const MOCK_ANALYTICS = {
  total_subscriptions: 0,
  active_subscriptions: 0,
  month_growth: 0,
  active_growth: 0,
  today_deliveries: 0,
  delivery_completion_rate: 0,
  monthly_revenue: 0,
  revenue_growth: 0
};

// ===== UTILITY FUNCTIONS =====
const handleApiError = (error, context = 'API call') => {
  const errorMessage = error?.message || `An unexpected error occurred during ${context}`;
  console.error(`${context} failed:`, errorMessage, error);
  return errorMessage;
};

const shouldRefetch = (lastFetch, cacheTime = 30000) => {
  if (!lastFetch) return true;
  return Date.now() - lastFetch.getTime() > cacheTime;
};

// ===== BASE HOOKS =====
const useBaseApi = () => {
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
      const errorMessage = handleApiError(err, 'API call');
      setError(errorMessage);
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

const useBaseList = (apiCall, initialOptions = {}, realtimeConfig = null) => {
  const [data, setData] = useState([]);
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...initialOptions });
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
      const errorMessage = handleApiError(err, 'Fetch data');
      setError(errorMessage);
      setData([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, options]);

  // Real-time subscription setup
  useEffect(() => {
    if (!realtimeConfig?.subscribe) return;

    const subscription = realtimeConfig.subscribe((payload) => {
      console.log('🔔 Real-time update:', payload);
      
      // Update local data based on event type
      if (payload.eventType === 'INSERT') {
        setData(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setData(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
      } else if (payload.eventType === 'DELETE') {
        setData(prev => prev.filter(item => item.id !== payload.old.id));
      }

      // Optionally refetch to ensure consistency
      if (realtimeConfig.refetchOnChange) {
        fetchData();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [realtimeConfig, fetchData]);

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

// ===== API CALL CREATORS =====
const createApiCaller = (executeApiCall, apiCall) => 
  useCallback((...args) => executeApiCall(apiCall, ...args), [executeApiCall, apiCall]);

// ===== SPECIALIZED HOOKS =====

// Main subscription management hook
export const useAdminSubscription = () => {
  const base = useBaseApi();
  
  // Create all API callers
  const apiCallers = {
    getAllSubscriptions: createApiCaller(base.executeApiCall, adminSubscriptionAPI.getAllSubscriptions),
    getSubscriptionDetails: createApiCaller(base.executeApiCall, adminSubscriptionAPI.getSubscriptionDetails),
    createSubscription: createApiCaller(base.executeApiCall, adminSubscriptionAPI.createSubscription),
    activateSubscription: createApiCaller(base.executeApiCall, adminSubscriptionAPI.activateSubscription),
    updateSubscription: createApiCaller(base.executeApiCall, adminSubscriptionAPI.updateSubscription),
    updateSubscriptionStatus: createApiCaller(base.executeApiCall, adminSubscriptionAPI.updateSubscriptionStatus),
    updateOrderStatus: createApiCaller(base.executeApiCall, adminSubscriptionAPI.updateOrderStatus),
  };

  // Special handling for delivery status updates
  const updateDeliveryStatus = useCallback(
    async (orderId, status) => {
      try {
        const result = await adminSubscriptionAPI.updateOrderStatus(orderId, status);
        return result;
      } catch (err) {
        const errorMessage = handleApiError(err, 'Update delivery status');
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    // State
    loading: base.loading,
    error: base.error,
    data: base.data,
    lastFetch: base.lastFetch,
    
    // API functions
    ...apiCallers,
    updateDeliveryStatus,
    
    // Utility functions
    clearError: base.clearError,
    resetData: base.resetData,
    refresh: base.refresh
  };
};

// Subscription list hook with real-time updates
export const useSubscriptionList = (initialOptions = {}) => {
  const base = useBaseList(
    adminSubscriptionAPI.getAllSubscriptions, 
    initialOptions,
    {
      subscribe: (callback) => adminSubscriptionAPI.subscribeToSubscriptions(callback),
      refetchOnChange: false // Update locally for better UX
    }
  );

  // Initial fetch on mount
  useEffect(() => {
    base.fetchData();
  }, []);

  // Refetch when key options change
  useEffect(() => {
    if (base.options.status || base.options.orderBy || base.options.ascending || base.options.user_id) {
      base.fetchData();
    }
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

// Upcoming deliveries hook with real-time updates
export const useUpcomingDeliveries = (daysAhead = 7, options = {}) => {
  const fetchDeliveries = useCallback(async () => {
    try {
      const days = Math.max(0, parseInt(daysAhead, 10) || 7);
      return await adminSubscriptionAPI.getUpcomingDeliveries(days);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Fetch deliveries');
      throw new Error(errorMessage);
    }
  }, [daysAhead]);

  const base = useBaseList(
    fetchDeliveries, 
    options,
    {
      subscribe: (callback) => adminSubscriptionAPI.subscribeToUpcomingDeliveries(callback),
      refetchOnChange: true // Refetch to ensure date filters are correct
    }
  );

  // Fetch data when the fetchDeliveries function changes
  useEffect(() => {
    base.fetchData();
  }, [fetchDeliveries]);

  return {
    ...base,
    deliveries: base.data,
  };
};

// Analytics hook with robust error handling and mock data fallback
export const useSubscriptionAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      // Try to fetch from API first
      try {
        data = await adminSubscriptionAPI.getSubscriptionAnalytics();
      } catch (apiError) {
        console.warn('Analytics API failed, using mock data:', apiError);
        // Use mock data as fallback
        data = { ...MOCK_ANALYTICS };
      }
      
      setAnalytics(data);
      return data;
    } catch (err) {
      const errorMessage = handleApiError(err, 'Fetch analytics');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time updates for analytics (refetch when subscriptions change)
  useEffect(() => {
    const subscription = adminSubscriptionAPI.subscribeToSubscriptions(() => {
      // Debounce analytics refetch to avoid excessive calls
      const timeoutId = setTimeout(() => {
        fetchAnalytics();
      }, 2000);

      return () => clearTimeout(timeoutId);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchAnalytics]);

  return {
    data: analytics,
    analytics,
    isLoading: loading,
    error,
    refetch: fetchAnalytics
  };
};

// Subscription orders hook with real-time updates
export const useSubscriptionOrders = (options = {}) => {
  const base = useBaseList(
    adminSubscriptionAPI.getSubscriptionOrders, 
    options,
    {
      subscribe: (callback) => adminSubscriptionAPI.subscribeToAllOrders(callback),
      refetchOnChange: false
    }
  );

  // Initial fetch on mount
  useEffect(() => {
    base.fetchData();
  }, []);

  return {
    ...base,
    orders: base.data,
  };
};

export default useAdminSubscription;