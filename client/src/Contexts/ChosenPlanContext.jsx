import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';

const ChosenPlanContext = createContext();

// FIXED: Date calculation utilities
const calculateDeliveryDate = (startDate, mealIndex) => {
  const date = new Date(startDate);
  
  // FIXED: Check if start date is a valid delivery day (not Friday or Saturday)
  const startDayOfWeek = date.getDay();
  const isStartDateValid = startDayOfWeek !== 5 && startDayOfWeek !== 6;
  
  // If start date is valid and we want the first meal
  if (isStartDateValid && mealIndex === 0) {
    return new Date(date); // Return start date for first meal
  }
  
  // If start date is not valid, move to next valid day first
  if (!isStartDateValid) {
    while (date.getDay() === 5 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    // If we want the first meal and start date was invalid
    if (mealIndex === 0) {
      return new Date(date);
    }
  }
  
  // Count valid days until we reach the desired meal index
  let currentMealIndex = 0; // We've already handled meal 0 above
  
  while (currentMealIndex < mealIndex) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    // Skip Fridays (5) and Saturdays (6)
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      currentMealIndex++;
    }
  }
  
  return new Date(date);
};

const calculateSubscriptionEndDate = (startDate, totalMeals) => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const sixtyDaysLater = new Date(start);
  sixtyDaysLater.setDate(start.getDate() + 60);

  return sixtyDaysLater.toISOString().split('T')[0];
};

// NEW: Helper function to generate delivery schedule
const generateDeliverySchedule = (startDate, totalMeals) => {
  if (!startDate || !totalMeals) return [];
  
  const schedule = [];
  for (let i = 0; i < totalMeals; i++) {
    const deliveryDate = calculateDeliveryDate(startDate, i);
    schedule.push({
      mealIndex: i,
      date: deliveryDate.toISOString().split('T')[0],
      dayName: deliveryDate.toLocaleDateString('en-US', { weekday: 'long' }),
      formattedDate: deliveryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    });
  }
  return schedule;
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
    
    // IMPROVED: Generate complete delivery schedule
    const deliverySchedule = generateDeliverySchedule(startDate, totalMeals);
    const deliveryDays = deliverySchedule.map(day => day.date);

    return {
      plan_id: plan.id,
      total_meals: totalMeals,
      price_per_meal: pricePerMeal,
      start_date: startDate,
      end_date: endDate,
      delivery_days: deliveryDays,
      delivery_schedule: deliverySchedule // NEW: Full schedule with formatted dates
    };
  }, []);
  
  // Fetch additives function
  const fetchPlanAdditives = useCallback(async (additiveIds) => {
    if (!additiveIds || additiveIds.length === 0) return [];
    console.log(`Additives from chosenPlanContext: ${additiveIds}`);
    try {
      const { data } = await supabase
        .from('items')
        .select('*')
        .in('id', additiveIds)
        .eq('is_available', true);
      
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
      
      // IMPROVED: Recalculate delivery schedule if dates or meals change
      if ((updates.start_date || updates.total_meals) && merged.total_meals && merged.start_date) {
        const newEndDate = calculateSubscriptionEndDate(merged.start_date, merged.total_meals);
        const deliverySchedule = generateDeliverySchedule(merged.start_date, merged.total_meals);
        const deliveryDays = deliverySchedule.map(day => day.date);
        
        merged.end_date = newEndDate;
        merged.delivery_days = deliveryDays;
        merged.delivery_schedule = deliverySchedule;
      }
      
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
  const { selected_term, plan, delivery_schedule, next_delivery_meal, ...apiData } = subscriptionData;
  return {
    user_id: userId,
    ...apiData,
    // Ensure we're only sending fields that exist in user_subscriptions table
    meals: JSON.stringify(subscriptionData.meals) // Convert array to JSON string if needed
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

  // IMPROVED: Get delivery schedule with meal mapping
  const getDeliverySchedule = useCallback(() => {
    if (!subscriptionData.start_date || !subscriptionData.total_meals) return [];
    
    return subscriptionData.delivery_schedule || generateDeliverySchedule(
      subscriptionData.start_date, 
      subscriptionData.total_meals
    );
  }, [subscriptionData.start_date, subscriptionData.total_meals, subscriptionData.delivery_schedule]);

  // NEW: Get delivery schedule with meal assignments
  const getDeliveryScheduleWithMeals = useCallback((meals = []) => {
    const schedule = getDeliverySchedule();
    return schedule.map((day, index) => ({
      ...day,
      meal: meals[index] || null,
      hasMeal: !!meals[index]
    }));
  }, [getDeliverySchedule]);

  // NEW: Get next delivery date
  const getNextDeliveryDate = useCallback(() => {
    const schedule = getDeliverySchedule();
    const today = new Date().toISOString().split('T')[0];
    
    return schedule.find(day => day.date >= today)?.date || null;
  }, [getDeliverySchedule]);

  // NEW: Check if delivery falls on weekend (should not happen with fixed logic)
  const validateDeliverySchedule = useCallback(() => {
    const schedule = getDeliverySchedule();
    const weekendDeliveries = schedule.filter(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    });
    
    if (weekendDeliveries.length > 0) {
      console.warn('Weekend deliveries detected:', weekendDeliveries);
      return false;
    }
    
    return true;
  }, [getDeliverySchedule]);

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
    getDeliveryScheduleWithMeals, // NEW
    getNextDeliveryDate, // NEW
    validateDeliverySchedule, // NEW
    chosenPlan: subscriptionData.plan,
    selectedTerm: subscriptionData.selected_term,
    subscriptionStatus: subscriptionData.status,
    // NEW: Direct access to delivery schedule
    deliverySchedule: subscriptionData.delivery_schedule || [],
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