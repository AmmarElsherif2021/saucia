import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { dietaryPreferencesAPI } from '../API/dietaryPreferencesAPI';
import { allergiesAPI } from '../API/allergiesAPI';

export const useUserMenuFiltering = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Get filtered menu based on user's preferences and allergies
  const filteredMenuQuery = useQuery({
    queryKey: ['filteredMenuForUser', user?.id],
    queryFn: () => dietaryPreferencesAPI.getFilteredMenuForUser(user.id),
    enabled: !!user?.id,
  });

  // Get meals with specific allergies (for filtering)
  const getMealsWithAllergiesQuery = (allergyIds) => 
    useQuery({
      queryKey: ['mealsWithAllergies', allergyIds],
      queryFn: () => allergiesAPI.getMealsWithAllergies(allergyIds),
      enabled: !!allergyIds?.length,
    });

  // Get items with specific allergies (for filtering)
  const getItemsWithAllergiesQuery = (allergyIds) => 
    useQuery({
      queryKey: ['itemsWithAllergies', allergyIds],
      queryFn: () => allergiesAPI.getItemsWithAllergies(allergyIds),
      enabled: !!allergyIds?.length,
    });

  // Get meals for specific dietary preferences
  const getMealsForPreferencesQuery = (preferenceIds) => 
    useQuery({
      queryKey: ['mealsForPreferences', preferenceIds],
      queryFn: () => dietaryPreferencesAPI.getMealsForPreferences(preferenceIds),
      enabled: !!preferenceIds?.length,
    });

  // Apply custom filters to menu
  const applyCustomFiltersMutation = useMutation({
    mutationFn: (filters) => 
      dietaryPreferencesAPI.getFilteredMenuForUser(user.id, filters),
    onSuccess: (data) => {
      queryClient.setQueryData(['filteredMenuForUser', user.id], data);
    },
  });

  // Refresh filtered menu based on current user preferences/allergies
  const refreshFilteredMenu = () => {
    queryClient.invalidateQueries(['filteredMenuForUser', user.id]);
    queryClient.invalidateQueries(['userSafeMeals', user.id]);
    queryClient.invalidateQueries(['userSafeItems', user.id]);
    queryClient.invalidateQueries(['userCompatibleMeals', user.id]);
  };

  return {
    // Data
    filteredMenu: filteredMenuQuery.data || { meals: [], items: [] },
    
    // Loading states
    isLoadingFilteredMenu: filteredMenuQuery.isLoading,
    isApplyingCustomFilters: applyCustomFiltersMutation.isPending,
    
    // Error states
    filteredMenuError: filteredMenuQuery.error,
    customFiltersError: applyCustomFiltersMutation.error,
    
    // Query functions for dynamic filtering
    getMealsWithAllergies: getMealsWithAllergiesQuery,
    getItemsWithAllergies: getItemsWithAllergiesQuery,
    getMealsForPreferences: getMealsForPreferencesQuery,
    
    // Mutation functions
    applyCustomFilters: applyCustomFiltersMutation.mutateAsync,
    refreshFilteredMenu,
    
    // Refetch functions
    refetchFilteredMenu: filteredMenuQuery.refetch,
  };
};