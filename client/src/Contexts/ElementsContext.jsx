// ElementsContext.jsx
import { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useItemsQuery, 
  useMealsQuery, 
  usePlansQuery, 
  useFeaturedMealsQuery,
  useMealSelectableItemsQuery,
  elementsKeys 
} from '../Hooks/useElementsQuery';
import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';

const ElementsContext = createContext();

export const ElementsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  
  // Enhanced query options with better error handling
  const queryOptions = {
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  };
  
  const itemsQuery = useItemsQuery(queryOptions);
  const mealsQuery = useMealsQuery(queryOptions);
  const plansQuery = usePlansQuery(queryOptions);
  const featuredMealsQuery = useFeaturedMealsQuery(queryOptions);

  // Track initialization state
  useEffect(() => {
    const hasData = itemsQuery.data && mealsQuery.data && plansQuery.data;
    const hasError = itemsQuery.error || mealsQuery.error || plansQuery.error;
    const isLoading = itemsQuery.isLoading || mealsQuery.isLoading || plansQuery.isLoading;
    
    if (hasError && !isLoading) {
      setInitializationError(hasError);
      setIsInitialized(true); // Set to true to stop loading state
    } else if (hasData && !isLoading) {
      setInitializationError(null);
      setIsInitialized(true);
    }
  }, [
    itemsQuery.data, mealsQuery.data, plansQuery.data,
    itemsQuery.error, mealsQuery.error, plansQuery.error,
    itemsQuery.isLoading, mealsQuery.isLoading, plansQuery.isLoading
  ]);

  // Safely extract data with fallbacks
  const items = useMemo(() => {
    try {
      return Array.isArray(itemsQuery.data) ? itemsQuery.data : [];
    } catch (error) {
      console.error('Error processing items data:', error);
      return [];
    }
  }, [itemsQuery.data]);

  const meals = useMemo(() => {
    try {
      return Array.isArray(mealsQuery.data) ? mealsQuery.data : [];
    } catch (error) {
      console.error('Error processing meals data:', error);
      return [];
    }
  }, [mealsQuery.data]);

  const plans = useMemo(() => {
    try {
      return Array.isArray(plansQuery.data) ? plansQuery.data : [];
    } catch (error) {
      console.error('Error processing plans data:', error);
      return [];
    }
  }, [plansQuery.data]);

  const featuredMeals = useMemo(() => {
    try {
      if (Array.isArray(featuredMealsQuery.data)) {
        return featuredMealsQuery.data;
      }
      return meals.filter(meal => meal && meal.is_featured);
    } catch (error) {
      console.error('Error processing featured meals:', error);
      return [];
    }
  }, [featuredMealsQuery.data, meals]);

  // REMOVED: saladItems and fruitItems derived states
  // These are no longer needed due to dynamic meal_items junction table

  // Derived data with safety checks
  const availableMeals = useMemo(() => {
    try {
      return meals.filter(meal => meal && meal.is_available);
    } catch (error) {
      console.error('Error filtering available meals:', error);
      return [];
    }
  }, [meals]);

  const availablePlans = useMemo(() => {
    try {
      return plans.filter(plan => plan && plan.is_available);
    } catch (error) {
      console.error('Error filtering available plans:', error);
      return [];
    }
  }, [plans]);

  const categories = useMemo(() => {
    try {
      const categorySet = new Set();
      items.forEach(item => {
        if (item && item.category) {
          categorySet.add(item.category);
        }
      });
      return Array.from(categorySet);
    } catch (error) {
      console.error('Error processing categories:', error);
      return [];
    }
  }, [items]);

  const mealSections = useMemo(() => {
    try {
      const sections = {};
      
      availableMeals.forEach(meal => {
        if (!meal || !meal.id) return;
        
        const sectionName = (meal.section || 'Other')
          .toString()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/['"]/g, '');
          
        if (!sections[sectionName]) {
          sections[sectionName] = {
            name: sectionName,
            name_arabic: meal.section_arabic || sectionName,
            meals: []
          };
        }
        sections[sectionName].meals.push(meal);
      });

      return Object.values(sections);
    } catch (error) {
      console.error('Error processing meal sections:', error);
      return [];
    }
  }, [availableMeals]);

  // NEW: Function to get selectable items for a specific meal
  const getMealSelectableItems = useCallback(async (mealId) => {
    try {
      // Check if we have cached data first
      const cachedData = queryClient.getQueryData(
        elementsKeys.mealSelectableItems(mealId)
      );
      if (cachedData) return cachedData;

      // Fetch fresh data if not cached
      const data = await queryClient.fetchQuery({
        queryKey: elementsKeys.mealSelectableItems(mealId),
        queryFn: () => mealsAPI.getMealSelectableItems(mealId),
        staleTime: 15 * 60 * 1000,
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching selectable items for meal ${mealId}:`, error);
      return [];
    }
  }, [queryClient]);

  // Loading and error states
  const isLoading = itemsQuery.isLoading || mealsQuery.isLoading || plansQuery.isLoading;
  const isFetching = itemsQuery.isFetching || mealsQuery.isFetching || plansQuery.isFetching;
  const error = initializationError || itemsQuery.error || mealsQuery.error || plansQuery.error;
  
  // Set initialization state based on query statuses
  useEffect(() => {
    const queries = [
      itemsQuery, 
      mealsQuery, 
      plansQuery,
      featuredMealsQuery
    ];

    // Check if any query is still loading
    const isLoading = queries.some(q => q.isLoading);
    
    // Check if we have any errors
    const errors = queries.filter(q => q.error);
    
    if (!isLoading) {
      if (errors.length > 0) {
        setInitializationError(errors[0].error);
      }
      setIsInitialized(true);
    }
  }, [
    itemsQuery.status, 
    mealsQuery.status, 
    plansQuery.status,
    featuredMealsQuery.status
  ]);

  // Enhanced refetch functions with error handling
  const refetchAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        itemsQuery.refetch(),
        mealsQuery.refetch(),
        plansQuery.refetch(),
        featuredMealsQuery.refetch()
      ]);
      
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some refetch operations failed:', failures);
      }
      
      return results;
    } catch (error) {
      console.error('Refetch all failed:', error);
      throw error;
    }
  }, [itemsQuery, mealsQuery, plansQuery, featuredMealsQuery]);

  const refetchItems = useCallback(async () => {
    try {
      return await itemsQuery.refetch();
    } catch (error) {
      console.error('Refetch items failed:', error);
      throw error;
    }
  }, [itemsQuery]);

  const refetchMeals = useCallback(async () => {
    try {
      return await mealsQuery.refetch();
    } catch (error) {
      console.error('Refetch meals failed:', error);
      throw error;
    }
  }, [mealsQuery]);

  const refetchPlans = useCallback(async () => {
    try {
      return await plansQuery.refetch();
    } catch (error) {
      console.error('Refetch plans failed:', error);
      throw error;
    }
  }, [plansQuery]);

  // Enhanced prefetch with timeout and error handling
  const prefetchRelatedData = useCallback(async (dataType) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Prefetch timeout')), 10000)
    );

    try {
      const prefetchPromise = (async () => {
        switch (dataType) {
          case 'menu':
            await Promise.all([
              queryClient.prefetchQuery({
                queryKey: elementsKeys.items(),
                queryFn: itemsAPI.listItems,
                staleTime: 15 * 60 * 1000,
              }),
              queryClient.prefetchQuery({
                queryKey: elementsKeys.meals(),
                queryFn: () => mealsAPI.getMeals(),
                staleTime: 5 * 60 * 1000,
              })
            ]);
            break;
            
          case 'premium':
            await queryClient.prefetchQuery({
              queryKey: elementsKeys.plans(),
              queryFn: plansAPI.listPlans,
              staleTime: 30 * 60 * 1000,
            });
            break;
            
          case 'featured':
            await queryClient.prefetchQuery({
              queryKey: elementsKeys.featured('meals'),
              queryFn: () => mealsAPI.getMeals({ is_featured: true }),
              staleTime: 10 * 60 * 1000,
            });
            break;
            
          default:
            console.warn(`Unknown prefetch data type: ${dataType}`);
        }
      })();

      await Promise.race([prefetchPromise, timeoutPromise]);
    } catch (error) {
      console.error(`Prefetch failed for ${dataType}:`, error);
      throw error;
    }
  }, [queryClient]);

  const contextValue = useMemo(() => ({
    // Data
    items,
    meals,
    plans,
    featuredMeals,
    // REMOVED: saladItems, fruitItems
    availableMeals,
    availablePlans,
    categories,
    mealSections,
    
    // NEW: Function to get selectable items per meal
    getMealSelectableItems,
    
    // State
    isLoading,
    isFetching,
    elementsLoading: isLoading,
    isInitialized,
    error,
    
    // Actions
    refetchAll,
    refetchItems,
    refetchMeals,
    refetchPlans,
    prefetchRelatedData,
  }), [
    items,
    meals,
    plans,
    featuredMeals,
    availableMeals,
    availablePlans,
    categories,
    mealSections,
    getMealSelectableItems, // NEW dependency
    isLoading,
    isFetching,
    isInitialized,
    error,
    refetchAll,
    refetchItems,
    refetchMeals,
    refetchPlans,
    prefetchRelatedData,
  ]);

  return (
    <ElementsContext.Provider value={contextValue}>
      {children}
    </ElementsContext.Provider>
  );
};

export const useElements = () => {
  const context = useContext(ElementsContext);
  if (!context) {
    throw new Error('useElements must be used within an ElementsProvider');
  }
  return context;
};

// Updated hooks - removed saladItems and fruitItems
export const useElementsItems = () => {
  const { items, isLoading, refetchItems, error } = useElements();
  return { 
    items, 
    // REMOVED: saladItems, fruitItems
    loading: isLoading, 
    refetch: refetchItems,
    error
  };
};

export const useElementsMeals = () => {
  const { 
    meals, 
    availableMeals, 
    featuredMeals, 
    mealSections, 
    isLoading, 
    refetchMeals,
    error,
    getMealSelectableItems // NEW: Expose the function
  } = useElements();
  return { 
    meals,
    availableMeals,
    featuredMeals, 
    mealSections,
    loading: isLoading, 
    refetch: refetchMeals,
    error,
    getMealSelectableItems // NEW: Include in return
  };
};

export const useElementsPlans = () => {
  const { plans, availablePlans, isLoading, refetchPlans } = useElements();
  return { 
    plans, 
    availablePlans, 
    loading: isLoading, 
    refetch: refetchPlans 
  };
};