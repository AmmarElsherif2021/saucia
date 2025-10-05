import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthContext } from '../Contexts/AuthContext';
import { userAPI } from '../API/userAPI';

export const useUserSubscriptions = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    // Get active subscription with orders and items
    const subscriptionQuery = useQuery({
        queryKey: ['userSubscription', user?.id],
        queryFn: () => userAPI.getUserActiveSubscription(user.id),
        enabled: !!user?.id,
        onSuccess: (data) => {
            console.log('📋 Subscription Query Result:', {
                hasSubscription: !!data,
                subscriptionId: data?.id,
                status: data?.status,
                canCreateNew: !data || ['completed', 'cancelled'].includes(data?.status)
            });
        }
    });

    // Get all user subscriptions to check for active ones
    const allSubscriptionsQuery = useQuery({
        queryKey: ['allUserSubscriptions', user?.id],
        queryFn: () => userAPI.getAllUserSubscriptions(user.id),
        enabled: !!user?.id,
        onSuccess: (data) => {
            console.log('📊 All Subscriptions:', {
                total: data?.length || 0,
                active: data?.filter(s => !['completed', 'cancelled'].includes(s.status))?.length || 0,
                statuses: data?.map(s => s.status) || []
            });
        }
    });

    // Real-time subscription for subscription updates
    useEffect(() => {
        if (!user?.id) return;

        const subscription = userAPI.subscribeToUserSubscriptions(user.id, (payload) => {
            console.log('🔔 Subscription update:', payload);
            
            // Update active subscription query
            if (payload.eventType === 'UPDATE') {
                queryClient.setQueryData(['userSubscription', user.id], (old) => {
                    if (old?.id === payload.new.id) {
                        return payload.new;
                    }
                    return old;
                });
            } else if (payload.eventType === 'INSERT') {
                queryClient.invalidateQueries(['userSubscription', user.id]);
            }
            
            // Always invalidate all subscriptions list
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [user?.id, queryClient]);

    // Get subscription orders (pending meals)
    const ordersQuery = useQuery({
        queryKey: ['subscriptionOrders', user?.id, subscriptionQuery.data?.id],
        queryFn: () => userAPI.getSubscriptionOrders(subscriptionQuery.data?.id),
        enabled: !!subscriptionQuery.data?.id
    });

    // Real-time subscription for order updates within subscriptions
    useEffect(() => {
        if (!user?.id || !subscriptionQuery.data?.id) return;

        const subscription = userAPI.subscribeToUserSubscriptionOrders?.(subscriptionQuery.data.id, (payload) => {
            console.log('🔔 Subscription order update:', payload);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
            queryClient.invalidateQueries(['nextMeal', user.id]);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [user?.id, subscriptionQuery.data?.id, queryClient]);

    // Get next scheduled meal
    const nextMealQuery = useQuery({
        queryKey: ['nextMeal', user?.id, subscriptionQuery.data?.id],
        queryFn: () => userAPI.getNextScheduledMeal(subscriptionQuery.data?.id),
        enabled: !!subscriptionQuery.data?.id
    });

    // Check if user can create new subscription
    const canCreateSubscription = () => {
        if (!subscriptionQuery.data) return true;
        
        const currentStatus = subscriptionQuery.data.status;
        const allowedStatuses = ['completed', 'cancelled'];
        const canCreate = allowedStatuses.includes(currentStatus);
        
        console.log('🎯 Can Create Subscription Check:', {
            currentStatus,
            allowedStatuses,
            canCreate,
            hasSubscription: !!subscriptionQuery.data
        });
        
        return canCreate;
    };

    // Enhanced create mutation with validation
    const createMutation = useMutation({
        mutationFn: (subscriptionData) => {
            // Check if user can create subscription
            if (!canCreateSubscription()) {
                throw new Error('USER_HAS_ACTIVE_SUBSCRIPTION');
            }
            return userAPI.createUserSubscription(user.id, subscriptionData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        },
        onError: (error) => {
            console.error('❌ Subscription Creation Error:', error);
        }
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ subscriptionId, subscriptionData }) => 
            userAPI.updateUserSubscription(subscriptionId, subscriptionData),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ orderId, orderData }) => 
            userAPI.updateOrder(orderId, orderData),
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
            queryClient.invalidateQueries(['nextMeal', user.id]);
        }
    });

    const activateOrderMutation = useMutation({
        mutationFn: ({ orderId, deliveryTime, deliveryDate }) =>
            userAPI.activateOrder(orderId, { 
                scheduled_delivery_date: deliveryDate,
                status: 'active'
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
            queryClient.invalidateQueries(['nextMeal', user.id]);
        }
    });
    
    const pauseMutation = useMutation({
        mutationFn: ({ subscriptionId, pauseReason }) => 
            userAPI.pauseUserSubscription(subscriptionId, pauseReason),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    const resumeMutation = useMutation({
        mutationFn: ({ subscriptionId }) => 
            userAPI.resumeUserSubscription(subscriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });

    // Cancel subscription mutation
    const cancelMutation = useMutation({
        mutationFn: ({ subscriptionId, cancelReason }) => 
            userAPI.cancelUserSubscription(subscriptionId, cancelReason),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['allUserSubscriptions', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    return {
        // Data
        subscription: subscriptionQuery.data || null,
        allSubscriptions: allSubscriptionsQuery.data || [],
        orders: ordersQuery.data || [],
        nextMeal: nextMealQuery.data || null,
        
        // Loading states
        isLoading: subscriptionQuery.isLoading,
        allSubscriptionsLoading: allSubscriptionsQuery.isLoading,
        ordersLoading: ordersQuery.isLoading,
        nextMealLoading: nextMealQuery.isLoading,
        
        // Error states
        isError: subscriptionQuery.isError,
        error: subscriptionQuery.error,
        
        // Validation
        canCreateSubscription: canCreateSubscription(),
        hasActiveSubscription: subscriptionQuery.data && !['completed', 'cancelled'].includes(subscriptionQuery.data.status),
        subscriptionStatus: subscriptionQuery.data?.status,
        
        // Mutations
        createSubscription: createMutation.mutateAsync,
        updateSubscription: updateMutation.mutateAsync,
        updateOrder: updateOrderMutation.mutateAsync,
        activateOrder: activateOrderMutation.mutateAsync,
        pauseSubscription: pauseMutation.mutateAsync,
        resumeSubscription: resumeMutation.mutateAsync,
        cancelSubscription: cancelMutation.mutateAsync,
        
        // Mutation loading states
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isActivatingOrder: activateOrderMutation.isPending,
        isPausing: pauseMutation.isPending,
        isResuming: resumeMutation.isPending,
        isCancelling: cancelMutation.isPending,

        // Refetch functions
        refetchSubscription: subscriptionQuery.refetch,
        refetchAllSubscriptions: allSubscriptionsQuery.refetch
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
      console.log('✅ Subscription Validation Result:', data);
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