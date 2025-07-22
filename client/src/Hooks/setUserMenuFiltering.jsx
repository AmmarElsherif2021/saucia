import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useUserAllergies } from './useUserAllergies';
import { allergiesAPI } from '../API/allergiesAPI';

export const useUserMenuFiltering = () => {
  const { 
    userAllergies: userAllergiesList, 
    isLoading: isLoadingUserAllergies 
  } = useUserAllergies();

  // Get user's allergy IDs
  const userAllergyIds = useMemo(() => {
    if (!userAllergiesList?.length) return [];
    return userAllergiesList.map(allergy => allergy.allergy_id);
  }, [userAllergiesList]);

  // Get user's allergy names for display
  const userAllergyNames = useMemo(() => {
    if (!userAllergiesList?.length) return [];
    return userAllergiesList.map(allergy => {
      const name = allergy.allergy?.name || allergy.name;
      return String(name).toLowerCase().trim();
    }).filter(name => name.length > 0);
  }, [userAllergiesList]);
  
      // Get items with specific allergies
  const getItemsWithAllergies = useQuery({
    queryKey: ['itemsWithAllergies', userAllergyIds],
    queryFn: () => allergiesAPI.getItemsWithAllergies(userAllergyIds),
    enabled: userAllergyIds.length > 0,
  });


  // Get meals with specific allergies
  const getMealsWithAllergies = useQuery({
    queryKey: ['mealsWithAllergies', userAllergyIds],
    queryFn: () => allergiesAPI.getMealsWithAllergies(userAllergyIds),
    enabled: userAllergyIds.length > 0,
  });

  // Create a Set of unsafe meal IDs for faster lookup
  const unsafeMealIds = useMemo(() => {
    const meals = getMealsWithAllergies.data || [];
    return new Set(meals.map(meal => meal.id));
  }, [getMealsWithAllergies.data]);

  // Check if a meal is safe for the user
  const isMealSafe = useCallback((meal) => {
  // If user has no allergies, all meals are safe
  if (!userAllergyIds.length) {
    return true;
  }
  
  // Check if meal ID is in the unsafe meals set
  const isUnsafe = unsafeMealIds.has(meal.id);
  return !isUnsafe;
}, [userAllergyIds, unsafeMealIds]);
  // Create a Set of unsafe item IDs for faster lookup
  const unsafeItemIdsSet = useMemo(() => {
    const items = getItemsWithAllergies.data || [];
    return new Set(items.map(item => item.id));
  }, [getItemsWithAllergies.data]);
const isItemSafe = useCallback((item) => {
  // If user has no allergies, all items are safe
  if (!userAllergyIds.length) {
    return true;
  }
  
  // Check if item ID is in the unsafe items set
  return !unsafeItemIdsSet.has(item.id);
}, [userAllergyIds, unsafeItemIdsSet]);

  // Get filtered allergens for a specific meal (for display purposes)
  const getMealAllergens = (meal) => {
    if (!meal?.allergens || !userAllergyIds.length) return [];
    
    return meal.allergens.filter(allergen => 
      userAllergyIds.includes(allergen.id)
    );
  };
  


  // Get allergens for a specific item (for display purposes)
  const getItemAllergens = (item) => {
    if (!item?.allergens || !userAllergyIds.length) return [];
    
    return item.allergens.filter(allergen => 
      userAllergyIds.includes(allergen.id)
    );
  };

  return {
    // Data
    unsafeMeals: getMealsWithAllergies.data || [],
    unsafeItems: getItemsWithAllergies.data || [],
    userAllergyIds,
    userAllergies: userAllergyNames,
    unsafeItemIds: Array.from(unsafeItemIdsSet),
    
    // Safety check functions
    isMealSafe,
    isItemSafe, 
    getMealAllergens,
    getItemAllergens,
    // Loading states
    isLoadingAllergies: isLoadingUserAllergies || 
                        getMealsWithAllergies.isLoading || 
                        getItemsWithAllergies.isLoading,
  };
};