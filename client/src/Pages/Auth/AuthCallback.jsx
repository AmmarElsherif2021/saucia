import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Contexts/AuthContext';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { useElements } from '../../Contexts/ElementsContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, consumePendingRedirect, isLoading } = useAuthContext();
  const { setSelectedPlan } = useChosenPlanContext();
  const { plans } = useElements();
  const [processingRedirect, setProcessingRedirect] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Wait for auth to fully initialize
      if (isLoading) return;
      
      if (user) {
        setProcessingRedirect(true);
        
        // Consume the pending redirect
        const pendingRedirect = consumePendingRedirect();
        
        console.log('Auth callback - pending redirect:', pendingRedirect);
        
        if (pendingRedirect) {
          const { path, planId, selectedTerm, reason } = pendingRedirect;
          
          // If it's a subscription flow with plan context
          if (reason === 'subscription_flow' && planId && plans?.length > 0) {
            const selectedPlan = plans.find(plan => plan.id === planId);
            
            if (selectedPlan) {
              // Set the plan in context before redirecting
              await setSelectedPlan(selectedPlan);
              
              // Navigate with state for additional context
              navigate(path, {
                state: {
                  planId,
                  selectedTerm,
                  fromAuthCallback: true,
                  planTitle: selectedPlan.title
                },
                replace: true
              });
              return;
            }
          }
          
          // Fallback to the stored path
          navigate(pendingRedirect.path || '/', { replace: true });
          return;
        }
        
        // Check for profile completion requirement
        if (user.profileCompleted === false) {
          navigate('/auth/complete-profile', { replace: true });
          return;
        }
        
        // Default redirect to home
        navigate('/', { replace: true });
      }
    };

    // Add a small delay to ensure all contexts are ready
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [user, isLoading, consumePendingRedirect, navigate, setSelectedPlan, plans]);

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minH="100vh"
      bg="gray.50"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="brand.500" />
        <Text fontSize="lg" fontWeight="semibold">
          {processingRedirect ? 'Setting up your experience...' : 'Completing sign in...'}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Please wait while we redirect you
        </Text>
      </VStack>
    </Box>
  );
};

export default AuthCallback;