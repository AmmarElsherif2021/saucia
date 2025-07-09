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

  // UNIFIED USER OPERATIONS
  const updateUserCompleteMutation = useMutation({
    mutationFn: async ({ userId, updateData }) => {
      // Extract junction data
      const { allergy_ids, dietary_preference_ids, ...profileData } = updateData;
      
      // Update profile
      const result = await adminAPI.updateUserProfile(userId, profileData);
      
      // Update junctions
      if (allergy_ids !== undefined) {
        await adminAPI.updateUserAllergies(userId, allergy_ids);
      }
      if (dietary_preference_ids !== undefined) {
        await adminAPI.updateUserDietaryPreferences(userId, dietary_preference_ids);
      }
      return result;
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
      onSuccess: (data) => {
        console.log('Fetched meals from useGetAllMeals :', JSON.stringify(data, null, 2));
      }
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

  // UNIFIED MEAL OPERATIONS
  // Complete meal creation with all related data
  const createMealCompleteMutation = useMutation({
    mutationFn: async (mealData) => {
      const result = await adminAPI.createMealComplete(mealData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

  // Complete meal update with all related data
  const updateMealCompleteMutation = useMutation({
    mutationFn: async ({ mealId, updateData }) => {
      return adminAPI.updateMealComplete(mealId, updateData);
    },
    onSuccess: (_, { mealId }) => {
      queryClient.invalidateQueries(['admin', 'meal', mealId]);
      queryClient.invalidateQueries(['admin', 'meals']);
    }
  });

  // Complete meal deletion with all related data
  const deleteMealCompleteMutation = useMutation({
    mutationFn: async (mealId) => {
      const result = await adminAPI.deleteMealComplete(mealId);
      return result;
    },
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

  // ===== ITEM MANAGEMENT =====
  
  // Get all items
  const useGetAllItems = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'items', options],
      queryFn: () => adminAPI.getAllItems(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get item details
  const useGetItemDetails = (itemId) => {
    return useQuery({
      queryKey: ['admin', 'item', itemId],
      queryFn: () => adminAPI.getItemDetails(itemId),
      enabled: !!itemId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // UNIFIED ITEM OPERATIONS
  // Complete item creation with all related data
  const createItemCompleteMutation = useMutation({
    mutationFn: async (itemData) => {
      const result = await adminAPI.createItemComplete(itemData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Complete item update with all related data
  const updateItemCompleteMutation = useMutation({
    mutationFn: async ({ itemId, updateData }) => {
      const result = await adminAPI.updateItemComplete(itemId, updateData);
      return result;
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries(['admin', 'item', itemId]);
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Complete item deletion with all related data
  const deleteItemCompleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const result = await adminAPI.deleteItemComplete(itemId);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'items']);
    }
  });

  // Update item availability
  const updateItemAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }) => adminAPI.updateItemAvailability(itemId, isAvailable),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries(['admin', 'item', itemId]);
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

  // UNIFIED PLAN OPERATIONS
  // Complete plan creation with all related data
  const createPlanCompleteMutation = useMutation({
    mutationFn: async (planData) => {
      const result = await adminAPI.createPlanComplete(planData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Complete plan update with all related data
  const updatePlanCompleteMutation = useMutation({
    mutationFn: async ({ planId, updateData }) => {
      return adminAPI.updatePlan(planId, updateData);
    },
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });

  // Complete plan deletion with all related data
  const deletePlanCompleteMutation = useMutation({
    mutationFn: async (planId) => {
      const result = await adminAPI.deletePlanComplete(planId);
      return result;
    },
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

  // UNIFIED ALLERGY OPERATIONS
  // Complete allergy creation
  const createAllergyCompleteMutation = useMutation({
    mutationFn: async (allergyData) => {
      const result = await adminAPI.createAllergyComplete(allergyData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'allergies']);
    }
  });

  // Complete allergy update
  const updateAllergyCompleteMutation = useMutation({
    mutationFn: async ({ allergyId, updateData }) => {
      return adminAPI.updateAllergy(allergyId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'allergies']);
    }
  });
  

  // Complete allergy deletion
  const deleteAllergyCompleteMutation = useMutation({
    mutationFn: async (allergyId) => {
      const result = await adminAPI.deleteAllergyComplete(allergyId);
      return result;
    },
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

  // UNIFIED DIETARY PREFERENCE OPERATIONS
  // Complete dietary preference creation
  const createDietaryPreferenceCompleteMutation = useMutation({
    mutationFn: async (preferenceData) => {
      const result = await adminAPI.createDietaryPreferenceComplete(preferenceData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'dietary-preferences']);
    }
  });

  // Complete dietary preference update
  const updateDietaryPreferenceCompleteMutation = useMutation({
    mutationFn: async ({ preferenceId, updateData }) => {
      return adminAPI.updateDietaryPreference(preferenceId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'dietary-preferences']);
    }
  });

  // Complete dietary preference deletion
  const deleteDietaryPreferenceCompleteMutation = useMutation({
    mutationFn: async (preferenceId) => {
      const result = await adminAPI.deleteDietaryPreferenceComplete(preferenceId);
      return result;
    },
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
    useGetItemDetails,
    useGetAllPlans,
    useGetPlanDetails,
    useGetAllSubscriptions,
    useGetAllOrders,
    useGetDashboardStats,
    useGetRecentActivity,
    useGetAllAllergies,
    useGetAllDietaryPreferences,
    useGetUserAllergies,
    useGetUserDietaryPreferences,

    // UNIFIED USER OPERATIONS
    updateUserComplete: updateUserCompleteMutation.mutateAsync,
    setAdminStatus: setAdminMutation.mutateAsync,
    updateLoyaltyPoints: updateLoyaltyMutation.mutateAsync,
    updateAccountStatus: updateAccountStatusMutation.mutateAsync,
    bulkUpdateUsers: bulkUpdateUsersMutation.mutateAsync,

    // UNIFIED MEAL OPERATIONS
    createMealComplete: createMealCompleteMutation.mutateAsync,
    updateMealComplete: updateMealCompleteMutation.mutateAsync,
    deleteMealComplete: deleteMealCompleteMutation.mutateAsync,
    updateMealAvailability: updateMealAvailabilityMutation.mutateAsync,
    bulkUpdateMealAvailability: bulkUpdateMealAvailabilityMutation.mutateAsync,
    bulkUpdateMeals: bulkUpdateMealsMutation.mutateAsync,

    // UNIFIED ITEM OPERATIONS
    createItemComplete: createItemCompleteMutation.mutateAsync,
    updateItemComplete: updateItemCompleteMutation.mutateAsync,
    deleteItemComplete: deleteItemCompleteMutation.mutateAsync,
    updateItemAvailability: updateItemAvailabilityMutation.mutateAsync,
    bulkUpdateItems: bulkUpdateItemsMutation.mutateAsync,

    // UNIFIED PLAN OPERATIONS
    createPlanComplete: createPlanCompleteMutation.mutateAsync,
    updatePlanComplete: updatePlanCompleteMutation.mutateAsync,
    deletePlanComplete: deletePlanCompleteMutation.mutateAsync,
    updatePlanStatus: updatePlanStatusMutation.mutateAsync,

    // Subscription Management
    updateSubscriptionStatus: updateSubscriptionStatusMutation.mutateAsync,
    updateSubscription: updateSubscriptionMutation.mutateAsync,

    // Order Management
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,

    // UNIFIED CONTENT MANAGEMENT
    createAllergyComplete: createAllergyCompleteMutation.mutateAsync,
    updateAllergyComplete: updateAllergyCompleteMutation.mutateAsync,
    deleteAllergyComplete: deleteAllergyCompleteMutation.mutateAsync,
    createDietaryPreferenceComplete: createDietaryPreferenceCompleteMutation.mutateAsync,
    updateDietaryPreferenceComplete: updateDietaryPreferenceCompleteMutation.mutateAsync,
    deleteDietaryPreferenceComplete: deleteDietaryPreferenceCompleteMutation.mutateAsync,

    // Loading states for unified operations
    isUpdatingUserComplete: updateUserCompleteMutation.isPending,
    isSettingAdmin: setAdminMutation.isPending,
    isUpdatingLoyalty: updateLoyaltyMutation.isPending,
    isUpdatingAccountStatus: updateAccountStatusMutation.isPending,
    isBulkUpdatingUsers: bulkUpdateUsersMutation.isPending,

    isCreatingMealComplete: createMealCompleteMutation.isPending,
    isUpdatingMealComplete: updateMealCompleteMutation.isPending,
    isDeletingMealComplete: deleteMealCompleteMutation.isPending,
    isUpdatingMealAvailability: updateMealAvailabilityMutation.isPending,
    isBulkUpdatingMealAvailability: bulkUpdateMealAvailabilityMutation.isPending,
    isBulkUpdatingMeals: bulkUpdateMealsMutation.isPending,

    isCreatingItemComplete: createItemCompleteMutation.isPending,
    isUpdatingItemComplete: updateItemCompleteMutation.isPending,
    isDeletingItemComplete: deleteItemCompleteMutation.isPending,
    isUpdatingItemAvailability: updateItemAvailabilityMutation.isPending,
    isBulkUpdatingItems: bulkUpdateItemsMutation.isPending,

    isCreatingPlanComplete: createPlanCompleteMutation.isPending,
    isUpdatingPlanComplete: updatePlanCompleteMutation.isPending,
    isDeletingPlanComplete: deletePlanCompleteMutation.isPending,
    isUpdatingPlanStatus: updatePlanStatusMutation.isPending,

    isUpdatingSubscriptionStatus: updateSubscriptionStatusMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,

    isUpdatingOrderStatus: updateOrderStatusMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,

    isCreatingAllergyComplete: createAllergyCompleteMutation.isPending,
    isUpdatingAllergyComplete: updateAllergyCompleteMutation.isPending,
    isDeletingAllergyComplete: deleteAllergyCompleteMutation.isPending,
    isCreatingDietaryPreferenceComplete: createDietaryPreferenceCompleteMutation.isPending,
    isUpdatingDietaryPreferenceComplete: updateDietaryPreferenceCompleteMutation.isPending,
    isDeletingDietaryPreferenceComplete: deleteDietaryPreferenceCompleteMutation.isPending,

    // Error states for unified operations
    userCompleteError: updateUserCompleteMutation.error || setAdminMutation.error || updateLoyaltyMutation.error,
    mealCompleteError: createMealCompleteMutation.error || updateMealCompleteMutation.error || deleteMealCompleteMutation.error,
    itemCompleteError: createItemCompleteMutation.error || updateItemCompleteMutation.error || deleteItemCompleteMutation.error,
    planCompleteError: createPlanCompleteMutation.error || updatePlanCompleteMutation.error || deletePlanCompleteMutation.error,
    subscriptionError: updateSubscriptionStatusMutation.error || updateSubscriptionMutation.error,
    orderError: updateOrderStatusMutation.error || updateOrderMutation.error,
    allergyCompleteError: createAllergyCompleteMutation.error || updateAllergyCompleteMutation.error || deleteAllergyCompleteMutation.error,
    dietaryPreferenceCompleteError: createDietaryPreferenceCompleteMutation.error || updateDietaryPreferenceCompleteMutation.error || deleteDietaryPreferenceCompleteMutation.error,
  };
};