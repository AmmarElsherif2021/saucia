import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../API/userAPI';
import { useAuthContext } from '../Contexts/AuthContext';

// 1. Payment Methods Hooks
export const usePaymentMethods = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const paymentsQuery = useQuery({
    queryKey: ['paymentMethods', user?.id],
    queryFn: () => userAPI.getUserPaymentMethods(user.id),
    enabled: !!user?.id
  });
  
  const addMutation = useMutation({
    mutationFn: (paymentData) => 
      userAPI.createUserPaymentMethod(user.id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentMethods', user.id]);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ paymentMethodId, paymentData }) => 
      userAPI.updateUserPaymentMethod(paymentMethodId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentMethods', user.id]);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (paymentMethodId) => 
      userAPI.deleteUserPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentMethods', user.id]);
    }
  });
  
  return {
    paymentMethods: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    isError: paymentsQuery.isError,
    error: paymentsQuery.error,
    addPaymentMethod: addMutation.mutateAsync,
    updatePaymentMethod: updateMutation.mutateAsync,
    deletePaymentMethod: deleteMutation.mutateAsync,
    isAddingPayment: addMutation.isPending,
    isUpdatingPayment: updateMutation.isPending,
    isDeletingPayment: deleteMutation.isPending
  };
};

