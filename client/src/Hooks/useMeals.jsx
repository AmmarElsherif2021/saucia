import { useState, useEffect, useCallback } from 'react';
import { mealsAPI } from '../API/mealAPI';

/**
 * Custom hook for managing meals according to Supabase schema
 * 
 * Meal schema (from Supabase):
 * - id: number (SERIAL PRIMARY KEY)
 * - name: string
 * - name_arabic: string
 * - description: string
 * - description_arabic: string
 * - section: string
 * - section_arabic: string
 * - base_price: number (NUMERIC(10,2))
 * - calories: number (INTEGER)
 * - protein_g: number (INTEGER)
 * - carbs_g: number (INTEGER)
 * - fat_g: number (INTEGER)
 * - fiber_g: number (INTEGER)
 * - sugar_g: number (INTEGER)
 * - sodium_mg: number (INTEGER)
 * - ingredients: string
 * - ingredients_arabic: string
 * - preparation_instructions: string
 * - image_url: string
 * - thumbnail_url: string
 * - is_premium: boolean
 * - is_vegetarian: boolean
 * - is_vegan: boolean
 * - is_gluten_free: boolean
 * - is_dairy_free: boolean
 * - spice_level: number (0-5)
 * - prep_time_minutes: number
 * - rating: number (NUMERIC(3,2), 0-5)
 * - rating_count: number (INTEGER)
 * - is_featured: boolean
 * - discount_percentage: number (NUMERIC(5,2), 0-100)
 * - discount_valid_until: string (TIMESTAMPTZ)
 * - is_available: boolean
 * - created_at: string (TIMESTAMPTZ)
 * - updated_at: string (TIMESTAMPTZ)
 */

