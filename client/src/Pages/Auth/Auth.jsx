import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../../supabaseClient'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useEffect } from 'react'
export default function OAuth() {
  const { 
    user, 
    isLoading, 
    error, 
    logout,
    supabaseSession,
    requiresCompletion 
  } = useAuthContext();
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboardClick = () => {
    if (requiresCompletion) {
      navigate('/complete-profile');
    } else {
      navigate('/account');
    }
  };
  //timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.error('Auth loading timeout');
        setError('Authentication timed out. Please refresh the page.');
      }
    }, 10000); // 10 second timeout
  
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <Container maxW="md" py={10}>
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg={useColorModeValue('white', 'gray.700')}
          textAlign="center"
        >
          <Spinner size="lg" color="blue.500" />
          <Text mt={4}>Loading...</Text>
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxW="md" py={10}>
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg={useColorModeValue('white', 'gray.700')}
        >
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        </Box>
      </Container>
    );
  }

  // Show login form if not authenticated
  if (!user || !supabaseSession) {
    return (
      <Container maxW="md" py={10}>
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg={useColorModeValue('white', 'gray.700')}
        >
          <VStack spacing={4} mb={6}>
            <Heading size="lg" textAlign="center">
              Welcome
            </Heading>
            <Text color="gray.600" textAlign="center">
              Sign in to continue to your account
            </Text>
          </VStack>
          
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onlyThirdPartyProviders
            redirectTo={window.location.origin}
          />
        </Box>
      </Container>
    );
  }

  // Show authenticated state
  return (
    <Container maxW="xl" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg={useColorModeValue('white', 'gray.700')}
      >
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="green.500">
            Successfully Logged In! 🎉
          </Heading>
          
          <Box>
            <Text fontSize="sm" color="gray.600">
              <strong>Email:</strong> {user.email}
            </Text>
            <Text>Name: {user.display_name || 'Not provided'}</Text>
            <Text>Role: {user.is_admin ? 'Administrator' : 'User'}</Text>
            <Text fontSize="sm" color="gray.600">
              <strong>Profile Status:</strong> {user.profile_completed ? 'Complete' : 'Incomplete'}
            </Text>
           
          </Box>
          
          <Heading size="lg">
            Welcome back, {user.displayName || user.email}!
          </Heading>
          
          {requiresCompletion && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Profile Incomplete</AlertTitle>
                <AlertDescription>
                  Please complete your profile to access all features.
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <VStack spacing={3}>
            <Button 
              colorScheme="blue" 
              onClick={handleDashboardClick}
              size="lg"
              w="full"
            >
              {requiresCompletion ? 'Complete Profile' : 'Go to Dashboard'}
            </Button>
            
            <Button 
              colorScheme="red" 
              variant="outline"
              onClick={handleLogout}
              size="md"
              w="full"
            >
              Logout
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Container>
  );
}