import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';

const ChosenPlanContext = createContext();

// Date calculation utilities
const calculateDeliveryDate = (startDate, mealIndex) => {
  const date = new Date(startDate);
  let validDays = 0;
  
  const startDayOfWeek = date.getDay();
  if (startDayOfWeek !== 5 && startDayOfWeek !== 6) {
    validDays = 1;
  }
  
  while (validDays <= mealIndex) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      validDays++;
    }
  }
  return date;
};

const calculateSubscriptionEndDate = (startDate, totalMeals) => {
  if (!startDate || !totalMeals || totalMeals <= 0) return null;
  
  const endDate = calculateDeliveryDate(startDate, totalMeals - 1);
  return endDate.toISOString().split('T')[0];
};

export const ChosenPlanProvider = ({ children }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    plan_id: null,
    status: 'pending',
    start_date: null,
    end_date: null,
    price_per_meal: null,
    total_meals: null,
    consumed_meals: 0,
    delivery_address_id: null,
    preferred_delivery_time: null,
    delivery_days: [],
    payment_method_id: null,
    auto_renewal: false,
    is_paused: false,
    paused_at: null,
    pause_reason: null,
    resume_date: null,
    next_delivery_date: null,
    meals: [],
    additives: [],
    selected_term: null,
    plan: null,
  });
  
  // Calculate derived values
  const calculateDerivedValues = useCallback((plan, selectedTerm, currentData = {}) => {
    if (!plan || !selectedTerm) return {};

    const totalMeals = selectedTerm === 'short' 
      ? (plan.short_term_meals || plan.periods?.[0] || 30)
      : (plan.medium_term_meals || plan.periods?.[1] || 60);

    let pricePerMeal = plan.price_per_meal || 0;
    if (plan.short_term_price && plan.medium_term_price) {
      pricePerMeal = selectedTerm === 'short' 
        ? plan.short_term_price 
        : plan.medium_term_price;
    }

    const startDate = currentData.start_date || new Date().toISOString().split('T')[0];
    const endDate = calculateSubscriptionEndDate(startDate, totalMeals);
    const deliveryDays = [];
    for (let i = 0; i < totalMeals; i++) {
      const deliveryDate = calculateDeliveryDate(startDate, i);
      deliveryDays.push(deliveryDate.toISOString().split('T')[0]);
    }
    return {
      plan_id: plan.id,
      total_meals: totalMeals,
      price_per_meal: pricePerMeal,
      start_date: startDate,
      end_date: endDate,
      delivery_days: deliveryDays
    };
  }, []);
  
  // Fetch additives function
  const fetchPlanAdditives = useCallback(async (additiveIds) => {
    if (!additiveIds || additiveIds.length === 0) return [];
    
    try {
      const { data } = await supabase
        .from('items')
        .select('*')
        .in('id', additiveIds)
        .eq('is_additive', true);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching additives:', error);
      return [];
    }
  }, []);

  // Main update function with fix to preserve additives
  const updateSubscriptionData = useCallback((updates) => {
    setSubscriptionData(prev => {
      const merged = { ...prev, ...updates };
      
      // If plan or term changed, recalculate derived values
      if (updates.plan || updates.selected_term) {
        const plan = updates.plan || prev.plan;
        const selectedTerm = updates.selected_term || prev.selected_term;
        
        if (plan && selectedTerm) {
          const derivedValues = calculateDerivedValues(plan, selectedTerm, merged);
          
          // PRESERVE ADDITIVES - Key fix
          return { 
            ...merged, 
            ...derivedValues,
            additives: merged.additives  // Maintain existing additives
          };
        }
      }
      
      // Recalculate end date if needed
      if ((updates.start_date || updates.total_meals) && merged.total_meals) {
        const newEndDate = calculateSubscriptionEndDate(merged.start_date, merged.total_meals);
        if (newEndDate) {
          merged.end_date = newEndDate;
        }
      }
      const deliveryDays = [];
      for (let i = 0; i < merged.total_meals; i++) {
        const deliveryDate = calculateDeliveryDate(merged.start_date, i);
        deliveryDays.push(deliveryDate.toISOString().split('T')[0]);
      }
      merged.delivery_days = deliveryDays;
      return merged;
    });
  }, [calculateDerivedValues]);

  // Set selected plan with additives fetch
  const setSelectedPlan = useCallback(async (plan) => {
  const newAdditives = plan?.additives?.length 
    ? await fetchPlanAdditives(plan.additives)
    : [];

  updateSubscriptionData({ 
    plan,
    additives: [...subscriptionData.additives, ...newAdditives],
      ...((!subscriptionData.selected_term && plan?.medium_term_meals > 0) && { 
        selected_term: 'medium' 
      })
    });
  }, [updateSubscriptionData, subscriptionData.selected_term, fetchPlanAdditives]);

  // Other setters remain unchanged
  const setSubscriptionTerm = useCallback((term) => {
    updateSubscriptionData({ selected_term: term });
  }, [updateSubscriptionData]);

  const setDeliveryPreferences = useCallback((preferences) => {
    updateSubscriptionData(preferences);
  }, [updateSubscriptionData]);

  const setPaymentMethod = useCallback((paymentMethodId) => {
    updateSubscriptionData({ payment_method_id: paymentMethodId });
  }, [updateSubscriptionData]);

  const setSelectedMeals = useCallback((meals) => {
    const mealArray = Array.isArray(meals) ? meals : [meals];
    updateSubscriptionData({ meals: mealArray });
  }, [updateSubscriptionData]);

  const addMeal = useCallback((mealId) => {
    setSubscriptionData(prev => ({
      ...prev,
      meals: [...prev.meals, mealId]
    }));
  }, []);

  const setDeliveryTime = useCallback((time) => {
    updateSubscriptionData({ preferred_delivery_time: time });
  }, [updateSubscriptionData]);

  const removeMeal = useCallback((index) => {
    setSubscriptionData(prev => {
      const newMeals = [...prev.meals];
      newMeals.splice(index, 1); 
      return { ...prev, meals: newMeals };
    });
  }, []);

  const setSubscriptionStatus = useCallback((status) => {
    updateSubscriptionData({ status });
  }, [updateSubscriptionData]);

  const pauseSubscription = useCallback((reason = null) => {
    updateSubscriptionData({
      is_paused: true,
      paused_at: new Date().toISOString(),
      pause_reason: reason,
      status: 'paused'
    });
  }, [updateSubscriptionData]);

  const resumeSubscription = useCallback((resumeDate = null) => {
    updateSubscriptionData({
      is_paused: false,
      paused_at: null,
      pause_reason: null,
      resume_date: resumeDate,
      status: 'active'
    });
  }, [updateSubscriptionData]);

  // Computed values
  const totalPrice = useMemo(() => {
    const { price_per_meal, total_meals, selected_term, plan } = subscriptionData;
    
    if (!price_per_meal || !total_meals || price_per_meal <= 0 || total_meals <= 0) {
      return 0;
    }
    
    const basePrice = price_per_meal * total_meals;
    
    if (selected_term === 'medium' && plan?.medium_term_discount) {
      const discountAmount = basePrice * (plan.medium_term_discount / 100);
      return basePrice - discountAmount;
    }
    
    return basePrice;
  }, [subscriptionData]);

  const remainingMeals = useMemo(() => {
    return Math.max(0, (subscriptionData.total_meals || 0) - (subscriptionData.consumed_meals || 0));
  }, [subscriptionData.total_meals, subscriptionData.consumed_meals]);

  const isSubscriptionValid = useMemo(() => {
    return !!(
      subscriptionData.plan_id &&
      subscriptionData.selected_term &&
      subscriptionData.start_date &&
      subscriptionData.end_date &&
      subscriptionData.price_per_meal &&
      subscriptionData.total_meals
    );
  }, [subscriptionData]);

  const isPaymentValid = useMemo(() => {
    return !!subscriptionData.payment_method_id;
  }, [subscriptionData.payment_method_id]);

  const isReadyForCheckout = useMemo(() => {
    return isSubscriptionValid && isPaymentValid && subscriptionData.delivery_address_id;
  }, [isSubscriptionValid, isPaymentValid, subscriptionData.delivery_address_id]);

  // Get API payload
  const getSubscriptionPayload = useCallback((userId) => {
    const { selected_term, plan, ...apiData } = subscriptionData;
    return {
      user_id: userId,
      ...apiData,
    };
  }, [subscriptionData]);

  // Initialize subscription from existing data
  const initializeFromSubscription = useCallback((subscriptionData, planData) => {
    setSubscriptionData(prev => ({
      ...prev,
      ...subscriptionData,
      plan: planData,
      selected_term: subscriptionData.total_meals === planData?.short_term_meals ? 'short' : 'medium'
    }));
  }, []);

  // Reset function
  const resetSubscriptionData = useCallback(() => {
    setSubscriptionData({
      plan_id: null,
      status: 'pending',
      start_date: null,
      end_date: null,
      price_per_meal: null,
      total_meals: null,
      consumed_meals: 0,
      delivery_address_id: null,
      preferred_delivery_time: null,
      delivery_days: [],
      payment_method_id: null,
      auto_renewal: false,
      is_paused: false,
      paused_at: null,
      pause_reason: null,
      resume_date: null,
      next_delivery_date: null,
      meals: [],
      additives: [],
      selected_term: null,
      plan: null,
    });
  }, []);

  // Get delivery schedule
  const getDeliverySchedule = useCallback(() => {
    if (!subscriptionData.start_date || !subscriptionData.total_meals) return [];
    
    const schedule = [];
    for (let i = 0; i < subscriptionData.total_meals; i++) {
      const deliveryDate = calculateDeliveryDate(subscriptionData.start_date, i);
      schedule.push({
        mealIndex: i + 1,
        date: deliveryDate.toISOString().split('T')[0],
        dayName: deliveryDate.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }
    return schedule;
  }, [subscriptionData.start_date, subscriptionData.total_meals]);

  // Context value
  const contextValue = {
    subscriptionData,
    fetchPlanAdditives,
    updateSubscriptionData,
    setSelectedPlan,
    setSubscriptionTerm,
    setDeliveryPreferences,
    setPaymentMethod,
    setSelectedMeals,
    addMeal,
    removeMeal,
    setSubscriptionStatus,
    pauseSubscription,
    resumeSubscription,
    setDeliveryTime,
    totalPrice,
    remainingMeals,
    isSubscriptionValid,
    isPaymentValid,
    isReadyForCheckout,
    getSubscriptionPayload,
    initializeFromSubscription,
    resetSubscriptionData,
    getDeliverySchedule,
    chosenPlan: subscriptionData.plan,
    selectedTerm: subscriptionData.selected_term,
    subscriptionStatus: subscriptionData.status,
  };

  return (
    <ChosenPlanContext.Provider value={contextValue}>
      {children}
    </ChosenPlanContext.Provider>
  );
};

export const useChosenPlanContext = () => {
  const context = useContext(ChosenPlanContext);
  if (!context) {
    throw new Error('useChosenPlanContext must be used within a ChosenPlanProvider');
  }
  return context;
};