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
      // if (dietary_preference_ids !== undefined) {
      //   await adminAPI.updateUserDietaryPreferences(userId, dietary_preference_ids);
      // }
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
        //console.log('Fetched meals from useGetAllMeals :', JSON.stringify(data, null, 2));
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
    // Make sure allergy_ids is passed correctly
    const { allergy_ids, ...baseData } = updateData;
    
    // Filter out null/undefined values
    const filteredAllergyIds = (allergy_ids || []).filter(id => id != null);
    
    const result = await adminAPI.updateMeal(mealId, baseData);
    
    // Always update allergies (empty array if none)
    await adminAPI.updateMealAllergies(mealId, filteredAllergyIds);
    
    return result;
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
    // Extract allergy_ids and base data
    const { allergy_ids, ...baseData } = updateData;
    
    // Update base item data
    const result = await adminAPI.updateItem(itemId, baseData);
    
    // Update allergies separately
    await adminAPI.updateItemAllergies(itemId, allergy_ids || []);
    
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
        queryFn: async () => {
          const plan = await adminAPI.getPlanDetails(planId);
          const meals = await adminAPI.getPlanMeals(planId);
          return {
            ...plan,
            meals: meals.map(m => m.meal_id)
          };
        },
        enabled: !!planId
      });
    };
  // UNIFIED PLAN OPERATIONS
  // Complete plan creation with all related data
    const createPlanCompleteMutation = useMutation({
      mutationFn: async (planData) => {
        // Process meals and additives
        const { meals, additives, ...baseData } = planData;
        
        // Create plan
        const result = await adminAPI.createPlanComplete({
          ...baseData,
          meals,
          additives
        });
        
        return result;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'plans']);
      }
    });

    // updatePlanComplete mutation
    const updatePlanCompleteMutation = useMutation({
      mutationFn: async ({ planId, updateData }) => {
        // Process meals and additives
        const { meals, additives, ...baseData } = updateData;
        
        return adminAPI.updatePlanComplete(planId, {
          ...baseData,
          meals,
          additives
        });
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

  // ===== SUBSCRIPTION MANAGEMENT HOOKS =====

// Get all subscriptions
const useGetAllSubscriptions = (options = {}) => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', options],
    queryFn: () => adminAPI.getAllSubscriptions(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subscription details
const useGetSubscriptionDetails = (subscriptionId) => {
  return useQuery({
    queryKey: ['admin', 'subscription', subscriptionId],
    queryFn: () => adminAPI.getSubscriptionDetails(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get subscription analytics
const useGetSubscriptionAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', 'analytics'],
    queryFn: () => adminAPI.getSubscriptionAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

// Get subscriptions needing attention
const useGetSubscriptionsNeedingAttention = (threshold = 2) => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', 'attention', threshold],
    queryFn: () => adminAPI.getSubscriptionsNeedingAttention(threshold),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Check every 10 minutes
  });
};

// SUBSCRIPTION MUTATIONS

// Create subscription
const createSubscriptionMutation = useMutation({
  mutationFn: (subscriptionData) => adminAPI.createSubscription(subscriptionData),
  onSuccess: () => {
    queryClient.invalidateQueries(['admin', 'subscriptions']);
    queryClient.invalidateQueries(['admin', 'subscriptions', 'analytics']);
  }
});

// Update subscription
const updateSubscriptionMutation = useMutation({
  mutationFn: ({ subscriptionId, updateData }) => 
    adminAPI.updateSubscription(subscriptionId, updateData),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Update subscription status
const updateSubscriptionStatusMutation = useMutation({
  mutationFn: ({ subscriptionId, status }) => 
    adminAPI.updateSubscriptionStatus(subscriptionId, status),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
    queryClient.invalidateQueries(['admin', 'subscriptions', 'analytics']);
  }
});

// Progress to next meal
const progressToNextMealMutation = useMutation({
  mutationFn: ({ subscriptionId }) => 
    adminAPI.progressToNextMeal(subscriptionId),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
    queryClient.invalidateQueries(['admin', 'subscriptions', 'analytics']);
  }
});

// Update subscription meals
const updateSubscriptionMealsMutation = useMutation({
  mutationFn: ({ subscriptionId, meals }) => 
    adminAPI.updateSubscriptionMeals(subscriptionId, meals),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Bulk update subscriptions
const bulkUpdateSubscriptionsMutation = useMutation({
  mutationFn: ({ subscriptionIds, updateData }) => 
    adminAPI.bulkUpdateSubscriptions(subscriptionIds, updateData),
  onSuccess: () => {
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

  

  // Adjust delivery status
const updateSubscriptionDeliveryStatusMutation = useMutation({
  mutationFn: ({ subscriptionId, status }) => 
    adminAPI.updateSubscriptionDeliveryStatus(subscriptionId, status),
  onSuccess: (result) => {
    queryClient.invalidateQueries(['admin', 'subscriptions']);
    // If you need to update specific subscription data
    if (result && result.subscriptionId) {
      queryClient.invalidateQueries(['admin', 'subscription', result.subscriptionId]);
    };
    console.log('Updated delivery status:', result);
  }
});
// ===== DELIVERY MANAGEMENT QUERIES =====

// Get subscription delivery details
const useGetSubscriptionDeliveryDetails = (subscriptionId) => {
  return useQuery({
    queryKey: ['admin', 'subscription', subscriptionId, 'delivery'],
    queryFn: () => adminAPI.getSubscriptionDeliveryDetails(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get upcoming deliveries
const useGetUpcomingDeliveries = (daysAhead = 7) => {
  return useQuery({
    queryKey: ['admin', 'deliveries', 'upcoming', daysAhead],
    queryFn: () => adminAPI.getUpcomingDeliveries(daysAhead),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

// Get overdue deliveries
const useGetOverdueDeliveries = () => {
  return useQuery({
    queryKey: ['admin', 'deliveries', 'overdue'],
    queryFn: () => adminAPI.getOverdueDeliveries(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

// Get delivery history
const useGetDeliveryHistory = (subscriptionId, limit = 50) => {
  return useQuery({
    queryKey: ['admin', 'subscription', subscriptionId, 'history', limit],
    queryFn: () => adminAPI.getDeliveryHistory(subscriptionId, limit),
    enabled: !!subscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===== DELIVERY MANAGEMENT MUTATIONS =====

// Update next delivery date
const updateNextDeliveryDateMutation = useMutation({
  mutationFn: ({ subscriptionId, newDeliveryDate }) => 
    adminAPI.updateNextDeliveryDate(subscriptionId, newDeliveryDate),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'deliveries']);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Update delivery address
const updateDeliveryAddressMutation = useMutation({
  mutationFn: ({ subscriptionId, addressId }) => 
    adminAPI.updateDeliveryAddress(subscriptionId, addressId),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
  }
});

// Complete delivery
const completeDeliveryMutation = useMutation({
  mutationFn: ({ subscriptionId, mealsDelivered, deliveryNotes }) => 
    adminAPI.completeDelivery(subscriptionId, mealsDelivered, deliveryNotes),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'deliveries']);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Reschedule failed delivery
const rescheduleFailedDeliveryMutation = useMutation({
  mutationFn: ({ subscriptionId, newDeliveryDate, reason }) => 
    adminAPI.rescheduleFailedDelivery(subscriptionId, newDeliveryDate, reason),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'deliveries']);
  }
});

// Skip next delivery
const skipNextDeliveryMutation = useMutation({
  mutationFn: ({ subscriptionId, reason }) => 
    adminAPI.skipNextDelivery(subscriptionId, reason),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'deliveries']);
  }
});

// Pause subscription
const pauseSubscriptionMutation = useMutation({
  mutationFn: ({ subscriptionId, reason, resumeDate }) => 
    adminAPI.pauseSubscription(subscriptionId, reason, resumeDate),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Resume subscription
const resumeSubscriptionMutation = useMutation({
  mutationFn: ({ subscriptionId }) => 
    adminAPI.resumeSubscription(subscriptionId),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Bulk update delivery status
const bulkUpdateDeliveryStatusMutation = useMutation({
  mutationFn: ({ subscriptionIds, status }) => 
    adminAPI.bulkUpdateDeliveryStatus(subscriptionIds, status),
  onSuccess: () => {
    queryClient.invalidateQueries(['admin', 'deliveries']);
    queryClient.invalidateQueries(['admin', 'subscriptions']);
  }
});

// Update next delivery meals
const updateNextDeliveryMealsMutation = useMutation({
  mutationFn: ({ subscriptionId, mealIds, mealsCount }) => 
    adminAPI.updateNextDeliveryMeals(subscriptionId, mealIds, mealsCount),
  onSuccess: (_, { subscriptionId }) => {
    queryClient.invalidateQueries(['admin', 'subscription', subscriptionId]);
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




    // DELIVERY MANAGEMENT MUTATIONS
   
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

    

    isCreatingAllergyComplete: createAllergyCompleteMutation.isPending,
    isUpdatingAllergyComplete: updateAllergyCompleteMutation.isPending,
    isDeletingAllergyComplete: deleteAllergyCompleteMutation.isPending,
    isCreatingDietaryPreferenceComplete: createDietaryPreferenceCompleteMutation.isPending,
    isUpdatingDietaryPreferenceComplete: updateDietaryPreferenceCompleteMutation.isPending,
    isDeletingDietaryPreferenceComplete: deleteDietaryPreferenceCompleteMutation.isPending,
    isUpdatingNextDeliveryDate: updateNextDeliveryDateMutation.isPending,
  isUpdatingDeliveryAddress: updateDeliveryAddressMutation.isPending,
  isCompletingDelivery: completeDeliveryMutation.isPending,
  isReschedulingDelivery: rescheduleFailedDeliveryMutation.isPending,
  isSkippingDelivery: skipNextDeliveryMutation.isPending,
  isPausingSubscription: pauseSubscriptionMutation.isPending,
  isResumingSubscription: resumeSubscriptionMutation.isPending,
  isBulkUpdatingDeliveryStatus: bulkUpdateDeliveryStatusMutation.isPending,
  isUpdatingNextDeliveryMeals: updateNextDeliveryMealsMutation.isPending,


    // Error states for unified operations
   
    mealCompleteError: createMealCompleteMutation.error || updateMealCompleteMutation.error || deleteMealCompleteMutation.error,
    itemCompleteError: createItemCompleteMutation.error || updateItemCompleteMutation.error || deleteItemCompleteMutation.error,
    planCompleteError: createPlanCompleteMutation.error || updatePlanCompleteMutation.error || deletePlanCompleteMutation.error,
    orderError: updateOrderStatusMutation.error || updateOrderMutation.error,
    allergyCompleteError: createAllergyCompleteMutation.error || updateAllergyCompleteMutation.error || deleteAllergyCompleteMutation.error,
    dietaryPreferenceCompleteError: createDietaryPreferenceCompleteMutation.error || updateDietaryPreferenceCompleteMutation.error || deleteDietaryPreferenceCompleteMutation.error,
    deliveryError: updateNextDeliveryDateMutation.error || 
                completeDeliveryMutation.error || 
                rescheduleFailedDeliveryMutation.error,
  };
};