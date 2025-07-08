import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../API/adminAPI';
import { useAuthContext } from '../Contexts/AuthContext';
export const useAdminFunctions = () => {
  const queryClient = useQueryClient();

  // ===== USER MANAGEMENT =====
  
  // Get all users
  const useGetAllUsers = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'users', options],
      queryFn: () => adminAPI.getAllUsers(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get user details
  const useGetUserDetails = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId],
      queryFn: () => adminAPI.getUserDetails(userId),
      enabled: !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Update user profile
  const updateUserProfileMutation = useMutation({
    mutationFn: async ({ userId, updateData }) => {
      const { allergies, dietaryPreferences, ...baseData } = updateData;
      const user = await adminAPI.updateUserProfile(userId, baseData);
      
      // Handle junctions
      if (allergies !== undefined) {
        await adminAPI.updateUserAllergies(userId, allergies);
      }
      if (dietaryPreferences !== undefined) {
        await adminAPI.updateUserDietaryPreferences(userId, dietaryPreferences);
      }
      
      return user;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  // Set admin status
  const setAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }) => adminAPI.setAdminStatus(userId, isAdmin),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  // Update loyalty points
  const updateLoyaltyMutation = useMutation({
    mutationFn: ({ userId, points }) => adminAPI.updateLoyaltyPoints(userId, points),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  // Update account status
  const updateAccountStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => adminAPI.updateAccountStatus(userId, status),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });
  
   // Update user allergies junction
   const updateUserAllergiesMutation = useMutation({
    mutationFn: ({ userId, allergyIds }) => 
      adminAPI.updateUserAllergies(userId, allergyIds),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
    }
  });

  // Update user dietary preferences junction
  const updateUserDietaryPreferencesMutation = useMutation({
    mutationFn: ({ userId, preferenceIds }) => 
      adminAPI.updateUserDietaryPreferences(userId, preferenceIds),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['admin', 'user', userId]);
    }
  });

  // Bulk update users
  const bulkUpdateUsersMutation = useMutation({
    mutationFn: ({ userIds, updateData }) => adminAPI.bulkUpdateUsers(userIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  // ===== MEAL MANAGEMENT =====
  
  // Get all meals
  const useGetAllMeals = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'meals', options],
      queryFn: () => adminAPI.getAllMeals(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get meal details
  const useGetMealDetails = (mealId) => {
    return useQuery({
      queryKey: ['admin', 'meal', mealId],
      queryFn: () => adminAPI.getMealDetails(mealId),
      enabled: !!mealId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // createMeal mutation
  const createMealMutation = useMutation({
    mutationFn: async (mealData) => {
      const { allergies, items, ...baseData } = mealData;
      const meal = await adminAPI.createMeal(baseData);
      
      // Handle junctions after meal creation
      if (allergies) {
        await adminAPI.updateMealAllergies(meal.id, allergies);
      }
      if (items) {
        await adminAPI.updateMealItems(meal.id, items);
      }
      
      return { ...meal, allergies, items };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

// updateMeal mutation
const updateMealMutation = useMutation({
  mutationFn: async ({ mealId, updateData = {} }) => {  // Add default value
    // Provide default values for destructuring
    const { 
      allergies = [], 
      items = [], 
      ...baseData 
    } = updateData;
    
    const meal = await adminAPI.updateMeal(mealId, baseData);
    
    // Handle junctions
    await adminAPI.updateMealAllergies(mealId, allergies);
    await adminAPI.updateMealItems(mealId, items);
    
    return { ...meal, allergies, items };
  },
  onSuccess: (_, { mealId }) => {
    queryClient.invalidateQueries(['admin', 'meal', mealId]);
    queryClient.invalidateQueries(['admin', 'meals']);
  }
});
    
  // Update meal allergies junction
      const updateMealAllergiesMutation = useMutation({
        mutationFn: ({ mealId, allergyIds }) => 
          adminAPI.updateMealAllergies(mealId, allergyIds),
        onSuccess: (_, { mealId }) => {
          queryClient.invalidateQueries(['admin', 'meal', mealId]);
        }
      });
    
      // Update meal items junction
    const updateMealItemsMutation = useMutation({
      mutationFn: ({ mealId, itemsData }) => 
        adminAPI.updateMealItems(mealId, itemsData),
      onSuccess: (_, { mealId }) => {
        queryClient.invalidateQueries(['admin', 'meal', mealId]);
      }
    });
  // Delete meal
  const deleteMealMutation = useMutation({
    mutationFn: (mealId) => adminAPI.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

  // Update meal availability
  const updateMealAvailabilityMutation = useMutation({
    mutationFn: ({ mealId, isAvailable }) => adminAPI.updateMealAvailability(mealId, isAvailable),
    onSuccess: (_, { mealId }) => {
      queryClient.invalidateQueries(['admin', 'meal', mealId]);
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

  // Bulk update meal availability
  const bulkUpdateMealAvailabilityMutation = useMutation({
    mutationFn: ({ mealIds, isAvailable }) => adminAPI.bulkUpdateMealAvailability(mealIds, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

  // Bulk update meals
  const bulkUpdateMealsMutation = useMutation({
    mutationFn: ({ mealIds, updateData }) => adminAPI.bulkUpdateMeals(mealIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

    // Get user allergies
  const useGetUserAllergies = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId, 'allergies'],
      queryFn: () => adminAPI.getUserAllergies(userId),
      enabled: !!userId
    });
  };

  // Get user dietary preferences
  const useGetUserDietaryPreferences = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId, 'dietary-preferences'],
      queryFn: () => adminAPI.getUserDietaryPreferences(userId),
      enabled: !!userId
    });
  };
 
  // ===== ITEM MANAGEMENT =====
  
  // Get all items
  const useGetAllItems = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'items', options],
      queryFn: () => adminAPI.getAllItems(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create item
  const createItemMutation = useMutation({
    mutationFn: async (itemData) => {
      const { allergy_ids, ...baseData } = itemData;
      const item = await adminAPI.createItem(baseData);      
      if (allergy_ids) {
        await adminAPI.updateItemAllergies(item.id, allergy_ids);
      }      
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updateData }) => {
      try {
        const { allergy_ids, ...baseData } = updateData;
        const item = await adminAPI.updateItem(itemId, baseData);
        
        if (allergy_ids !== undefined) {
          await adminAPI.updateItemAllergies(itemId, allergy_ids);
        }
        
        return item;
      } catch (error) {
        console.error("Update failed:", error);
        throw new Error(`Failed to update item: ${error.message}`);
      }
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries(['admin', 'item', itemId]);
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });
 
  // junction table mutations for items
  const updateItemAllergiesMutation = useMutation({
    mutationFn: ({ itemId, allergyIds }) => 
      adminAPI.updateItemAllergies(itemId, allergyIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });
  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => adminAPI.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Update item availability
  const updateItemAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }) => adminAPI.updateItemAvailability(itemId, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Bulk update items
  const bulkUpdateItemsMutation = useMutation({
    mutationFn: ({ itemIds, updateData }) => adminAPI.bulkUpdateItems(itemIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // ===== PLAN MANAGEMENT =====
  
  // Get all plans
  const useGetAllPlans = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'plans', options],
      queryFn: () => adminAPI.getAllPlans(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get plan details
  const useGetPlanDetails = (planId) => {
    return useQuery({
      queryKey: ['admin', 'plan', planId],
      queryFn: () => adminAPI.getPlanDetails(planId),
      enabled: !!planId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Create plan
  const createPlanMutation = useMutation({
    mutationFn: (planData) => adminAPI.createPlan(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Update plan
  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, updateData }) => adminAPI.updatePlan(planId, updateData),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Delete plan
  const deletePlanMutation = useMutation({
    mutationFn: (planId) => adminAPI.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Update plan status
  const updatePlanStatusMutation = useMutation({
    mutationFn: ({ planId, isActive }) => adminAPI.updatePlanStatus(planId, isActive),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Add meal to plan
  const addMealToPlanMutation = useMutation({
    mutationFn: ({ planId, mealId, weekNumber, dayOfWeek }) => 
      adminAPI.addMealToPlan(planId, mealId, weekNumber, dayOfWeek),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
    }
  });

  // Remove meal from plan
  const removeMealFromPlanMutation = useMutation({
    mutationFn: ({ planId, mealId, weekNumber, dayOfWeek }) => 
      adminAPI.removeMealFromPlan(planId, mealId, weekNumber, dayOfWeek),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
    }
  });

  // ===== SUBSCRIPTION MANAGEMENT =====
  
  // Get all subscriptions
  const useGetAllSubscriptions = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'subscriptions', options],
      queryFn: () => adminAPI.getAllSubscriptions(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Update subscription status
  const updateSubscriptionStatusMutation = useMutation({
    mutationFn: ({ subscriptionId, status }) => adminAPI.updateSubscriptionStatus(subscriptionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'subscriptions']);
    }
  });

  // Update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ subscriptionId, updateData }) => adminAPI.updateSubscription(subscriptionId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'subscriptions']);
    }
  });

  // ===== ORDER MANAGEMENT =====
  
  // Get all orders
  const useGetAllOrders = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'orders', options],
      queryFn: () => adminAPI.getAllOrders(options),
      staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
    });
  };

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => adminAPI.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'orders']);
    }
  });

  // Update order
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updateData }) => adminAPI.updateOrder(orderId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'orders']);
    }
  });

  // ===== ANALYTICS & REPORTING =====
  
  // Get dashboard stats
  const useGetDashboardStats = () => {
    return useQuery({
      queryKey: ['admin', 'dashboard', 'stats'],
      queryFn: () => adminAPI.getDashboardStats(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    });
  };

  // Get recent activity
  const useGetRecentActivity = (limit = 20) => {
    return useQuery({
      queryKey: ['admin', 'recent-activity', limit],
      queryFn: () => adminAPI.getRecentActivity(limit),
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    });
  };

  // ===== CONTENT MANAGEMENT =====
  
  // Get all allergies
  const useGetAllAllergies = () => {
    return useQuery({
      queryKey: ['admin', 'allergies'],
      queryFn: () => adminAPI.getAllAllergies(),
      staleTime: 10 * 60 * 1000, // 10 minutes - allergies don't change often
    });
  };

  // Create allergy
  const createAllergyMutation = useMutation({
    mutationFn: (allergyData) => adminAPI.createAllergy(allergyData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'allergies']);
    }
  });

  // Update allergy
  const updateAllergyMutation = useMutation({
    mutationFn: ({ allergyId, updateData }) => adminAPI.updateAllergy(allergyId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'allergies']);
    }
  });

  

  // Delete allergy
  const deleteAllergyMutation = useMutation({
    mutationFn: (allergyId) => adminAPI.deleteAllergy(allergyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'allergies']);
    }
  });

  // Get all dietary preferences
  const useGetAllDietaryPreferences = () => {
    return useQuery({
      queryKey: ['admin', 'dietary-preferences'],
      queryFn: () => adminAPI.getAllDietaryPreferences(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Create dietary preference
  const createDietaryPreferenceMutation = useMutation({
    mutationFn: (preferenceData) => adminAPI.createDietaryPreference(preferenceData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'dietary-preferences']);
    }
  });

  // Update dietary preference
  const updateDietaryPreferenceMutation = useMutation({
    mutationFn: ({ preferenceId, updateData }) => adminAPI.updateDietaryPreference(preferenceId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'dietary-preferences']);
    }
  });

  // Delete dietary preference
  const deleteDietaryPreferenceMutation = useMutation({
    mutationFn: (preferenceId) => adminAPI.deleteDietaryPreference(preferenceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'dietary-preferences']);
    }
  });

  // ===== RETURN OBJECT =====
  
  return {
    // Queries
    useGetAllUsers,
    useGetUserDetails,
    useGetAllMeals,
    useGetMealDetails,
    useGetAllItems,
    useGetAllPlans,
    useGetPlanDetails,
    useGetAllSubscriptions,
    useGetAllOrders,
    useGetDashboardStats,
    useGetRecentActivity,
    useGetAllAllergies,
    useGetAllDietaryPreferences,

    // User Management
    useGetUserAllergies,
    useGetUserDietaryPreferences,
    updateUserAllergies: updateUserAllergiesMutation.mutateAsync,
    updateUserDietaryPreferences: updateUserDietaryPreferencesMutation.mutateAsync,
    updateUserProfile: updateUserProfileMutation.mutateAsync,
    setAdminStatus: setAdminMutation.mutateAsync,
    updateLoyaltyPoints: updateLoyaltyMutation.mutateAsync,
    updateAccountStatus: updateAccountStatusMutation.mutateAsync,
    bulkUpdateUsers: bulkUpdateUsersMutation.mutateAsync,

    // Meal Management
    createMeal: createMealMutation.mutateAsync,
    updateMeal: updateMealMutation.mutateAsync,
    deleteMeal: deleteMealMutation.mutateAsync,
    updateMealAvailability: updateMealAvailabilityMutation.mutateAsync,
    updateMealAllergies: updateMealAllergiesMutation.mutateAsync,
    updateMealItems: updateMealItemsMutation.mutateAsync,
    bulkUpdateMealAvailability: bulkUpdateMealAvailabilityMutation.mutateAsync,
    bulkUpdateMeals: bulkUpdateMealsMutation.mutateAsync,

    // Item Management
    createItem: createItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    updateItemAvailability: updateItemAvailabilityMutation.mutateAsync,
    updateItemAllergies: updateItemAllergiesMutation.mutateAsync,
    bulkUpdateItems: bulkUpdateItemsMutation.mutateAsync,

    // Plan Management
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    updatePlanStatus: updatePlanStatusMutation.mutateAsync,
    addMealToPlan: addMealToPlanMutation.mutateAsync,
    removeMealFromPlan: removeMealFromPlanMutation.mutateAsync,

    // Subscription Management
    updateSubscriptionStatus: updateSubscriptionStatusMutation.mutateAsync,
    updateSubscription: updateSubscriptionMutation.mutateAsync,

    // Order Management
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,

    // Content Management
    createAllergy: createAllergyMutation.mutateAsync,
    updateAllergy: updateAllergyMutation.mutateAsync,
    deleteAllergy: deleteAllergyMutation.mutateAsync,
    createDietaryPreference: createDietaryPreferenceMutation.mutateAsync,
    updateDietaryPreference: updateDietaryPreferenceMutation.mutateAsync,
    deleteDietaryPreference: deleteDietaryPreferenceMutation.mutateAsync,

    // Loading states
    isSettingAdmin: setAdminMutation.isPending,
    isUpdatingLoyalty: updateLoyaltyMutation.isPending,
    isUpdatingUserProfile: updateUserProfileMutation.isPending,
    isUpdatingAccountStatus: updateAccountStatusMutation.isPending,
    isBulkUpdatingUsers: bulkUpdateUsersMutation.isPending,
    isUpdatingUserAllergies: updateUserAllergiesMutation.isPending,
    isUpdatingUserDietaryPreferences: updateUserDietaryPreferencesMutation.isPending,
    //meals is pending
    isCreatingMeal: createMealMutation.isPending,
    isUpdatingMeal: updateMealMutation.isPending,
    isDeletingMeal: deleteMealMutation.isPending,
    isUpdatingMealAvailability: updateMealAvailabilityMutation.isPending,
    isBulkUpdatingMealAvailability: bulkUpdateMealAvailabilityMutation.isPending,
    isBulkUpdatingMeals: bulkUpdateMealsMutation.isPending,
    isUpdatingMealAllergies: updateMealAllergiesMutation.isPending,
    isUpdatingMealItems: updateMealItemsMutation.isPending,
    
    //items is pending
    isCreatingItem: createItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isDeletingItem: deleteItemMutation.isPending,
    isUpdatingItemAllergies: updateItemAllergiesMutation.isPending,
    isUpdatingItemAvailability: updateItemAvailabilityMutation.isPending,
    isBulkUpdatingItems: bulkUpdateItemsMutation.isPending,

    isCreatingPlan: createPlanMutation.isPending,
    isUpdatingPlan: updatePlanMutation.isPending,
    isDeletingPlan: deletePlanMutation.isPending,
    isUpdatingPlanStatus: updatePlanStatusMutation.isPending,
    isAddingMealToPlan: addMealToPlanMutation.isPending,
    isRemovingMealFromPlan: removeMealFromPlanMutation.isPending,

    isUpdatingSubscriptionStatus: updateSubscriptionStatusMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,

    isUpdatingOrderStatus: updateOrderStatusMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,

    isCreatingAllergy: createAllergyMutation.isPending,
    isUpdatingAllergy: updateAllergyMutation.isPending,
    isDeletingAllergy: deleteAllergyMutation.isPending,
    isCreatingDietaryPreference: createDietaryPreferenceMutation.isPending,
    isUpdatingDietaryPreference: updateDietaryPreferenceMutation.isPending,
    isDeletingDietaryPreference: deleteDietaryPreferenceMutation.isPending,

    // Error states
    userError: updateUserProfileMutation.error || setAdminMutation.error || updateLoyaltyMutation.error,
    mealError: createMealMutation.error || updateMealMutation.error || deleteMealMutation.error,
    itemError: createItemMutation.error || updateItemMutation.error || deleteItemMutation.error,
    planError: createPlanMutation.error || updatePlanMutation.error || deletePlanMutation.error,
    subscriptionError: updateSubscriptionStatusMutation.error || updateSubscriptionMutation.error,
    orderError: updateOrderStatusMutation.error || updateOrderMutation.error,
    contentError: createAllergyMutation.error || updateAllergyMutation.error || deleteAllergyMutation.error,
  };
};