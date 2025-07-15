import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { dietaryPreferencesAPI } from '../API/dietaryPreferencesAPI';

export const useUserDietaryPreferences = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Get all available dietary preferences
  const dietaryPreferencesQuery = useQuery({
    queryKey: ['dietaryPreferences'],
    queryFn: () => dietaryPreferencesAPI.listDietaryPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get user's dietary preferences
  const userDietaryPreferencesQuery = useQuery({
    queryKey: ['userDietaryPreferences', user?.id],
    queryFn: () => dietaryPreferencesAPI.getUserDietaryPreferences(user.id),
    enabled: !!user?.id,
  });

  // Get user-compatible meals (matching user's preferences)
  const compatibleMealsQuery = useQuery({
    queryKey: ['userCompatibleMeals', user?.id],
    queryFn: () => dietaryPreferencesAPI.getUserCompatibleMeals(user.id),
    enabled: !!user?.id,
  });

  // Add dietary preference to user
  const addPreferenceMutation = useMutation({
    mutationFn: (preferenceData) => 
      dietaryPreferencesAPI.addUserDietaryPreference(user.id, preferenceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDietaryPreferences', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Remove dietary preference from user
  const removePreferenceMutation = useMutation({
    mutationFn: (preferenceId) => 
      dietaryPreferencesAPI.removeUserDietaryPreference(user.id, preferenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDietaryPreferences', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Bulk update user dietary preferences
  const bulkUpdatePreferencesMutation = useMutation({
    mutationFn: (preferencesData) => 
      dietaryPreferencesAPI.updateUserDietaryPreferencesBulk(user.id, preferencesData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDietaryPreferences', user.id] });
      //queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
      //queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Get meals for specific dietary preferences
  const getMealsForPreferences = (preferenceIds) => {
    return useQuery({
      queryKey: ['mealsForPreferences', preferenceIds],
      queryFn: () => dietaryPreferencesAPI.getMealsForPreferences(preferenceIds),
      enabled: !!preferenceIds?.length,
    });
  };

  return {
    // Data
    dietaryPreferences: dietaryPreferencesQuery.data || [],
    userDietaryPreferences: userDietaryPreferencesQuery.data || [],
    compatibleMeals: compatibleMealsQuery.data || [],
    
    // Loading states
    isLoadingDietaryPreferences: dietaryPreferencesQuery.isLoading,
    isLoadingUserDietaryPreferences: userDietaryPreferencesQuery.isLoading,
    isLoadingCompatibleMeals: compatibleMealsQuery.isLoading,
    
    // Error states
    dietaryPreferencesError: dietaryPreferencesQuery.error,
    userDietaryPreferencesError: userDietaryPreferencesQuery.error,
    compatibleMealsError: compatibleMealsQuery.error,
    
    // Mutation functions
    addPreference: addPreferenceMutation.mutateAsync,
    removePreference: removePreferenceMutation.mutateAsync,
    bulkUpdatePreferences: bulkUpdatePreferencesMutation.mutateAsync,
    
    // Mutation loading states
    isAddingPreference: addPreferenceMutation.isPending,
    isRemovingPreference: removePreferenceMutation.isPending,
    isBulkUpdatingPreferences: bulkUpdatePreferencesMutation.isPending,
    
    // Dynamic query functions
    getMealsForPreferences,
    
    // Refetch functions
    refetchDietaryPreferences: dietaryPreferencesQuery.refetch,
    refetchUserDietaryPreferences: userDietaryPreferencesQuery.refetch,
    refetchCompatibleMeals: compatibleMealsQuery.refetch,
  };
};