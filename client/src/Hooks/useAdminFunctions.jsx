import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../API/adminAPI';

export const useAdminFunctions = () => {
  const queryClient = useQueryClient();

  // =====================================================
  // ITEMS MANAGEMENT (with item_allergies junction)
  // =====================================================

  // Get all items with allergies
  const useGetAllItems = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'items', options],
      queryFn: async () => {
        const items = await adminAPI.getAllItems(options);
        // Transform data to flatten allergies from junction table
        return items.map(item => ({
          ...item,
          allergies: item.item_allergies?.map(ia => ia.allergies) || [],
          allergy_ids: item.item_allergies?.map(ia => ia.allergies.id) || []
        }));
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get single item details
  const useGetItemDetails = (itemId) => {
    return useQuery({
      queryKey: ['admin', 'item', itemId],
      queryFn: async () => {
        const data = await adminAPI.getItemDetails(itemId);
        return {
          ...data.item,
          allergies: data.allergies || [],
          allergy_ids: data.allergies?.map(a => a.id) || []
        };
      },
      enabled: !!itemId,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Create item with allergies
  const useCreateItem = () => {
    return useMutation({
      mutationFn: async (itemData) => {
        const { allergy_ids, ...baseItemData } = itemData;
        const item = await adminAPI.createItem(baseItemData);
        
        // Create item_allergies junction records
        if (allergy_ids && allergy_ids.length > 0) {
          await adminAPI.updateItemAllergies(item.id, allergy_ids);
        }
        
        return item;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'items']);
      }
    });
  };

  // Update item with allergies
const useUpdateItem = () => {
    return useMutation({
      mutationFn: async ({ itemId, updateData }) => {
        const { allergy_ids, ...baseItemData } = updateData;
        const item = await adminAPI.updateItem(itemId, baseItemData);
        
        // Update item_allergies junction records if provided
        if (allergy_ids !== undefined) {
          await adminAPI.updateItemAllergies(itemId, allergy_ids);
        }
        
        return item;
      },
      onSuccess: (_, { itemId }) => {
        queryClient.invalidateQueries(['admin', 'item', itemId]);
        queryClient.invalidateQueries(['admin', 'items']);
      }
    });
  };

  // Delete item (CASCADE deletes item_allergies automatically)
  const useDeleteItem = () => {
    return useMutation({
      mutationFn: (itemId) => adminAPI.deleteItem(itemId),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'items']);
      }
    });
  };

  // Update item availability
  const useUpdateItemAvailability = () => {
    return useMutation({
      mutationFn: ({ itemId, isAvailable }) => 
        adminAPI.updateItemAvailability(itemId, isAvailable),
      onSuccess: (_, { itemId }) => {
        queryClient.invalidateQueries(['admin', 'item', itemId]);
        queryClient.invalidateQueries(['admin', 'items']);
      }
    });
  };

  // Bulk update items
  const useBulkUpdateItems = () => {
    return useMutation({
      mutationFn: ({ itemIds, updateData }) => 
        adminAPI.bulkUpdateItems(itemIds, updateData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'items']);
      }
    });
  };

  // =====================================================
  // MEALS MANAGEMENT (with meal_allergies & meal_items)
  // =====================================================

  // Get all meals with allergies and items
  const useGetAllMeals = (options = {}) => {
  return useQuery({
    queryKey: ['admin', 'meals', options],
    queryFn: async () => {
      const meals = await adminAPI.getAllMeals(options);
      // Data is already transformed by adminAPI.getAllMeals
      return meals;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get single meal details
const useGetMealDetails = (mealId) => {
  return useQuery({
    queryKey: ['admin', 'meal', mealId],
    queryFn: async () => {
      const meal = await adminAPI.getMealDetails(mealId);
      // Data is already transformed by adminAPI.getMealDetails
      return meal;
    },
    enabled: !!mealId,
    staleTime: 2 * 60 * 1000,
  });
};

  // Get meal items (for selective meals)
  const useGetMealItems = (mealId) => {
    return useQuery({
      queryKey: ['admin', 'meal', mealId, 'items'],
      queryFn: () => adminAPI.getMealItems(mealId),
      enabled: !!mealId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create meal with allergies and items
  const useCreateMeal = () => {
    return useMutation({
      mutationFn: async (mealData) => {
        const { allergy_ids, item_ids, ...baseMealData } = mealData;
        
        // Create base meal
        const meal = await adminAPI.createMeal(baseMealData);
        
        // Create meal_allergies junction records
        if (allergy_ids && allergy_ids.length > 0) {
          await adminAPI.updateMealAllergies(meal.id, allergy_ids);
        }
        
        // Create meal_items record if selective meal with items
        if (meal.is_selective && item_ids && item_ids.length > 0) {
          await adminAPI.updateMealItems(meal.id, item_ids);
        }
        
        return meal;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'meals']);
      }
    });
  };

  // Update meal with allergies and items
  const useUpdateMeal = () => {
    return useMutation({
      mutationFn: async ({ mealId, updateData }) => {
        const { allergy_ids, item_ids, ...baseMealData } = updateData;
        
        // Update base meal
        const meal = await adminAPI.updateMeal(mealId, baseMealData);
        
        // Update meal_allergies if provided
        if (allergy_ids !== undefined) {
          await adminAPI.updateMealAllergies(mealId, allergy_ids);
        }
        
        // Update meal_items if provided
        if (item_ids !== undefined) {
          await adminAPI.updateMealItems(mealId, item_ids);
        }
        
        return meal;
      },
      onSuccess: (_, { mealId }) => {
        queryClient.invalidateQueries(['admin', 'meal', mealId]);
        queryClient.invalidateQueries(['admin', 'meals']);
      }
    });
  };

  // Delete meal (CASCADE deletes meal_allergies and meal_items)
  const useDeleteMeal = () => {
    return useMutation({
      mutationFn: (mealId) => adminAPI.deleteMeal(mealId),
      onSuccess: (_, mealId) => {
        queryClient.invalidateQueries(['admin', 'meals']);
        queryClient.removeQueries(['admin', 'meal', mealId]);
      }
    });
  };

  // Update meal availability
  const useUpdateMealAvailability = () => {
    return useMutation({
      mutationFn: ({ mealId, isAvailable }) => 
        adminAPI.updateMealAvailability(mealId, isAvailable),
      onSuccess: (_, { mealId }) => {
        queryClient.invalidateQueries(['admin', 'meal', mealId]);
        queryClient.invalidateQueries(['admin', 'meals']);
      }
    });
  };

  // Bulk update meals
  const useBulkUpdateMeals = () => {
    return useMutation({
      mutationFn: ({ mealIds, updateData }) => 
        adminAPI.bulkUpdateMeals(mealIds, updateData),
      onSuccess: (_, { mealIds }) => {
        mealIds.forEach(id => {
          queryClient.invalidateQueries(['admin', 'meal', id]);
        });
        queryClient.invalidateQueries(['admin', 'meals']);
      }
    });
  };

  // Bulk update meal availability
  const useBulkUpdateMealAvailability = () => {
    return useMutation({
      mutationFn: ({ mealIds, isAvailable }) => 
        adminAPI.bulkUpdateMealAvailability(mealIds, isAvailable),
      onSuccess: (_, { mealIds }) => {
        mealIds.forEach(id => {
          queryClient.invalidateQueries(['admin', 'meal', id]);
        });
        queryClient.invalidateQueries(['admin', 'meals']);
      }
    });
  };

  // =====================================================
  // PLANS MANAGEMENT (with plan_meals junction)
  // =====================================================

  // Get all plans
  const useGetAllPlans = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'plans', options],
      queryFn: () => adminAPI.getAllPlans(options),
      staleTime: 5 * 60 * 1000,
    });
  };


  // Get plan meals
  const useGetPlanMeals = (planId) => {
    return useQuery({
      queryKey: ['admin', 'plan', planId, 'meals'],
      queryFn: () => adminAPI.getPlanMeals(planId),
      enabled: !!planId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Create plan with meals
  const useCreatePlan = () => {
  return useMutation({
    mutationFn: async (planData) => {
      console.log('🔄 useCreatePlan called with:', planData);
      
      const { meal_ids, meals, ...basePlanData } = planData;
      
      // Create base plan
      const plan = await adminAPI.createPlan(basePlanData);
      console.log('✅ Base plan created:', plan);
      
      // Determine which meals data to use
      const mealsToAdd = meals || meal_ids || [];
      
      if (mealsToAdd.length > 0) {
        console.log('🔄 Creating plan_meals with:', mealsToAdd);
        await adminAPI.updatePlanMeals(plan.id, mealsToAdd);
        console.log('✅ Plan meals created');
      }
      
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });
};

  // Update plan with meals
  const useUpdatePlan = () => {
  return useMutation({
    mutationFn: async ({ planId, updateData }) => {
      console.log('🔄 useUpdatePlan called with:', { planId, updateData });
      console.log('📋 Meals data in updatePlan:', updateData.meals);
      
      const { meal_ids, meals, ...basePlanData } = updateData;
      
      // Update base plan first
      const plan = await adminAPI.updatePlan(planId, basePlanData);
      console.log('✅ Base plan updated:', plan);
      
      // CRITICAL: Always update meals, even if empty array
      // This ensures meal deletions are processed
      const mealsToUpdate = meals !== undefined ? meals : meal_ids;
      
      console.log('📋 Meals to update in plan:', mealsToUpdate);
      console.log('🔍 Meals type:', Array.isArray(mealsToUpdate) ? 'array' : typeof mealsToUpdate);
      
      if (mealsToUpdate !== undefined) {
        console.log('🔄 Updating plan_meals with:', mealsToUpdate);
        const result = await adminAPI.updatePlanMeals(planId, mealsToUpdate);
        console.log('✅ Plan meals updated result:', result);
      } else {
        console.log('⚠️ No meals to update for plan');
      }
      
      return plan;
    },
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plans']);
    }
  });
};
  // Delete plan (CASCADE deletes plan_meals)
  const useDeletePlan = () => {
    return useMutation({
      mutationFn: (planId) => adminAPI.deletePlan(planId),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'plans']);
      }
    });
  };

  // Update plan status
  const useUpdatePlanStatus = () => {
    return useMutation({
      mutationFn: ({ planId, isActive }) => 
        adminAPI.updatePlanStatus(planId, isActive),
      onSuccess: (_, { planId }) => {
        queryClient.invalidateQueries(['admin', 'plan', planId]);
        queryClient.invalidateQueries(['admin', 'plans']);
      }
    });
  };
  // Add meal to plan
const useAddMealToPlan = () => {
  return useMutation({
    mutationFn: ({ planId, mealId, isSubstitutable }) => 
      adminAPI.addMealToPlan(planId, mealId, isSubstitutable),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plan', planId, 'meals']);
    }
  });
};

