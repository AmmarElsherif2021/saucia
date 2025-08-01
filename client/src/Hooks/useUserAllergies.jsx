import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { allergiesAPI } from '../API/allergiesAPI';

export const useUserAllergies = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Get all available allergies
  const allergiesQuery = useQuery({
    queryKey: ['allergies'],
    queryFn: () => allergiesAPI.listAllergies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      //console.log(`Allergies fetched: ${data.length || 0} allergies`);
    }
  });
  
  // Get user's allergies with severity overrides
  const userAllergiesQuery = useQuery({
    queryKey: ['userAllergies', user?.id],
    queryFn: () => allergiesAPI.getUserAllergies(user.id),
    enabled: !!user?.id,
  });

  // Get user-safe meals (excluding user's allergies)
  const safeMealsQuery = useQuery({
    queryKey: ['userSafeMeals', user?.id],
    queryFn: () => allergiesAPI.getUserSafeMeals(user.id),
    enabled: !!user?.id,
  });

  // Get user-safe items (excluding user's allergies)
  const safeItemsQuery = useQuery({
    queryKey: ['userSafeItems', user?.id],
    queryFn: () => allergiesAPI.getUserSafeItems(user.id),
    enabled: !!user?.id,
  });

  // Add allergy to user
  const addAllergyMutation = useMutation({
    mutationFn: (allergyData) => 
      allergiesAPI.addUserAllergy(user.id, allergyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAllergies', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userSafeMeals', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userSafeItems', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Update user's allergy severity override
  const updateAllergyMutation = useMutation({
    mutationFn: ({ allergyId, severityData }) => 
      allergiesAPI.updateUserAllergy(user.id, allergyId, severityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAllergies', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userSafeMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userSafeItems', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Remove allergy from user
  const removeAllergyMutation = useMutation({
    mutationFn: (allergyId) => 
      allergiesAPI.removeUserAllergy(user.id, allergyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAllergies', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userSafeMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userSafeItems', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Bulk update user allergies
  const bulkUpdateAllergiesMutation = useMutation({
    mutationFn: (allergiesData) => 
      allergiesAPI.updateUserAllergiesBulk(user.id, allergiesData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAllergies', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userSafeMeals', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userSafeItems', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['userCompatibleMeals', user.id] });
    //   queryClient.invalidateQueries({ queryKey: ['filteredMenuForUser', user.id] });
    },
  });

  // Get meals with specific allergies
  const getMealsWithAllergies = (allergyIds) => {
    return useQuery({
      queryKey: ['mealsWithAllergies', allergyIds],
      queryFn: () => allergiesAPI.getMealsWithAllergies(allergyIds),
      enabled: !!allergyIds?.length,
    });
  };

  // Get items with specific allergies
  const getItemsWithAllergies = (allergyIds) => {
    return useQuery({
      queryKey: ['itemsWithAllergies', allergyIds],
      queryFn: () => allergiesAPI.getItemsWithAllergies(allergyIds),
      enabled: !!allergyIds?.length,
    });
  };

  return {
    // Data
    allergies: allergiesQuery.data || [],
    userAllergies: userAllergiesQuery.data || [],
    safeMeals: safeMealsQuery.data || [],
    safeItems: safeItemsQuery.data || [],
    
    // Loading states
    isLoadingAllergies: allergiesQuery.isLoading,
    isLoadingUserAllergies: userAllergiesQuery.isLoading,
    isLoadingSafeMeals: safeMealsQuery.isLoading,
    isLoadingSafeItems: safeItemsQuery.isLoading,
    
    // Error states
    allergiesError: allergiesQuery.error,
    userAllergiesError: userAllergiesQuery.error,
    safeMealsError: safeMealsQuery.error,
    safeItemsError: safeItemsQuery.error,
    
    // Mutation functions
    addAllergy: addAllergyMutation.mutateAsync,
    updateAllergy: updateAllergyMutation.mutateAsync,
    removeAllergy: removeAllergyMutation.mutateAsync,
    bulkUpdateAllergies: bulkUpdateAllergiesMutation.mutateAsync,
    
    // Mutation loading states
    isAddingAllergy: addAllergyMutation.isPending,
    isUpdatingAllergy: updateAllergyMutation.isPending,
    isRemovingAllergy: removeAllergyMutation.isPending,
    isBulkUpdatingAllergies: bulkUpdateAllergiesMutation.isPending,
    
    // Dynamic query functions
    getMealsWithAllergies,
    getItemsWithAllergies,
    
    // Refetch functions
    refetchAllergies: allergiesQuery.refetch,
    refetchUserAllergies: userAllergiesQuery.refetch,
    refetchSafeMeals: safeMealsQuery.refetch,
    refetchSafeItems: safeItemsQuery.refetch,
  };
};