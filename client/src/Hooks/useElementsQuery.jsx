import { useQuery } from '@tanstack/react-query';
import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';

// Centralized query key factory for consistency across app
export const elementsKeys = {
  all: ['elements'],
  items: () => [...elementsKeys.all, 'items'],
  meals: (params) => [...elementsKeys.all, 'meals', params],
  plans: () => [...elementsKeys.all, 'plans'],
  categories: () => [...elementsKeys.all, 'categories'],
  featured: (type) => [...elementsKeys.all, 'featured', type],
  // NEW: Query key for meal selectable items
  mealSelectableItems: (mealId) => [...elementsKeys.all, 'meal-selectable-items', mealId],
};

// Base query configuration
const BASE_QUERY_CONFIG = {
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

// Enhanced queries with better configuration
export const useItemsQuery = (options = {}) => useQuery({
  queryKey: elementsKeys.items(),
  queryFn: itemsAPI.listItems,
  staleTime: 15 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});

export const useMealsQuery = (params = null, options = {}) => useQuery({
  queryKey: elementsKeys.meals(params),
  queryFn: () => mealsAPI.getMeals(params),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});

export const usePlansQuery = (options = {}) => useQuery({
  queryKey: elementsKeys.plans(),
  queryFn: plansAPI.listPlans,
  staleTime: 30 * 60 * 1000,
  gcTime: 2 * 60 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});

export const useFeaturedMealsQuery = (options = {}) => useQuery({
  queryKey: elementsKeys.featured('meals'),
  queryFn: () => mealsAPI.getMeals({ is_featured: true }),
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});

export const useCategoriesQuery = (options = {}) => useQuery({
  queryKey: elementsKeys.categories(),
  queryFn: async () => {
    const items = await itemsAPI.listItems();
    return [...new Set(items.map(item => item.category))];
  },
  staleTime: 60 * 60 * 1000,
  gcTime: 2 * 60 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});

// NEW: Hook for fetching selectable items for a specific meal
export const useMealSelectableItemsQuery = (mealId, options = {}) => useQuery({
  queryKey: elementsKeys.mealSelectableItems(mealId),
  queryFn: () => mealsAPI.getMealSelectableItems(mealId),
  enabled: !!mealId, // Only run if mealId is provided
  staleTime: 15 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  ...BASE_QUERY_CONFIG,
  ...options
});