// Remove meal from plan
const useRemoveMealFromPlan = () => {
  return useMutation({
    mutationFn: ({ planId, mealId }) => 
      adminAPI.removeMealFromPlan(planId, mealId),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plan', planId, 'meals']);
    }
  });
};

// Update meal substitutability
const useUpdatePlanMealSubstitutability = () => {
  return useMutation({
    mutationFn: ({ planId, mealId, isSubstitutable }) => 
      adminAPI.updatePlanMealSubstitutability(planId, mealId, isSubstitutable),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries(['admin', 'plan', planId]);
      queryClient.invalidateQueries(['admin', 'plan', planId, 'meals']);
    }
  });
};

// UPDATE the useGetPlanDetails hook
const useGetPlanDetails = (planId) => {
  return useQuery({
    queryKey: ['admin', 'plan', planId],
    queryFn: async () => {
      return await adminAPI.getPlanDetails(planId);
    },
    enabled: !!planId,
    staleTime: 2 * 60 * 1000,
  });
};

  // =====================================================
  // USER PROFILES MANAGEMENT (with all user_* junctions)
  // =====================================================

  // Get all users
  const useGetAllUsers = (options = {}) => {
    return useQuery({
      queryKey: ['admin', 'users', options],
      queryFn: () => adminAPI.getAllUsers(options),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get user details with all relations
  const useGetUserDetails = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId],
      queryFn: async () => {
        const data = await adminAPI.getUserDetails(userId);
        return {
          ...data.profile,
          health: data.health,
          addresses: data.addresses || [],
          subscriptions: data.subscriptions || [],
          orders: data.orders || [],
          allergies: data.allergies || [],
          allergy_ids: data.allergies?.map(a => a.id) || [],
          dietary_preferences: data.dietaryPreferences || [],
          dietary_preference_ids: data.dietaryPreferences?.map(dp => dp.id) || []
        };
      },
      enabled: !!userId,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Get user allergies
  const useGetUserAllergies = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId, 'allergies'],
      queryFn: () => adminAPI.getUserAllergies(userId),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get user dietary preferences
  const useGetUserDietaryPreferences = (userId) => {
    return useQuery({
      queryKey: ['admin', 'user', userId, 'dietary-preferences'],
      queryFn: () => adminAPI.getUserDietaryPreferences(userId),
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Update user profile with allergies and preferences
  const useUpdateUser = () => {
    return useMutation({
      mutationFn: async ({ userId, updateData }) => {
        const { allergy_ids, dietary_preference_ids, ...profileData } = updateData;
        
        // Update profile
        const user = await adminAPI.updateUserProfile(userId, profileData);
        
        // Update user_allergies junction if provided
        if (allergy_ids !== undefined) {
          await adminAPI.updateUserAllergies(userId, allergy_ids);
        }
        
        // Update user_dietary_preferences junction if provided
        if (dietary_preference_ids !== undefined) {
          await adminAPI.updateUserDietaryPreferences(userId, dietary_preference_ids);
        }
        
        return user;
      },
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries(['admin', 'user', userId]);
        queryClient.invalidateQueries(['admin', 'users']);
      }
    });
  };

  // Set admin status
  const useSetAdminStatus = () => {
    return useMutation({
      mutationFn: ({ userId, isAdmin }) => 
        adminAPI.setAdminStatus(userId, isAdmin),
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries(['admin', 'user', userId]);
        queryClient.invalidateQueries(['admin', 'users']);
      }
    });
  };

  // Update loyalty points
  const useUpdateLoyaltyPoints = () => {
    return useMutation({
      mutationFn: ({ userId, points }) => 
        adminAPI.updateLoyaltyPoints(userId, points),
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries(['admin', 'user', userId]);
        queryClient.invalidateQueries(['admin', 'users']);
      }
    });
  };

  // Update account status
  const useUpdateAccountStatus = () => {
    return useMutation({
      mutationFn: ({ userId, status }) => 
        adminAPI.updateAccountStatus(userId, status),
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries(['admin', 'user', userId]);
        queryClient.invalidateQueries(['admin', 'users']);
      }
    });
  };

  // Bulk update users
  const useBulkUpdateUsers = () => {
    return useMutation({
      mutationFn: ({ userIds, updateData }) => 
        adminAPI.bulkUpdateUsers(userIds, updateData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
      }
    });
  };

  // =====================================================
  // ALLERGIES MANAGEMENT
  // =====================================================

  // Get all allergies
  const useGetAllAllergies = () => {
    return useQuery({
      queryKey: ['admin', 'allergies'],
      queryFn: () => adminAPI.getAllAllergies(),
      staleTime: 10 * 60 * 1000,
    });
  };

  // Create allergy
  const useCreateAllergy = () => {
    return useMutation({
      mutationFn: (allergyData) => adminAPI.createAllergy(allergyData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'allergies']);
      }
    });
  };

  // Update allergy
  const useUpdateAllergy = () => {
    return useMutation({
      mutationFn: ({ allergyId, updateData }) => 
        adminAPI.updateAllergy(allergyId, updateData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'allergies']);
      }
    });
  };

  // Delete allergy
  const useDeleteAllergy = () => {
    return useMutation({
      mutationFn: (allergyId) => adminAPI.deleteAllergy(allergyId),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'allergies']);
      }
    });
  };

  // =====================================================
  // DIETARY PREFERENCES MANAGEMENT
  // =====================================================

  // Get all dietary preferences
  const useGetAllDietaryPreferences = () => {
    return useQuery({
      queryKey: ['admin', 'dietary-preferences'],
      queryFn: () => adminAPI.getAllDietaryPreferences(),
      staleTime: 10 * 60 * 1000,
    });
  };

  // Create dietary preference
  const useCreateDietaryPreference = () => {
    return useMutation({
      mutationFn: (preferenceData) => 
        adminAPI.createDietaryPreference(preferenceData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'dietary-preferences']);
      }
    });
  };

  // Update dietary preference
  const useUpdateDietaryPreference = () => {
    return useMutation({
      mutationFn: ({ preferenceId, updateData }) => 
        adminAPI.updateDietaryPreference(preferenceId, updateData),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'dietary-preferences']);
      }
    });
  };

  // Delete dietary preference
  const useDeleteDietaryPreference = () => {
    return useMutation({
      mutationFn: (preferenceId) => 
        adminAPI.deleteDietaryPreference(preferenceId),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'dietary-preferences']);
      }
    });
  };

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  // Get dashboard stats
  const useGetDashboardStats = () => {
    return useQuery({
      queryKey: ['admin', 'dashboard', 'stats'],
      queryFn: () => adminAPI.getDashboardStats(),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    });
  };

  // Get recent activity
  const useGetRecentActivity = (limit = 20) => {
    return useQuery({
      queryKey: ['admin', 'recent-activity', limit],
      queryFn: () => adminAPI.getRecentActivity(limit),
      staleTime: 2 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    });
  };

  // =====================================================
  // RETURN OBJECT - All hooks and utilities
  // =====================================================

  return {
    // ITEMS
    useGetAllItems,
    useGetItemDetails,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useUpdateItemAvailability,
    useBulkUpdateItems,

    // MEALS
    useGetAllMeals,
    useGetMealDetails,
    useGetMealItems,
    useCreateMeal,
    useUpdateMeal,
    useDeleteMeal,
    useUpdateMealAvailability,
    useBulkUpdateMeals,
    useBulkUpdateMealAvailability,

    // PLANS
    useGetAllPlans,
    useGetPlanDetails,
    useGetPlanMeals,
    useCreatePlan,
    useUpdatePlan,
    useDeletePlan,
    useUpdatePlanStatus,
    useAddMealToPlan,
    useRemoveMealFromPlan,
    useUpdatePlanMealSubstitutability,

    // USERS
    useGetAllUsers,
    useGetUserDetails,
    useGetUserAllergies,
    useGetUserDietaryPreferences,
    useUpdateUser,
    useSetAdminStatus,
    useUpdateLoyaltyPoints,
    useUpdateAccountStatus,
    useBulkUpdateUsers,

    // ALLERGIES
    useGetAllAllergies,
    useCreateAllergy,
    useUpdateAllergy,
    useDeleteAllergy,

    // DIETARY PREFERENCES
    useGetAllDietaryPreferences,
    useCreateDietaryPreference,
    useUpdateDietaryPreference,
    useDeleteDietaryPreference,

    // ANALYTICS
    useGetDashboardStats,
    useGetRecentActivity,
  };
};