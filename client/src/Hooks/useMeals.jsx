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
 * 
 * Relations:
 * - meal_items: junction table with items
 * - meal_allergies: junction table with allergies
 * - meal_reviews: reviews with user profiles
 */

export function useMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate and normalize meal data according to schema
  const validateMealData = (meal) => {
     if (!meal || typeof meal !== 'object') {
        console.warn('Invalid meal data - not an object:', meal);
        return null;
      }
    // Handle nested relations from API
    const processedMeal = {
      ...meal,
      // Extract items from meal_items junction table
      items: meal.meal_items?.map(mi => mi.items) || [],
      // Extract allergies from meal_allergies junction table
      allergies: meal.meal_allergies?.map(ma => ma.allergy_id) || [],
      // Extract reviews with user profiles
      reviews: meal.meal_reviews || []
    };

    // Map camelCase keys to snake_case for compatibility
    const normalizedMeal = {
      id: processedMeal.id,
      name: processedMeal.name,
      name_arabic: processedMeal.nameArabic || processedMeal.name_arabic || null,
      description: processedMeal.description || null,
      description_arabic: processedMeal.descriptionArabic || processedMeal.description_arabic || null,
      section: processedMeal.section || 'main',
      section_arabic: processedMeal.sectionArabic || processedMeal.section_arabic || null,
      base_price: processedMeal.basePrice || processedMeal.base_price || 0,
      calories: processedMeal.calories || 0,
      protein_g: processedMeal.proteinG || processedMeal.protein_g || 0,
      carbs_g: processedMeal.carbsG || processedMeal.carbs_g || 0,
      fat_g: processedMeal.fatG || processedMeal.fat_g || 0,
      fiber_g: processedMeal.fiberG || processedMeal.fiber_g || null,
      sugar_g: processedMeal.sugarG || processedMeal.sugar_g || null,
      sodium_mg: processedMeal.sodiumMg || processedMeal.sodium_mg || null,
      ingredients: processedMeal.ingredients || null,
      ingredients_arabic: processedMeal.ingredientsArabic || processedMeal.ingredients_arabic || null,
      preparation_instructions: processedMeal.preparationInstructions || processedMeal.preparation_instructions || null,
      image_url: processedMeal.imageUrl || processedMeal.image_url || null,
      thumbnail_url: processedMeal.thumbnailUrl || processedMeal.thumbnail_url || null,
      is_premium: processedMeal.isPremium || processedMeal.is_premium || false,
      is_vegetarian: processedMeal.isVegetarian || processedMeal.is_vegetarian || false,
      is_vegan: processedMeal.isVegan || processedMeal.is_vegan || false,
      is_gluten_free: processedMeal.isGlutenFree || processedMeal.is_gluten_free || false,
      is_dairy_free: processedMeal.isDairyFree || processedMeal.is_dairy_free || false,
      spice_level: processedMeal.spiceLevel || processedMeal.spice_level || 0,
      prep_time_minutes: processedMeal.prepTimeMinutes || processedMeal.prep_time_minutes || null,
      rating: processedMeal.rating || 0,
      rating_count: processedMeal.ratingCount || processedMeal.rating_count || 0,
      is_featured: processedMeal.isFeatured || processedMeal.is_featured || false,
      discount_percentage: processedMeal.discountPercentage || processedMeal.discount_percentage || 0,
      discount_valid_until: processedMeal.discountValidUntil || processedMeal.discount_valid_until || null,
      is_available: processedMeal.isAvailable !== undefined ? processedMeal.isAvailable : (processedMeal.is_available !== undefined ? processedMeal.is_available : true),
      created_at: processedMeal.createdAt || processedMeal.created_at,
      updated_at: processedMeal.updatedAt || processedMeal.updated_at,
      
      // Include processed relations
      items: processedMeal.items,
      allergies: processedMeal.allergies,
      reviews: processedMeal.reviews
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
    const items = meal.meal_items?.map(mi => mi.items) || 
    meal.items || 
    [];

    const allergies = meal.meal_allergies?.map(ma => ma.allergies) || 
        meal.allergies || 
        [];
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
      items,
      allergies,
      // Legacy compatibility fields
      rate: Number(normalizedMeal.rating) || 0,
      offerRatio: isDiscountActive ? (effectivePrice / basePrice) : 1,
      type: normalizedMeal.type || 'ready',
    };
  };

  // Public API methods (no authentication required)
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

  const fetchMeal = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
      try {
    const data = await mealsAPI.getMealById(mealId)
    if (!data) return null;    
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

  // Authenticated API methods (require user authentication)
  const fetchPlanMeals = useCallback(async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getPlanMeals(planId);
      // Plan meals come with meals nested, so we need to extract them
      const validatedMeals = data
        .map(planMeal => validateMealData(planMeal.meals))
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
      const result = await mealsAPI.addToFavorites(mealId);
      return result;
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
      const result = await mealsAPI.removeFromFavorites(mealId);
      return result;
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
      // Update local state with new rating if meal exists in current state
      setMeals(prev => 
        prev.map(meal => 
          meal.id === mealId 
            ? { ...meal, rating: result.rating }
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

  // Admin API methods (require admin authentication)
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

  // Update modifyMeal method
  const modifyMeal = useCallback(async (mealId, mealData) => {
    setLoading(true);
    setError(null);
    try {
      // Extract junction data
      const { allergies, items, ...baseData } = mealData;
      
      // Update base meal data
      const updatedMeal = await mealsAPI.updateMeal(mealId, baseData);
      
      // Fetch updated meal with relations
      const fullMeal = await mealsAPI.getMealById(mealId);
      const normalizedMeal = validateMealData(fullMeal);
      
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
      const result = await mealsAPI.deleteMeal(mealId);
      setMeals(prev => prev.filter(meal => meal.id !== mealId));
      return result;
    } catch (err) {
      console.error('Error removing meal:', err);
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
      const result = await mealsAPI.toggleMealAvailability(mealId, isAvailable);
      setMeals(prev => 
        prev.map(meal => 
          meal.id === mealId ? { ...meal, is_available: isAvailable } : meal
        )
      );
      return result;
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

  // Helper functions for filtered meal queries
  const getFeaturedMeals = useCallback(() => {
    return meals.filter(meal => meal.is_featured && meal.is_available);
  }, [meals]);

  const getDiscountedMeals = useCallback(() => {
    return meals.filter(meal => meal.discount_percentage && meal.is_available);
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

  const getGlutenFreeMeals = useCallback(() => {
    return meals.filter(meal => meal.is_gluten_free && meal.is_available);
  }, [meals]);

  const getDairyFreeMeals = useCallback(() => {
    return meals.filter(meal => meal.is_dairy_free && meal.is_available);
  }, [meals]);

  const getMealsBySpiceLevel = useCallback((spiceLevel) => {
    return meals.filter(meal => meal.spice_level === spiceLevel && meal.is_available);
  }, [meals]);

  const getPremiumMeals = useCallback(() => {
    return meals.filter(meal => meal.is_premium && meal.is_available);
  }, [meals]);

  const searchMeals = useCallback((searchTerm) => {
    if (!searchTerm) return meals;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return meals.filter(meal => 
      meal.is_available && (
        meal.name?.toLowerCase().includes(lowercaseSearch) ||
        meal.name_arabic?.toLowerCase().includes(lowercaseSearch) ||
        meal.description?.toLowerCase().includes(lowercaseSearch) ||
        meal.description_arabic?.toLowerCase().includes(lowercaseSearch) ||
        meal.ingredients?.toLowerCase().includes(lowercaseSearch) ||
        meal.ingredients_arabic?.toLowerCase().includes(lowercaseSearch)
      )
    );
  }, [meals]);
  const fetchMealAllergies = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getMealAllergies(mealId);
      return data;
    } catch (err) {
      console.error('Error fetching meal allergies:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMealItems = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealsAPI.getMealItems(mealId);
      return data;
    } catch (err) {
      console.error('Error fetching meal items:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    meals,
    loading,
    error,
    
    // Public API methods
    fetchMeals,
    fetchMeal,
    fetchMealsBySection,
    
    // Authenticated API methods
    fetchPlanMeals,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    rateMeal,
    
    // Admin API methods
    addMeal,
    modifyMeal,
    removeMeal,
    toggleMealAvailability,
    bulkUpdateMeals,
    getMealAnalytics,
    
    // Helper functions
    getFeaturedMeals,
    getDiscountedMeals,
    getMealsBySection,
    getHighRatedMeals,
    getVegetarianMeals,
    getVeganMeals,
    getGlutenFreeMeals,
    getDairyFreeMeals,
    getMealsBySpiceLevel,
    getPremiumMeals,
    searchMeals,
    fetchMealAllergies,
    fetchMealItems
  };

}