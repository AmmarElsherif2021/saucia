import { useState, useCallback } from 'react';
import { 
  listPlans, 
  getPlanById, 
  createPlan, 
  updatePlan, 
  deletePlan 
} from '../API/plans';

/**
 * Custom hook for managing subscription plans according to Supabase schema
 * 
 * Plan schema (from Supabase):
 * - id: number (SERIAL PRIMARY KEY)
 * - title: string
 * - title_arabic: string
 * - description: string
 * - description_arabic: string
 * - price_per_meal: number (NUMERIC(10,2))
 * - short_term_meals: number (INTEGER)
 * - medium_term_meals: number (INTEGER)
 * - duration_days: number (INTEGER)
 * - target_calories_per_meal: number (INTEGER)
 * - target_protein_per_meal: number (INTEGER)
 * - target_carbs_per_meal: number (INTEGER)
 * - avatar_url: string
 * - is_active: boolean
 * - sort_order: number (INTEGER)
 * - created_at: string (TIMESTAMPTZ)
 * - updated_at: string (TIMESTAMPTZ)
 */

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate and normalize plan data according to schema
  const validatePlanData = (plan) => {
    if (!plan) return null;
    
    // Ensure required fields exist
    if (!plan.title || typeof plan.price_per_meal !== 'number') {
      console.warn('Invalid plan data - missing required fields:', plan);
      return null;
    }

    // Validate business logic constraints
    const shortTermMeals = Number(plan.short_term_meals) || 0;
    const mediumTermMeals = Number(plan.medium_term_meals) || shortTermMeals;
    const durationDays = Number(plan.duration_days) || 0;

    if (shortTermMeals <= 0 || durationDays <= 0) {
      console.warn('Invalid plan data - invalid meal count or duration:', plan);
      return null;
    }

    if (mediumTermMeals < shortTermMeals) {
      console.warn('Invalid plan data - medium term meals cannot be less than short term:', plan);
      return null;
    }

    // Calculate total plan price for different meal counts
    const pricePerMeal = Number(plan.price_per_meal) || 0;
    const shortTermPrice = shortTermMeals * pricePerMeal;
    const mediumTermPrice = mediumTermMeals * pricePerMeal;

    // Normalize the plan data to match schema
    return {
      id: plan.id,
      title: plan.title,
      title_arabic: plan.title_arabic || null,
      description: plan.description || null,
      description_arabic: plan.description_arabic || null,
      
      // Pricing
      price_per_meal: pricePerMeal,
      price: pricePerMeal, // For backward compatibility
      
      // Meal configurations
      short_term_meals: shortTermMeals,
      medium_term_meals: mediumTermMeals,
      duration_days: durationDays,
      
      // Calculated prices for different meal counts
      short_term_price: shortTermPrice,
      medium_term_price: mediumTermPrice,
      
      // Nutritional targets
      target_calories_per_meal: Number(plan.target_calories_per_meal) || null,
      target_protein_per_meal: Number(plan.target_protein_per_meal) || null,
      target_carbs_per_meal: Number(plan.target_carbs_per_meal) || null,
      
      // Visual and organizational
      avatar_url: plan.avatar_url || null,
      is_active: Boolean(plan.is_active ?? true),
      sort_order: Number(plan.sort_order) || 0,
      
      // Legacy compatibility fields
      name: plan.title, // For backward compatibility
      mealsCount: mediumTermMeals, // For backward compatibility
      duration: durationDays, // For backward compatibility
      
      // Timestamps
      created_at: plan.created_at,
      updated_at: plan.updated_at
    };
  };

  const fetchPlans = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPlans(queryParams);
      const validatedPlans = data
        .map(validatePlanData)
        .filter(Boolean)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      setPlans(validatedPlans);
      return validatedPlans;
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlan = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanById(planId);
      const validatedPlan = validatePlanData(data);
      return validatedPlan;
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlan = useCallback(async (token, planData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate data before sending
      const validatedData = validatePlanData(planData);
      if (!validatedData) {
        throw new Error('Invalid plan data provided');
      }

      const newPlan = await createPlan(token, validatedData);
      const normalizedPlan = validatePlanData(newPlan);
      
      if (normalizedPlan) {
        setPlans(prev => [...prev, normalizedPlan].sort((a, b) => a.sort_order - b.sort_order));
      }
      
      return normalizedPlan;
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyPlan = useCallback(async (token, planId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await updatePlan(token, planId, updates);
      const normalizedPlan = validatePlanData(updatedPlan);
      
      if (normalizedPlan) {
        setPlans(prev => 
          prev.map(plan => plan.id === planId ? normalizedPlan : plan)
            .sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      
      return normalizedPlan;
    } catch (err) {
      console.error('Error updating plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePlan = useCallback(async (token, planId) => {
    setLoading(true);
    setError(null);
    try {
      await deletePlan(token, planId);
      setPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (err) {
      console.error('Error removing plan:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions for filtered plan queries
  const getActivePlans = useCallback(() => {
    return plans.filter(plan => plan.is_active);
  }, [plans]);

  const getPlansByPriceRange = useCallback((minPrice, maxPrice) => {
    return plans.filter(plan => 
      plan.is_active && 
      plan.price_per_meal >= minPrice && 
      plan.price_per_meal <= maxPrice
    );
  }, [plans]);

  const getPlansByDuration = useCallback((maxDays) => {
    return plans.filter(plan => 
      plan.is_active && 
      plan.duration_days <= maxDays
    );
  }, [plans]);

  const getPlansByMealCount = useCallback((minMeals, maxMeals) => {
    return plans.filter(plan => 
      plan.is_active && 
      plan.medium_term_meals >= minMeals && 
      plan.medium_term_meals <= maxMeals
    );
  }, [plans]);

  // Calculate plan metrics
  const calculatePlanMetrics = useCallback((plan, mealCount = null) => {
    if (!plan) return null;

    const effectiveMealCount = mealCount || plan.medium_term_meals;
    const totalPrice = effectiveMealCount * plan.price_per_meal;
    const pricePerDay = totalPrice / plan.duration_days;
    const mealsPerDay = effectiveMealCount / plan.duration_days;

    return {
      total_price: totalPrice,
      price_per_day: pricePerDay,
      meals_per_day: mealsPerDay,
      effective_meal_count: effectiveMealCount,
      duration_weeks: Math.ceil(plan.duration_days / 7)
    };
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    fetchPlan,
    addPlan,
    modifyPlan,
    removePlan,
    
    // Helper functions
    getActivePlans,
    getPlansByPriceRange,
    getPlansByDuration,
    getPlansByMealCount,
    calculatePlanMetrics
  };
}