export function useMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate and normalize meal data according to schema
  const validateMealData = (meal) => {
    if (!meal) return null;

    // Map camelCase keys to snake_case for compatibility
    const normalizedMeal = {
      id: meal.id,
      name: meal.name,
      name_arabic: meal.nameArabic || meal.name_arabic || null,
      description: meal.description || null,
      description_arabic: meal.descriptionArabic || meal.description_arabic || null,
      section: meal.section || 'main',
      section_arabic: meal.sectionArabic || meal.section_arabic || null,
      base_price: meal.basePrice || meal.base_price || 0,
      calories: meal.calories || 0,
      protein_g: meal.proteinG || meal.protein_g || 0,
      carbs_g: meal.carbsG || meal.carbs_g || 0,
      fat_g: meal.fatG || meal.fat_g || 0,
      fiber_g: meal.fiberG || meal.fiber_g || null,
      sugar_g: meal.sugarG || meal.sugar_g || null,
      sodium_mg: meal.sodiumMg || meal.sodium_mg || null,
      ingredients: meal.ingredients || null,
      ingredients_arabic: meal.ingredientsArabic || meal.ingredients_arabic || null,
      preparation_instructions: meal.preparationInstructions || meal.preparation_instructions || null,
      image_url: meal.imageUrl || meal.image_url || null,
      thumbnail_url: meal.thumbnailUrl || meal.thumbnail_url || null,
      is_premium: meal.isPremium || meal.is_premium || false,
      is_vegetarian: meal.isVegetarian || meal.is_vegetarian || false,
      is_vegan: meal.isVegan || meal.is_vegan || false,
      is_gluten_free: meal.isGlutenFree || meal.is_gluten_free || false,
      is_dairy_free: meal.isDairyFree || meal.is_dairy_free || false,
      spice_level: meal.spiceLevel || meal.spice_level || 0,
      prep_time_minutes: meal.prepTimeMinutes || meal.prep_time_minutes || null,
      rating: meal.rating || 0,
      rating_count: meal.ratingCount || meal.rating_count || 0,
      is_featured: meal.isFeatured || meal.is_featured || false,
      discount_percentage: meal.discountPercentage || meal.discount_percentage || 0,
      discount_valid_until: meal.discountValidUntil || meal.discount_valid_until || null,
      is_available: meal.isAvailable !== undefined ? meal.isAvailable : (meal.is_available !== undefined ? meal.is_available : true),
      created_at: meal.createdAt || meal.created_at,
      updated_at: meal.updatedAt || meal.updated_at
    };

    // Ensure required fields exist
    if (!normalizedMeal.name || typeof normalizedMeal.base_price !== 'number') {
      console.warn('Invalid meal data - missing required fields:', normalizedMeal);
      return null;
    }

    // Calculate effective price with discount
    const basePrice = Number(normalizedMeal.base_price) || 0;
    const discountPercentage = Number(normalizedMeal.discount_percentage) || 0;
    const discountValidUntil = normalizedMeal.discount_valid_until;
    
    let effectivePrice = basePrice;
    let isDiscountActive = false;
    
    if (discountPercentage > 0 && discountValidUntil) {
      const validUntilDate = new Date(discountValidUntil);
      if (validUntilDate > new Date()) {
        effectivePrice = basePrice * (1 - discountPercentage / 100);
        isDiscountActive = true;
      }
    }

    // Return normalized meal data
    return {
      ...normalizedMeal,
      price: effectivePrice,
      is_discount_active: isDiscountActive,
      // Legacy compatibility fields
      rate: Number(normalizedMeal.rating) || 0,
      offerRatio: isDiscountActive ? (effectivePrice / basePrice) : 1,
      type: normalizedMeal.type || 'ready',
    };
  };

  const fetchMeals = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getMeals(queryParams);
      const validatedMeals = data
        .map(validateMealData)
        .filter(Boolean);
      
      setMeals(validatedMeals);
      return validatedMeals;
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlanMeals = useCallback(async (planId, queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getPlanMeals(planId);
      const validatedMeals = data
        .map(validateMealData)
        .filter(Boolean);
      
      return validatedMeals;
    } catch (err) {
      console.error('Error fetching plan meals:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeal = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getMealById(mealId);
      const validatedMeal = validateMealData(data);
      return validatedMeal;
    } catch (err) {
      console.error('Error fetching meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMeal = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate data before sending
      const validatedData = validateMealData(mealData);
      if (!validatedData) {
        throw new Error('Invalid meal data provided');
      }

      const newMeal = await mealsAPI.createMeal(validatedData);
      const normalizedMeal = validateMealData(newMeal);
      
      if (normalizedMeal) {
        setMeals(prev => [...prev, normalizedMeal]);
      }
      
      return normalizedMeal;
    } catch (err) {
      console.error('Error creating meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyMeal = useCallback(async (mealId, mealData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMeal = await mealsAPI.updateMeal(mealId, mealData);
      const normalizedMeal = validateMealData(updatedMeal);
      
      if (normalizedMeal) {
        setMeals(prev => 
          prev.map(meal => meal.id === mealId ? normalizedMeal : meal)
        );
      }
      
      return normalizedMeal;
    } catch (err) {
      console.error('Error updating meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMeal = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      await mealsAPI.deleteMeal(mealId);
      setMeals(prev => prev.filter(meal => meal.id !== mealId));
    } catch (err) {
      console.error('Error removing meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getFavMealsOfClient(userId);
      const validatedMeals = data
        .map(validateMealData)
        .filter(Boolean);
      
      return validatedMeals;
    } catch (err) {
      console.error('Error fetching favorite meals:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      await mealsAPI.addToFavorites(mealId);
    } catch (err) {
      console.error('Error adding meal to favorites:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromFavorites = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      await mealsAPI.removeFromFavorites(mealId);
    } catch (err) {
      console.error('Error removing meal from favorites:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rateMeal = useCallback(async (mealId, rating) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mealsAPI.rateMeal(mealId, rating);
      // Update local state with new rating
      setMeals(prev => 
        prev.map(meal => 
          meal.id === mealId 
            ? { ...meal, rating: result.rating, rating_count: result.rating_count }
            : meal
        )
      );
      return result;
    } catch (err) {
      console.error('Error rating meal:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMealAvailability = useCallback(async (mealId, isAvailable) => {
    setLoading(true);
    setError(null);
    try {
      await mealsAPI.toggleMealAvailability(mealId, isAvailable);
      setMeals(prev => 
        prev.map(meal => 
          meal.id === mealId ? { ...meal, is_available: isAvailable } : meal
        )
      );
    } catch (err) {
      console.error('Error toggling meal availability:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateMeals = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMeals = await mealsAPI.bulkUpdateMeals(updates);
      const validatedMeals = updatedMeals
        .map(validateMealData)
        .filter(Boolean);
      
      setMeals(validatedMeals);
      return validatedMeals;
    } catch (err) {
      console.error('Error bulk updating meals:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealAnalytics = useCallback(async (timeframe = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await mealsAPI.getMealAnalytics(timeframe);
      return analytics;
    } catch (err) {
      console.error('Error fetching meal analytics:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMealsBySection = useCallback(async (section) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getMealsBySection(section);
      const validatedMeals = data
        .map(validateMealData)
        .filter(Boolean);
      
      setMeals(validatedMeals);
      return validatedMeals;
    } catch (err) {
      console.error('Error fetching meals by section:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions for filtered meal queries
  const getFeaturedMeals = useCallback(() => {
    return meals.filter(meal => meal.is_featured && meal.is_available);
  }, [meals]);

  const getDiscountedMeals = useCallback(() => {
    return meals.filter(meal => meal.is_discount_active && meal.is_available);
  }, [meals]);

  const getMealsBySection = useCallback((section) => {
    return meals.filter(meal => meal.section === section && meal.is_available);
  }, [meals]);

  const getHighRatedMeals = useCallback((minRating = 4.5) => {
    return meals.filter(meal => meal.rating >= minRating && meal.is_available)
      .sort((a, b) => b.rating - a.rating);
  }, [meals]);

  const getVegetarianMeals = useCallback(() => {
    return meals.filter(meal => meal.is_vegetarian && meal.is_available);
  }, [meals]);

  const getVeganMeals = useCallback(() => {
    return meals.filter(meal => meal.is_vegan && meal.is_available);
  }, [meals]);

  return {
    meals,
    loading,
    error,
    fetchMeals,
    fetchPlanMeals,
    fetchMeal,
    addMeal,
    modifyMeal,
    removeMeal,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    rateMeal,
    toggleMealAvailability,
    bulkUpdateMeals,
    getMealAnalytics,
    fetchMealsBySection,
    
    // Helper functions
    getFeaturedMeals,
    getDiscountedMeals,
    getMealsBySection,
    getHighRatedMeals,
    getVegetarianMeals,
    getVeganMeals
  };
}