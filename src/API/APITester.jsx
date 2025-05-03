import { useEffect, useState } from 'react';
import { authenticatedApi, publicApi } from './apiClient';
import { useUser } from '../Contexts/UserContext';
import { auth } from '../../firebaseConfig'; // Correctly import the auth object
import {
  Box, 
  Button, 
  Heading, 
  Text, 
  VStack, 
  Code, 
  Divider,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react';

const ApiTester = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const { user } = useUser();

  // Function to get the auth token
  const getAuthToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    throw new Error('No authenticated user');
  };

  // Check if the server is running
  const checkServerStatus = async () => {
    try {
      const status = await publicApi.health();
      setServerStatus({ success: true, message: 'Server is running' });
      return true;
    } catch (err) {
      setServerStatus({ 
        success: false, 
        message: 'Could not connect to server. Is it running?' 
      });
      return false;
    }
  };

  const testEndpoints = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Check server first
      const serverRunning = await checkServerStatus();
      if (!serverRunning) {
        setIsLoading(false);
        return;
      }

      // Test auth token
      const token = await getAuthToken();
      console.log('Auth token available:', !!token);

      // Try the user endpoint
      try {
        const userResponse = await authenticatedApi.users.get(user?.uid);
        setResponse([userResponse.data]);
      } catch (err) {
        console.error('User endpoint error:', err);
        setError({
          message: `API Error: ${err.message}`,
          status: err.response?.status,
          data: err.response?.data,
          endpoint: '/users/' + user?.uid
        });
      }
    } catch (err) {
      console.error('Error in testEndpoints:', err);
      setError({
        message: err.message,
        detail: 'See console for more information'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkServerStatus();
    }
  }, [user]);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>API Tester</Heading>
      
      {/* Server status */}
      {serverStatus && (
        <Alert 
          status={serverStatus.success ? "success" : "error"}
          mb={4}
        >
          <AlertIcon />
          {serverStatus.message}
        </Alert>
      )}
      
      {/* User info */}
      {user && (
        <Box mb={4}>
          <Text fontWeight="bold">Testing with user:</Text>
          <Code p={2} display="block" whiteSpace="pre-wrap">
            {JSON.stringify({ 
              uid: user.uid,
              email: user.email,
              isAdmin: user.isAdmin 
            }, null, 2)}
          </Code>
        </Box>
      )}
      
      <Button 
        colorScheme="blue" 
        onClick={testEndpoints} 
        isLoading={isLoading}
        loadingText="Testing..."
        mb={4}
      >
        Test API Endpoints
      </Button>
      
      <Divider my={4} />
      
      {/* Error display */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={2} width="100%">
            <Text fontWeight="bold">{error.message}</Text>
            {error.status && <Text>Status: {error.status}</Text>}
            {error.endpoint && <Text>Endpoint: {error.endpoint}</Text>}
            {error.data && (
              <Code p={2} display="block" whiteSpace="pre-wrap">
                {JSON.stringify(error.data, null, 2)}
              </Code>
            )}
          </VStack>
        </Alert>
      )}
      
      {/* Response display */}
      {response && (
        <Box>
          <Text fontWeight="bold" mb={2}>API Response:</Text>
          <Code p={2} display="block" whiteSpace="pre-wrap" maxHeight="400px" overflow="auto">
            {JSON.stringify(response, null, 2)}
          </Code>
        </Box>
      )}
    </Box>
  );
};

export default ApiTester;