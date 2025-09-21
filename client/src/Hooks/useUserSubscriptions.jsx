import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { userAPI } from '../API/userAPI';

export const useUserSubscriptions = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    // Get active subscription with orders and items
    const subscriptionQuery = useQuery({
        queryKey: ['userSubscription', user?.id],
        queryFn: () => userAPI.getUserActiveSubscription(user.id),
        enabled: !!user?.id
    });

    // Get subscription orders (pending meals)
    const ordersQuery = useQuery({
        queryKey: ['subscriptionOrders', user?.id, subscriptionQuery.data?.id],
        queryFn: () => userAPI.getSubscriptionOrders(subscriptionQuery.data?.id),
        enabled: !!subscriptionQuery.data?.id
    });

    // Get next scheduled meal
    const nextMealQuery = useQuery({
        queryKey: ['nextMeal', user?.id, subscriptionQuery.data?.id],
        queryFn: () => userAPI.getNextScheduledMeal(subscriptionQuery.data?.id),
        enabled: !!subscriptionQuery.data?.id
    });
    
    const createMutation = useMutation({
        mutationFn: (subscriptionData) => 
            userAPI.createUserSubscription(user.id, subscriptionData),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ subscriptionId, subscriptionData }) => 
            userAPI.updateUserSubscription(subscriptionId, subscriptionData),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
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
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    const resumeMutation = useMutation({
        mutationFn: ({ subscriptionId }) => 
            userAPI.resumeUserSubscription(subscriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries(['userSubscription', user.id]);
            queryClient.invalidateQueries(['subscriptionOrders', user.id]);
        }
    });
    
    return {
        // Data
        subscription: subscriptionQuery.data || null,
        orders: ordersQuery.data || [],
        nextMeal: nextMealQuery.data || null,
        
        // Loading states
        isLoading: subscriptionQuery.isLoading,
        ordersLoading: ordersQuery.isLoading,
        nextMealLoading: nextMealQuery.isLoading,
        
        // Error states
        isError: subscriptionQuery.isError,
        error: subscriptionQuery.error,
        
        // Mutations
        createSubscription: createMutation.mutateAsync,
        updateSubscription: updateMutation.mutateAsync,
        updateOrder: updateOrderMutation.mutateAsync,
        activateOrder: activateOrderMutation.mutateAsync,
        pauseSubscription: pauseMutation.mutateAsync,
        resumeSubscription: resumeMutation.mutateAsync,
        
        // Mutation loading states
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isActivatingOrder: activateOrderMutation.isPending,
        isPausing: pauseMutation.isPending,
        isResuming: resumeMutation.isPending
    };
};