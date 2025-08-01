/* 
=================================================================

All hooks uses the auth context for user ID and session state
=================================================================
*/
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { userAPI } from '../API/userAPI';

// 1. User Profile Hook
export const useUserProfile = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => userAPI.getUserProfile(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Add updateUserProfile mutation
  const updateProfile = useMutation({
    mutationFn: (data) => userAPI.updateUserProfile(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', user.id]);
    }
  });

  // Add completeUserProfile mutation
  const completeProfile = useMutation({
    mutationFn: (data) => userAPI.completeUserProfile(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', user.id]);
    }
  });

  return {
    data: profileQuery.data,
    ...profileQuery,
    updateProfile: updateProfile.mutateAsync,
    isUpdatingProfile: updateProfile.isPending,
    completeProfile: completeProfile.mutateAsync,
    isCompletingProfile: completeProfile.isPending,
  };
};

// 2. User Health Profile Hook
export const useHealthProfile = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const healthProfileQuery = useQuery({
    queryKey: ['healthProfile', user?.id],
    queryFn: () => userAPI.getUserHealthProfile(user.id),
    enabled: !!user?.id
  });

  // Add update mutation for healthProfile
  const updateHealthProfile = useMutation({
    mutationFn: (data) => userAPI.createOrUpdateHealthProfile(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['healthProfile', user.id]);
    }
  });

  return {
    ...healthProfileQuery,
    updateHealthProfile: updateHealthProfile.mutateAsync,
    isUpdatingHealthProfile: updateHealthProfile.isPending,
  };
}

