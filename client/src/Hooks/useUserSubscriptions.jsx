import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../Contexts/AuthContext';
import { userAPI } from '../API/userAPI';

export const useUserSubscriptions = () => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    
    const subscriptionsQuery = useQuery({
      queryKey: ['userSubscriptions', user?.id],
      queryFn: () => userAPI.getUserSubscriptions(user.id),
      enabled: !!user?.id
    });
    
    const createMutation = useMutation({
      mutationFn: (subscriptionData) => 
        userAPI.createUserSubscription(user.id, subscriptionData),
      onSuccess: () => {
        queryClient.invalidateQueries(['userSubscriptions', user.id]);
      }
    });
    
    const updateMutation = useMutation({
      mutationFn: ({ subscriptionId, subscriptionData }) => 
        userAPI.updateUserSubscription(subscriptionId, subscriptionData),
      onSuccess: () => {
        queryClient.invalidateQueries(['userSubscriptions', user.id]);
      }
    });
    
    const pauseMutation = useMutation({
      mutationFn: ({ subscriptionId, pauseReason }) => 
        userAPI.pauseUserSubscription(subscriptionId, pauseReason),
      onSuccess: () => {
        queryClient.invalidateQueries(['userSubscriptions', user.id]);
      }
    });
    
    const resumeMutation = useMutation({
      mutationFn: ({ subscriptionId, resumeDate }) => 
        userAPI.resumeUserSubscription(subscriptionId, resumeDate),
      onSuccess: () => {
        queryClient.invalidateQueries(['userSubscriptions', user.id]);
      }
    });
    
    return {
      subscriptions: subscriptionsQuery.data || [],
      isLoading: subscriptionsQuery.isLoading,
      isError: subscriptionsQuery.isError,
      error: subscriptionsQuery.error,
      createSubscription: createMutation.mutateAsync,
      updateSubscription: updateMutation.mutateAsync,
      pauseSubscription: pauseMutation.mutateAsync,
      resumeSubscription: resumeMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isPausing: pauseMutation.isPending,
      isResuming: resumeMutation.isPending
    };
  };