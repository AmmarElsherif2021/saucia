import { useQuery } from '@tanstack/react-query';
import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';

export const useItemsQuery = () => useQuery({
  queryKey: ['items'],
  queryFn: itemsAPI.listItems,
  staleTime: 15 * 60 * 1000
});

export const useMealsQuery = (params) => useQuery({
  queryKey: ['meals', params],
  queryFn: () => mealsAPI.getMeals(params),
  staleTime: 5 * 60 * 1000
});

export const usePlansQuery = () => useQuery({
  queryKey: ['plans'],
  queryFn: plansAPI.listPlans,
  staleTime: 30 * 60 * 1000
});
