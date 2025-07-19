import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ChosenPlanContext = createContext();

export const ChosenPlanProvider = ({ children }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    // Core subscription info
    plan_id: null,
    status: 'pending',
    start_date: null,
    end_date: null,
    
    // Pricing and meals
    price_per_meal: null,
    total_meals: null,
    consumed_meals: 0,
    
    // Delivery preferences
    delivery_address_id: null,
    preferred_delivery_time: null,
    delivery_days: [],
    
    // Payment and settings
    payment_method_id: null,
    auto_renewal: false,
    
    // Pause functionality
    is_paused: false,
    paused_at: null,
    pause_reason: null,
    resume_date: null,
    
    // Scheduling
    next_delivery_date: null,
    
    // Meal selections
    meals: [],
    
    // UI state for term selection - Set default to null initially
    selected_term: null,
    
    // Store the chosen plan directly
    plan: null,
  });

  // Calculate derived values from plan and selected term
  const calculateDerivedValues = useCallback((plan, selectedTerm, currentData = {}) => {
    if (!plan || !selectedTerm) return {};

    // Calculate total meals based on selected term
    const totalMeals = selectedTerm === 'short' 
      ? (plan.short_term_meals || plan.periods?.[0] || 30)
      : (plan.medium_term_meals || plan.periods?.[1] || 60);

    // Calculate price per meal based on selected term
    let pricePerMeal = plan.price_per_meal || 0;
    if (plan.short_term_price && plan.medium_term_price) {
      pricePerMeal = selectedTerm === 'short' 
        ? plan.short_term_price 
        : plan.medium_term_price;
    }

    // Calculate dates if not already set
    const startDate = currentData.start_date || new Date().toISOString().split('T')[0];
    const durationDays = selectedTerm === 'short' 
      ? (plan.duration_days || 30)
      : (plan.duration_days || 30) * 2;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    return {
      plan_id: plan.id,
      total_meals: totalMeals,
      price_per_meal: pricePerMeal,
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0],
    };
  }, []);

  // Main update function that handles all updates with auto-calculation
  const updateSubscriptionData = useCallback((updates) => {
    console.log('Updating subscription data:', updates); // Debug log
    
    setSubscriptionData(prev => {
      // Merge updates with previous data
      const merged = { ...prev, ...updates };
      
      console.log('Previous data:', prev); // Debug log
      console.log('Merged data:', merged); // Debug log
      
      // If plan or term changed, recalculate derived values
      if (updates.plan || updates.selected_term) {
        const plan = updates.plan || prev.plan;
        const selectedTerm = updates.selected_term || prev.selected_term;
        
        console.log('Plan:', plan); // Debug log
        console.log('Selected term:', selectedTerm); // Debug log
        
        if (plan && selectedTerm) {
          const derivedValues = calculateDerivedValues(plan, selectedTerm, merged);
          console.log('Derived values:', derivedValues); // Debug log
          return { ...merged, ...derivedValues };
        }
      }
      
      return merged;
    });
  }, [calculateDerivedValues]);

  // Specific setter functions for common operations
  const setSelectedPlan = useCallback((plan) => {
    console.log('Setting selected plan:', plan); // Debug log
    updateSubscriptionData({ 
      plan,
      // Auto-select medium term if no term is selected and plan has medium term available
      ...((!subscriptionData.selected_term && plan?.medium_term_meals > 0) && { selected_term: 'medium' })
    });
  }, [updateSubscriptionData, subscriptionData.selected_term]);

  const setSubscriptionTerm = useCallback((term) => {
    console.log('Setting subscription term:', term); // Debug log
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
      meals:[...prev.meals, mealId]
    }));
  }, []);

  const removeMeal = useCallback((mealId) => {
    setSubscriptionData(prev => ({
      ...prev,
      meals: prev.meals.filter(id => id !== mealId)
    }));
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
    
    // Apply medium term discount if available
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
      subscriptionData.selected_term && // Added term validation
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

  // Get API payload (excludes UI-only fields)
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

  // Reset function - Fixed to have consistent default
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
      selected_term: null, // Changed from 'medium' to null for consistency
      plan: null,
    });
  }, []);

  // Context value
  const contextValue = {
    // Core data
    subscriptionData,
    
    // Main update function
    updateSubscriptionData,
    
    // Specific setters
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
    
    // Computed values
    totalPrice,
    remainingMeals,
    isSubscriptionValid,
    isPaymentValid,
    isReadyForCheckout,
    
    // Utility functions
    getSubscriptionPayload,
    initializeFromSubscription,
    resetSubscriptionData,
    
    // Convenience getters
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