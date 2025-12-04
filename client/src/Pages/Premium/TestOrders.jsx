import { useEffect, useState } from 'react';
import { Box, Button, VStack, Text, Spinner, Alert, AlertIcon, Code } from '@chakra-ui/react';
import { useOrders } from '../../Hooks/useOrders';
import { useAuthContext } from '../../Contexts/AuthContext';
import { supabase } from '../../../supabaseClient';


function TokenDebug() {
  const [tokenInfo, setTokenInfo] = useState(null);

  const analyzeToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      setTokenInfo({ error: error.message });
      return;
    }

    if (!session) {
      setTokenInfo({ error: 'No session found' });
      return;
    }

    // Parse JWT to see what's inside
    const token = session.access_token;
    const parts = token.split('.');
    
    let payload = null;
    try {
      payload = JSON.parse(atob(parts[1]));
    } catch (e) {
      payload = 'Could not parse token';
    }

    setTokenInfo({
      tokenType: session.token_type,
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
      expiresIn: session.expires_in,
      user: {
        id: session.user.id,
        email: session.user.email,
        provider: session.user.app_metadata?.provider,
        providers: session.user.app_metadata?.providers,
      },
      tokenPayload: payload,
      refreshToken: session.refresh_token ? 'Present' : 'Missing'
    });
  };

  const testAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    setTokenInfo(prev => ({
      ...prev,
      authTest: {
        success: !!user,
        error: error?.message,
        userId: user?.id
      }
    }));
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">🔍 Token Debug Tool</Text>
        
        <Button onClick={analyzeToken} colorScheme="blue">
          Analyze Token
        </Button>
        
        <Button onClick={testAuth} colorScheme="green">
          Test Auth.getUser()
        </Button>

        {tokenInfo && (
          <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
            {JSON.stringify(tokenInfo, null, 2)}
          </Code>
        )}
      </VStack>
    </Box>
  );
}

