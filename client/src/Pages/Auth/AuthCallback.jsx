import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Contexts/AuthContext';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { Box, Spinner, Text, VStack, Button, Code } from '@chakra-ui/react';
import { useElements } from '../../Contexts/ElementsContext';
import { supabase } from '../../../supabaseClient';

const MAX_WAIT_TIME = 20000; // 20 seconds
const PROCESSING_KEY = 'saucia:authCallbackProcessing';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, consumePendingRedirect, isLoading, session } = useAuthContext();
  const { setSelectedPlan } = useChosenPlanContext();
  const { plans } = useElements();
  
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const hasProcessedRef = useRef(false);
  const timeoutRef = useRef(null);
  const redirectAttemptedRef = useRef(false);

  // Helper to add debug logs
  const addLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    setDebugLog(prev => [...prev, data ? `${logEntry}: ${JSON.stringify(data)}` : logEntry]);
  };

  // Effect 1: Handle initial code exchange
  useEffect(() => {
    if (hasProcessedRef.current) return;

    const handleCodeExchange = async () => {
      try {
        hasProcessedRef.current = true;
        sessionStorage.setItem(PROCESSING_KEY, Date.now().toString());

        setStatus('checking_url');
        addLog('Starting auth callback');
        
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        addLog('URL params', { hasCode: !!code, error });

        if (error) {
          setError(`Authentication failed: ${errorDescription || error}`);
          setStatus('error');
          sessionStorage.removeItem(PROCESSING_KEY);
          return;
        }

        if (code) {
          setStatus('exchanging_code');
          addLog('Exchanging code for session');
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            addLog('Exchange failed', exchangeError);
            setError(`Session creation failed: ${exchangeError.message}`);
            setStatus('error');
            sessionStorage.removeItem(PROCESSING_KEY);
            return;
          }
          
          addLog('Exchange successful', { 
            userId: data?.session?.user?.id,
            hasSession: !!data?.session 
          });

          // Force check the session immediately
          setStatus('verifying_session');
          addLog('Verifying session in Supabase');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            addLog('Session verification failed', sessionError);
          } else {
            addLog('Session verified', {
              userId: sessionData?.session?.user?.id,
              email: sessionData?.session?.user?.email
            });
          }
        } else {
          addLog('No code in URL, checking existing session');
          const { data: sessionData } = await supabase.auth.getSession();
          addLog('Existing session', { 
            hasSession: !!sessionData?.session,
            userId: sessionData?.session?.user?.id 
          });
        }

        setStatus('waiting_auth');
        addLog('Waiting for AuthContext to update');

        // Set timeout
        timeoutRef.current = setTimeout(() => {
          addLog('TIMEOUT: AuthContext did not update in time', {
            isLoading,
            hasUser: !!user,
            hasSession: !!session
          });
          setError('Authentication is taking too long. The session was created but the app state did not update.');
          setStatus('timeout');
          sessionStorage.removeItem(PROCESSING_KEY);
        }, MAX_WAIT_TIME);

      } catch (err) {
        addLog('Unexpected error', err);
        setError(`Unexpected error: ${err.message}`);
        setStatus('error');
        sessionStorage.removeItem(PROCESSING_KEY);
      }
    };

    handleCodeExchange();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Effect 2: Handle redirect once user is loaded
  useEffect(() => {
    // Don't run until we've processed the code
    if (!hasProcessedRef.current) return;
    
    // Don't run if we're in error/timeout state
    if (status === 'error' || status === 'timeout') return;
    
    // Don't run if we've already attempted redirect
    if (redirectAttemptedRef.current) return;

    addLog('Redirect effect triggered', { 
      isLoading, 
      hasUser: !!user, 
      hasSession: !!session,
      status 
    });

    // Wait for loading to complete
    if (isLoading) {
      addLog('Still loading, waiting...');
      return;
    }

    // Check if we have user OR session (sometimes user loads slower)
    const hasAuth = user || session?.user;
    
    if (!hasAuth) {
      addLog('No auth detected yet', { user, session: !!session });
      
      // If we've been waiting too long in waiting_auth, try to force getSession
      if (status === 'waiting_auth') {
        addLog('Forcing session check');
        supabase.auth.getSession().then(({ data, error }) => {
          addLog('Forced session check result', { 
            hasSession: !!data?.session,
            userId: data?.session?.user?.id,
            error 
          });
        });
      }
      return;
    }

    // We have auth! Proceed with redirect
    redirectAttemptedRef.current = true;
    
    const handleRedirect = async () => {
      try {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setStatus('redirecting');
        addLog('Starting redirect process', { userId: user?.id || session?.user?.id });

        // Use user from context or session
        const authUser = user || session?.user;
        
        // Get pending redirect
        const pendingRedirect = consumePendingRedirect();
        addLog('Pending redirect', pendingRedirect);

        if (pendingRedirect) {
          // Handle subscription flow
          if (pendingRedirect.reason === 'subscription_flow' && pendingRedirect.planId && plans?.length > 0) {
            const selectedPlan = plans.find(plan => plan.id === pendingRedirect.planId);

            if (selectedPlan) {
              await setSelectedPlan(selectedPlan);
              addLog('Navigating to premium/join with plan', { planId: selectedPlan.id });
              
              sessionStorage.removeItem(PROCESSING_KEY);
              navigate('/premium/join', {
                state: {
                  planId: pendingRedirect.planId,
                  selectedTerm: pendingRedirect.selectedTerm,
                  fromAuthCallback: true,
                  planTitle: selectedPlan.title
                },
                replace: true,
              });
              return;
            }
          }

          // Generic redirect
          addLog('Navigating to pending redirect path', { path: pendingRedirect.path });
          sessionStorage.removeItem(PROCESSING_KEY);
          navigate(pendingRedirect.path || '/account', { replace: true });
          return;
        }

        // Check profile completion (use user from context or directly from session)
        const profileCompleted = user?.profileCompleted ?? authUser?.user_metadata?.profile_completed;
        
        if (profileCompleted === false) {
          addLog('Profile incomplete, redirecting to complete-profile');
          sessionStorage.removeItem(PROCESSING_KEY);
          navigate('/auth/complete-profile', { replace: true });
          return;
        }

        // Default redirect
        addLog('No special redirect, going to account');
        sessionStorage.removeItem(PROCESSING_KEY);
        navigate('/account', { replace: true });
        
      } catch (err) {
        addLog('Redirect error', err);
        setError(`Navigation error: ${err.message}`);
        setStatus('error');
        sessionStorage.removeItem(PROCESSING_KEY);
      }
    };

    handleRedirect();
  }, [user, session, isLoading, status]);

  // Force redirect button for stuck state
  const forceRedirect = async () => {
    addLog('User forced redirect');
    redirectAttemptedRef.current = true;
    sessionStorage.removeItem(PROCESSING_KEY);
    
    // Try to get session one more time
    const { data } = await supabase.auth.getSession();
    
    if (data?.session) {
      addLog('Session found on force redirect', { userId: data.session.user.id });
      navigate('/account', { replace: true });
    } else {
      addLog('No session on force redirect');
      navigate('/auth', { replace: true });
    }
  };

  // Error/Timeout UI
  if (error || status === 'error' || status === 'timeout') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" bg="gray.50">
        <VStack spacing={4} maxW="2xl" textAlign="center" p={6}>
          <Text fontSize="xl" fontWeight="bold" color="red.500">
            {status === 'timeout' ? 'Connection Timeout' : 'Authentication Error'}
          </Text>
          <Text fontSize="md" color="gray.600">{error}</Text>
          
          {/* Debug logs */}
          <Box w="full" maxH="200px" overflowY="auto" bg="gray.100" p={3} borderRadius="md">
            <Text fontSize="xs" fontWeight="bold" mb={2}>Debug Log:</Text>
            {debugLog.map((log, i) => (
              <Code key={i} display="block" fontSize="xs" mb={1} p={1}>
                {log}
              </Code>
            ))}
          </Box>

          <VStack spacing={2} w="full">
            <Button colorScheme="brand" onClick={forceRedirect} w="full">
              Force Continue
            </Button>
            <Button variant="outline" onClick={() => {
              sessionStorage.removeItem(PROCESSING_KEY);
              window.location.href = '/auth';
            }} w="full">
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => {
              sessionStorage.removeItem(PROCESSING_KEY);
              window.location.href = '/';
            }}>
              Go to Home
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Loading UI
  const getStatusMessage = () => {
    switch (status) {
      case 'initializing': return 'Initializing...';
      case 'checking_url': return 'Checking authorization...';
      case 'exchanging_code': return 'Creating session...';
      case 'verifying_session': return 'Verifying session...';
      case 'waiting_auth': return 'Loading your account...';
      case 'redirecting': return 'Setting up your experience...';
      default: return 'Processing...';
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" bg="gray.50">
      <VStack spacing={4} maxW="xl" p={6}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text fontSize="lg" fontWeight="semibold">{getStatusMessage()}</Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Please wait while we complete your sign in
        </Text>

        {/* Show latest debug logs */}
        <Box w="full" bg="gray.100" p={3} borderRadius="md" fontSize="xs">
          <Text fontWeight="bold" mb={2}>Status:</Text>
          {debugLog.slice(-5).map((log, i) => (
            <Text key={i} fontFamily="mono" color="gray.600" mb={1}>
              {log}
            </Text>
          ))}
        </Box>

        {/* Show force button after 10 seconds */}
        {status === 'waiting_auth' && (
          <Button size="sm" variant="outline" onClick={forceRedirect} mt={4}>
            Taking too long? Click to continue
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default AuthCallback;