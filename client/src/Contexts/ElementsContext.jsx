// src/Contexts/OptimizedElementsContext.jsx
import { createContext, useContext, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';
import { useItemsQuery, useMealsQuery, usePlansQuery } from '../Hooks/useElementsQuery';

const ElementsContext = createContext();

// Query configurations with different cache strategies
const QUERY_CONFIGS = {
  items: {
    staleTime: 15 * 60 * 1000, // 15 minutes - items change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  meals: {
    staleTime: 5 * 60 * 1000, // 5 minutes - meals change more frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  plans: {
    staleTime: 30 * 60 * 1000, // 30 minutes - plans are very stable
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
};

export const ElementsProvider = ({ children }) => {
  const itemsQuery = useItemsQuery();
  const mealsQuery = useMealsQuery();
  const plansQuery = usePlansQuery();

  const contextValue = useMemo(() => {
    const items = itemsQuery.data || [];
    const meals = mealsQuery.data || [];
    const plans = plansQuery.data || [];

    // Compute derived data
    const featuredMeals = meals.filter(meal => meal.is_featured);
    const saladItems = items.filter(item => item.category !== 'salad-fruits');
    
    return {
      items,
      meals,
      plans,
      featuredMeals,
      saladItems,
      isRefetching: itemsQuery.isFetching || mealsQuery.isFetching,
      isLoading: itemsQuery.isLoading || mealsQuery.isLoading,
      error: itemsQuery.error || mealsQuery.error,
      refetchAll: () => {
        itemsQuery.refetch();
        mealsQuery.refetch();
        plansQuery.refetch();
      }
    };
  }, [itemsQuery, mealsQuery, plansQuery]);

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

// Selective hooks for specific data (optional - for better performance)
export const useElementsItems = () => {
  const { items, itemsLoading, refetchItems } = useElements();
  return { items, loading: itemsLoading, refetch: refetchItems };
};

export const useElementsMeals = () => {
  const { meals, featuredMeals, offersMeals, signatureSalads, mealsLoading, refetchMeals } = useElements();
  return { 
    meals, 
    featuredMeals, 
    offersMeals, 
    signatureSalads, 
    loading: mealsLoading, 
    refetch: refetchMeals 
  };
};

export const useElementsPlans = () => {
  const { plans, plansLoading, refetchPlans } = useElements();
  return { plans, loading: plansLoading, refetch: refetchPlans };
};