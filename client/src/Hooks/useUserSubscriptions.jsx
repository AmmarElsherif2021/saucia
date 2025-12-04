import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuthContext } from '../Contexts/AuthContext';
import { userAPI } from '../API/userAPI';
import { itemsAPI } from '../API/itemAPI';
import { ordersAPI } from '../API/orderAPI';
import { adminSubscriptionAPI } from '../API/adminSubscriptionAPI';

export const useUserSubscriptions = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const creatingRef = useRef(false); // Prevent double submission
    
    // Get subscription summary (includes orders stats)
    const subscriptionQuery = useQuery({
        queryKey: ['userSubscription', user?.id],
        queryFn: async () => {
            console.log('🔄 Fetching subscription for user:', user?.id);
            const activeSubscription = await userAPI.getUserActiveSubscription(user.id);
            
            if (!activeSubscription) {
                console.log('⚠️ No active subscription found');
                return null;
            }
            
            console.log('✅ Active subscription found:', activeSubscription.id);
            
            try {
                const summary = await adminSubscriptionAPI.getSubscriptionSummary(activeSubscription.id);
                console.log('✅ Subscription summary retrieved:', {
                    hasSubscription: !!summary?.subscription,
                    hasMeals: !!summary?.subscription?.meals,
                    mealsLength: summary?.subscription?.meals?.length,
                    summary
                });
                return summary;
            } catch (error) {
                console.error('❌ Error getting subscription summary:', error);
                // Return a minimal structure to prevent complete failure
                return {
                    subscription: activeSubscription,
                    stats: null,
                    nextOrder: null
                };
            }
        },
        enabled: !!user?.id,
        retry: 2,
        retryDelay: 1000,
        onError: (error) => {
            console.error('❌ Subscription query error:', error);
        }
    });

    // Get subscription orders
    const ordersQuery = useQuery({
        queryKey: ['subscriptionOrders', user?.id, subscriptionQuery.data?.subscription?.id],
        queryFn: () => {
            console.log('🔄 Fetching subscription orders for:', subscriptionQuery.data?.subscription?.id);
            return ordersAPI.getSubscriptionOrders(subscriptionQuery.data.subscription.id);
        },
        enabled: !!subscriptionQuery.data?.subscription?.id,
        retry: 2,
        retryDelay: 1000
    });

    // Get detailed meal items - ENHANCED WITH BETTER DEBUGGING AND RETRY
    const mealsQuery = useQuery({
        queryKey: ['subscriptionItems', user?.id, subscriptionQuery.data?.subscription?.id],
        queryFn: async () => {
            console.log('🍽️ Starting meal items fetch...');
            
            // Direct access to subscription from the summary
            const summaryData = subscriptionQuery.data;
            const subscription = summaryData?.subscription;
            const meals = subscription?.meals;
            
            console.log('🔍 Subscription data check:', {
                hasSummaryData: !!summaryData,
                hasSubscription: !!subscription,
                subscriptionId: subscription?.id,
                meals: meals,
                mealsType: typeof meals,
                isArray: Array.isArray(meals),
                mealsLength: meals?.length,
                rawMealsValue: JSON.stringify(meals)
            });
            
            // Return empty array immediately if no meals or empty array
            if (!Array.isArray(meals) || meals.length === 0) {
                console.log('📭 No meals found in subscription, returning empty array');
                return [];
            }

            console.log(`🔄 Processing ${meals.length} meal groups...`);
            console.log('📋 Meal structure sample:', meals[0]);
            
            const mealPromises = meals.map(async (mealObj, index) => {
                console.log(`🔍 Processing meal group ${index + 1}:`, mealObj);
                
                if (!mealObj || typeof mealObj !== 'object') {
                    console.log(`⚠️ Invalid meal object at index ${index}`);
                    return [];
                }

                // Extract item IDs from the meal object
                // The structure is: { "item_id": quantity, ... }
                const itemIds = Object.keys(mealObj)
                    .map((k) => Number(k))
                    .filter((n) => Number.isFinite(n) && n > 0);

                console.log(`📋 Meal group ${index + 1} item IDs:`, itemIds);

                if (itemIds.length === 0) {
                    console.log(`⚠️ No valid item IDs in meal group ${index + 1}`);
                    return [];
                }

                const itemPromises = itemIds.map(async (itemId) => {
                    try {
                        console.log(`🔄 Fetching item ${itemId}...`);
                        const item = await itemsAPI.getItemById(itemId);
                        console.log(`✅ Fetched item ${itemId}:`, item?.name);
                        return item;
                    } catch (error) {
                        console.error(`❌ Failed to fetch item ${itemId}:`, error);
                        return null;
                    }
                });
                
                const detailedItems = await Promise.all(itemPromises);
                const validItems = detailedItems.filter(Boolean);
                console.log(`✅ Meal group ${index + 1} complete: ${validItems.length}/${itemIds.length} items fetched`);
                return validItems;
            });
            
            const result = await Promise.all(mealPromises);
            console.log('✅ All meal groups fetched:', {
                totalGroups: result.length,
                itemsPerGroup: result.map(group => group.length),
                result
            });
            
            return result;
        },
        // Enable query when subscription exists in the summary
        enabled: !!subscriptionQuery.data?.subscription,
        // Add retry logic for failed fetches
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Keep data fresh
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Refetch on window focus
        refetchOnWindowFocus: true,
        onSuccess: (data) => {
            console.log('✅ Meals query success:', data);
        },
        onError: (error) => {
            console.error('❌ Meals query error:', error);
        }
    });

    // Real-time subscription updates
    useEffect(() => {
        if (!user?.id) return;

        const subscription = userAPI.subscribeToUserSubscriptions(user.id, (payload) => {
            console.log('🔔 Subscription update received:', payload);
            queryClient.invalidateQueries(['userSubscription', user.id]);
        });

        return () => subscription?.unsubscribe();
    }, [user?.id, queryClient]);

    // Real-time order updates
    useEffect(() => {
        if (!user?.id || !subscriptionQuery.data?.subscription?.id) return;

        const subscription = ordersAPI.subscribeToUserOrders(user.id, (payload) => {
            console.log('🔔 Order update received:', payload);
            if (payload.new?.subscription_id === subscriptionQuery.data.subscription.id) {
                queryClient.invalidateQueries(['subscriptionOrders', user.id]);
            }
        });

        return () => subscription?.unsubscribe();
    }, [user?.id, subscriptionQuery.data?.subscription?.id, queryClient]);

    // Create subscription with orders - WITH DOUBLE SUBMISSION PREVENTION
    const createMutation = useMutation({
        mutationFn: async (subscriptionData) => {
            // Prevent double submission
            if (creatingRef.current) {
                console.log('⏸️ Subscription creation already in progress, ignoring duplicate call');
                throw new Error('CREATION_IN_PROGRESS');
            }
            
            creatingRef.current = true;
            
            try {
                const result = await userAPI.createUserSubscription(user.id, subscriptionData);
                return result;
            } finally {
                // Reset the flag after a short delay to allow for UI updates
                setTimeout(() => {
                    creatingRef.current = false;
                }, 1000);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
            queryClient.invalidateQueries(['subscriptionValidation', user.id]);
        },
        onError: (error) => {
            // Reset the flag on error
            creatingRef.current = false;
            
            // Don't show error for duplicate submissions
            if (error.message !== 'CREATION_IN_PROGRESS') {
                console.error('❌ Subscription creation error:', error);
            }
        }
    });

    // Activate next order
    const activateNextOrderMutation = useMutation({
        mutationFn: ({ subscriptionId }) =>
            ordersAPI.activateNextSubscriptionOrder(subscriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    // Debug logging for returned values
    console.log('🎯 useUserSubscriptions return values:', {
        hasSubscription: !!subscriptionQuery.data?.subscription,
        subscriptionId: subscriptionQuery.data?.subscription?.id,
        mealsCount: mealsQuery.data?.length,
        isSubLoading: subscriptionQuery.isLoading || mealsQuery.isLoading,
        subscriptionQueryStatus: subscriptionQuery.status,
        mealsQueryStatus: mealsQuery.status,
        mealsQueryEnabled: !!subscriptionQuery.data?.subscription
    });
    
    return {
        // Data
        subscription: subscriptionQuery.data?.subscription || null,
        subscriptionStats: subscriptionQuery.data?.stats || null,
        nextOrder: subscriptionQuery.data?.nextOrder || null,
        subscriptionOrders: ordersQuery.data || [],
        subscriptionMeals: mealsQuery.data || [],
        
        // Loading states
        isSubLoading: subscriptionQuery.isLoading || mealsQuery.isLoading,
        ordersLoading: ordersQuery.isLoading,
        
        // Query states for debugging
        subscriptionQueryStatus: subscriptionQuery.status,
        mealsQueryStatus: mealsQuery.status,
        mealsQueryError: mealsQuery.error,
        
        // Refetch functions
        refetchMeals: mealsQuery.refetch,
        refetchSubscription: subscriptionQuery.refetch,
        
        // Mutations
        createSubscription: createMutation.mutateAsync,
        activateNextOrder: activateNextOrderMutation.mutateAsync,
        
        // Mutation states
        isCreating: createMutation.isPending,
        isActivating: activateNextOrderMutation.isPending
    };
};

export const useSubscriptionValidation = () => {
  const { user } = useAuthContext();

  const validationQuery = useQuery({
    queryKey: ['subscriptionValidation', user?.id],
    queryFn: () => userAPI.validateSubscriptionCreation(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      //console.log('✅ Subscription Validation Result:', data);
    },
    onError: (error) => {
      console.error('❌ Subscription Validation Error:', error);
    }
  });

  return {
    canCreateSubscription: validationQuery.data?.canCreate ?? true,
    hasActiveSubscription: validationQuery.data?.hasActiveSubscription ?? false,
    activeSubscription: validationQuery.data?.activeSubscription ?? null,
    isLoading: validationQuery.isLoading,
    isError: validationQuery.isError,
    error: validationQuery.error,
    refetch: validationQuery.refetch
  };
};