export default function TestOrders() {
  const {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchLastUserOrder,
    fetchLastUserSubOrder,
    updateOrder,
    createUserOrder
  } = useOrders();
  
  const { user,subscription } = useAuthContext();
  const [testResults, setTestResults] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0,
        error: error?.message || null,
        sessionData: session ? {
          user: session.user?.email,
          expiresAt: session.expires_at
        } : null
      });
    };
    checkSession();
  }, []);

  const addTestResult = (test, success, data) => {
    setTestResults(prev => [...prev, { test, success, data, time: new Date().toISOString() }]);
  };

  // Test 1: Fetch User Orders
  const testFetchUserOrders = async () => {
    try {
      console.log('Testing: fetchUserOrders');
      console.log('Session info:', sessionInfo);
      
      // Try without passing user ID first (let auth handle it)
      const result = await fetchUserOrders(user.id);
      console.log('✓ Fetch User Orders Success:', result);
      addTestResult('fetchUserOrders', true, result);
    } catch (err) {
      console.error('✗ Fetch User Orders Failed:', err);
      addTestResult('fetchUserOrders', false, err.message);
    }
  };

  // Test 2: Fetch Last user order
  const testfetchLastUserOrder = async () => {
    if (orders.length === 0) {
      alert('Please fetch orders first');
      return;
    }
    
    try {
      const orderId = orders[0].id;
      console.log('Testing: fetchLastUserOrder with USER_ID:', user.id);
      const result = await fetchLastUserOrder(user.id);
      console.log('✓ Fetch Last order Success:', result);
      addTestResult('fetchLastUserOrder', true, result);
    } catch (err) {
      console.error('✗ Fetch Last Order Failed:', err);
      addTestResult('fetchLastUserOrder', false, err.message);
    }
  };
  // Test 3: Fetch Last user order
  const testfetchLastUserSubOrder = async () => {
    if (orders.length === 0) {
      alert('Please fetch orders first');
      return;
    }
    
    try {
      const orderId = orders[0].id;
      console.log('Testing: fetchLastUserOrder with USER_ID:', user.id);
      const result = await fetchLastUserOrder(user.id,subscription.id)
      console.log('✓ Fetch Last order Success:', result);
      addTestResult('fetchLastUserOrder', true, result);
    } catch (err) {
      console.error('✗ Fetch Last Order Failed:', err);
      addTestResult('fetchLastUserOrder', false, err.message);
    }
  };

  // Test 3: Update Order
  const testUpdateOrder = async () => {
    if (orders.length === 0) {
      alert('Please fetch orders first');
      return;
    }

    try {
      const orderId = orders[0].id;
      console.log('Testing: updateOrder with ID:', orderId);
      const result = await updateOrder(orderId, {
        special_instructions: `Test update at ${new Date().toISOString()}`
      });
      console.log('✓ Update Order Success:', result);
      addTestResult('updateOrder', true, result);
    } catch (err) {
      console.error('✗ Update Order Failed:', err);
      addTestResult('updateOrder', false, err.message);
    }
  };

  // Test 4: Create Test Order
  const testCreateOrder = async () => {
    try {
      console.log('Testing: createUserOrder');
      const testOrder = {
        total_amount: 100.00,
        status: 'pending',
        payment_status: 'pending',
        delivery_instructions: 'Test order from hook test',
        scheduled_delivery_date: new Date().toISOString()
      };
      const result = await createUserOrder(testOrder);
      console.log('✓ Create Order Success:', result);
      addTestResult('createUserOrder', true, result);
    } catch (err) {
      console.error('✗ Create Order Failed:', err);
      addTestResult('createUserOrder', false, err.message);
    }
  };

  // Manual session refresh
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSessionInfo({
        hasSession: !!data.session,
        hasAccessToken: !!data.session?.access_token,
        tokenLength: data.session?.access_token?.length || 0,
        error: null,
        sessionData: data.session ? {
          user: data.session.user?.email,
          expiresAt: data.session.expires_at
        } : null,
        refreshed: true
      });
      
      alert('Session refreshed successfully!');
    } catch (err) {
      alert('Failed to refresh session: ' + err.message);
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          🧪 Edge Functions Test Suite
        </Text>
        
        <Text>
          User id : {user ? JSON.stringify(user) : 'No user logged in'}
          subscription data: {subscription ? JSON.stringify(subscription) : 'No subscription data'}
        </Text>
        {/* Token debug */}
        <TokenDebug/>
        {/* Session Debug Info */}
        <Box borderWidth={1} borderColor="blue.200" p={4} borderRadius="md" bg="blue.50">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            🔐 Session Debug Info:
          </Text>
          <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
            {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'Loading session info...'}
          </Code>
          <Button mt={2} size="sm" onClick={refreshSession} colorScheme="blue">
            Refresh Session
          </Button>
        </Box>

        {/* Test Buttons */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Run Tests:
          </Text>
          <VStack spacing={2} align="stretch">
            <Button onClick={testFetchUserOrders} colorScheme="blue" isLoading={loading}>
              Test 1: Fetch User Orders
            </Button>
            <Button onClick={testfetchLastUserOrder} colorScheme="green" isLoading={loading}>
              Test 2: Fetch Last User Order
            </Button>
            <Button onClick={testfetchLastUserSubOrder} colorScheme="orange" isLoading={loading}>
              Test 3: fetch last sub. order
            </Button>
            <Button onClick={testCreateOrder} colorScheme="purple" isLoading={loading}>
              Test 4: Create User Order
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              colorScheme="red" 
              variant="outline"
            >
              Clear Results
            </Button>
          </VStack>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={4}>
            <Spinner size="lg" />
            <Text mt={2}>Testing...</Text>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error:</Text>
              <Text>{error.message}</Text>
            </Box>
          </Alert>
        )}

        {/* Current Orders */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Current Orders ({orders.length}):
          </Text>
          {orders.length > 0 ? (
            <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
              {JSON.stringify(orders, null, 2)}
            </Code>
          ) : (
            <Text color="gray.500">No orders loaded yet</Text>
          )}
        </Box>

        {/* Test Results */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Test Results ({testResults.length}):
          </Text>
          {testResults.length > 0 ? (
            <VStack spacing={2} align="stretch">
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  status={result.success ? "success" : "error"}
                  flexDirection="column"
                  alignItems="flex-start"
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <AlertIcon />
                    <Text fontWeight="bold">
                      {result.test} - {result.success ? '✓ SUCCESS' : '✗ FAILED'}
                    </Text>
                  </Box>
                  <Code p={2} borderRadius="md" width="100%" whiteSpace="pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </Code>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {new Date(result.time).toLocaleString()}
                  </Text>
                </Alert>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No test results yet. Run a test above!</Text>
          )}
        </Box>

        {/* Environment Check */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Environment Check:
          </Text>
          <Code p={4} borderRadius="md" display="block">
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
            <br />
            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
            <br />
            Functions URL: {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1`}
          </Code>
        </Box>
      </VStack>
    </Box>
  );
}