// 3. Address Management Hooks
export const useUserAddresses = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const addressesQuery = useQuery({
    queryKey: ['userAddresses', user?.id],
    queryFn: () => userAPI.getUserAddresses(user.id),
    enabled: !!user?.id
  });
  
  const addMutation = useMutation({
    mutationFn: (addressData) => userAPI.createUserAddress(user.id, addressData),
    onSuccess: () => queryClient.invalidateQueries(['userAddresses', user.id])
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ addressId, addressData }) => 
      userAPI.updateUserAddress(addressId, addressData),
    onSuccess: () => queryClient.invalidateQueries(['userAddresses', user.id])
  });
  
  const deleteMutation = useMutation({
    mutationFn: (addressId) => userAPI.deleteUserAddress(addressId),
    onSuccess: () => queryClient.invalidateQueries(['userAddresses', user.id])
  });
  
  return {
    addresses: addressesQuery.data || [],
    isLoading: addressesQuery.isLoading,
    addAddress: addMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync
  };
};
// 6. User Allergies Hook
export const useUserAllergies = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    const allergiesQuery = useQuery({
      queryKey: ['userAllergies', user?.id],
      queryFn: () => userAPI.getUserAllergies(user.id),
      enabled: !!user?.id
    });
    
    const addMutation = useMutation({
      mutationFn: ({ allergyId, severityLevel }) => 
        userAPI.addUserAllergy(user.id, allergyId, severityLevel),
      onSuccess: () => {
        queryClient.invalidateQueries(['userAllergies', user.id]);
      }
    });
    
    const removeMutation = useMutation({
      mutationFn: (allergyId) => userAPI.removeUserAllergy(user.id, allergyId),
      onSuccess: () => {
        queryClient.invalidateQueries(['userAllergies', user.id]);
      }
    });
    
    return {
      allergies: allergiesQuery.data || [],
      isLoading: allergiesQuery.isLoading,
      isError: allergiesQuery.isError,
      error: allergiesQuery.error,
      addAllergy: addMutation.mutateAsync,
      removeAllergy: removeMutation.mutateAsync,
      isAddingAllergy: addMutation.isPending,
      isRemovingAllergy: removeMutation.isPending
    };
  };
  
  // 7. User Dietary Preferences Hook
  export const useDietaryPreferences = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    const preferencesQuery = useQuery({
      queryKey: ['dietaryPreferences', user?.id],
      queryFn: () => userAPI.getUserDietaryPreferences(user.id),
      enabled: !!user?.id
    });
    
    const addMutation = useMutation({
      mutationFn: (preferenceId) => 
        userAPI.addUserDietaryPreference(user.id, preferenceId),
      onSuccess: () => {
        queryClient.invalidateQueries(['dietaryPreferences', user.id]);
      }
    });
    
    const removeMutation = useMutation({
      mutationFn: (preferenceId) => 
        userAPI.removeUserDietaryPreference(user.id, preferenceId),
      onSuccess: () => {
        queryClient.invalidateQueries(['dietaryPreferences', user.id]);
      }
    });
    
    return {
      preferences: preferencesQuery.data || [],
      isLoading: preferencesQuery.isLoading,
      isError: preferencesQuery.isError,
      error: preferencesQuery.error,
      addPreference: addMutation.mutateAsync,
      removePreference: removeMutation.mutateAsync,
      isAddingPreference: addMutation.isPending,
      isRemovingPreference: removeMutation.isPending
    };
  };
  
  // 8. Favorites Management Hook
  export const useFavorites = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    const favoriteMealsQuery = useQuery({
      queryKey: ['favoriteMeals', user?.id],
      queryFn: () => userAPI.getUserFavoriteMeals(user.id),
      enabled: !!user?.id
    });
    
    const favoriteItemsQuery = useQuery({
      queryKey: ['favoriteItems', user?.id],
      queryFn: () => userAPI.getUserFavoriteItems(user.id),
      enabled: !!user?.id
    });
    
    const addFavoriteMeal = useMutation({
      mutationFn: (mealId) => userAPI.addUserFavoriteMeal(user.id, mealId),
      onSuccess: () => {
        queryClient.invalidateQueries(['favoriteMeals', user.id]);
      }
    });
    
    const removeFavoriteMeal = useMutation({
      mutationFn: (mealId) => userAPI.removeUserFavoriteMeal(user.id, mealId),
      onSuccess: () => {
        queryClient.invalidateQueries(['favoriteMeals', user.id]);
      }
    });
    
    const addFavoriteItem = useMutation({
      mutationFn: (itemId) => userAPI.addUserFavoriteItem(user.id, itemId),
      onSuccess: () => {
        queryClient.invalidateQueries(['favoriteItems', user.id]);
      }
    });
    
    const removeFavoriteItem = useMutation({
      mutationFn: (itemId) => userAPI.removeUserFavoriteItem(user.id, itemId),
      onSuccess: () => {
        queryClient.invalidateQueries(['favoriteItems', user.id]);
      }
    });
    
    return {
      favoriteMeals: favoriteMealsQuery.data || [],
      favoriteItems: favoriteItemsQuery.data || [],
      isLoadingMeals: favoriteMealsQuery.isLoading,
      isLoadingItems: favoriteItemsQuery.isLoading,
      isError: favoriteMealsQuery.isError || favoriteItemsQuery.isError,
      error: favoriteMealsQuery.error || favoriteItemsQuery.error,
      addFavoriteMeal: addFavoriteMeal.mutateAsync,
      removeFavoriteMeal: removeFavoriteMeal.mutateAsync,
      addFavoriteItem: addFavoriteItem.mutateAsync,
      removeFavoriteItem: removeFavoriteItem.mutateAsync,
      isAddingMeal: addFavoriteMeal.isPending,
      isRemovingMeal: removeFavoriteMeal.isPending,
      isAddingItem: addFavoriteItem.isPending,
      isRemovingItem: removeFavoriteItem.isPending
    };
  };
  
  // 9. User Reviews Hook
  export const useUserReviews = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    const reviewsQuery = useQuery({
      queryKey: ['userReviews', user?.id],
      queryFn: () => userAPI.getUserReviews(user.id),
      enabled: !!user?.id
    });
    
    const createMutation = useMutation({
      mutationFn: (reviewData) => userAPI.createUserReview(user.id, reviewData),
      onSuccess: () => {
        queryClient.invalidateQueries(['userReviews', user.id]);
      }
    });
    
    const updateMutation = useMutation({
      mutationFn: ({ reviewId, reviewData }) => 
        userAPI.updateUserReview(reviewId, reviewData),
      onSuccess: () => {
        queryClient.invalidateQueries(['userReviews', user.id]);
      }
    });
    
    const deleteMutation = useMutation({
      mutationFn: (reviewId) => userAPI.deleteUserReview(reviewId),
      onSuccess: () => {
        queryClient.invalidateQueries(['userReviews', user.id]);
      }
    });
    
    return {
      reviews: reviewsQuery.data || [],
      isLoading: reviewsQuery.isLoading,
      isError: reviewsQuery.isError,
      error: reviewsQuery.error,
      createReview: createMutation.mutateAsync,
      updateReview: updateMutation.mutateAsync,
      deleteReview: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending
    };
  };
  
  // 10. User Orders Hook
  export const useUserOrders = () => {
    const { user } = useAuthContext();
    
    const ordersQuery = useQuery({
      queryKey: ['userOrders', user?.id],
      queryFn: () => userAPI.getUserOrders(user.id),
      enabled: !!user?.id
    });
    
    return {
      orders: ordersQuery.data || [],
      isLoading: ordersQuery.isLoading,
      isError: ordersQuery.isError,
      error: ordersQuery.error,
      refetch: ordersQuery.refetch
    };
  };
  

  

